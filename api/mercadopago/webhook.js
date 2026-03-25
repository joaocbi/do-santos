const crypto = require("crypto");
const { readJsonFile, writeJsonFile } = require("../_lib/store");

function validateSignature(req) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET || "";
  const signature = req.headers["x-signature"] || "";

  if (!secret) {
    return {
      valid: false,
      mode: "secret_not_configured",
    };
  }

  if (!signature) {
    return {
      valid: false,
      mode: "signature_missing",
    };
  }

  const bodyString = JSON.stringify(req.body || {});
  const expectedSignature = crypto.createHmac("sha256", secret).update(bodyString).digest("hex");

  return {
    valid: signature.includes(expectedSignature),
    mode: "validated",
    expectedSignature,
  };
}

function appendWebhookLog(logEntry) {
  const logs = readJsonFile("webhook-logs.json", []);
  logs.unshift(logEntry);
  writeJsonFile("webhook-logs.json", logs.slice(0, 100));
}

module.exports = async function handler(req, res) {
  const requestMethod = req.method || "GET";
  const body = req.body || null;
  const query = req.query || {};
  const headers = req.headers || {};
  const signatureStatus = validateSignature(req);

  console.log("Mercado Pago webhook recebido", {
    method: requestMethod,
    query,
    headers: {
      "x-signature": headers["x-signature"] || "",
      "x-request-id": headers["x-request-id"] || "",
      "content-type": headers["content-type"] || "",
    },
    body,
    signatureStatus,
  });

  if (requestMethod === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Webhook Mercado Pago ativo.",
      endpoint: "/api/mercadopago/webhook",
      validation: "Configure MERCADO_PAGO_WEBHOOK_SECRET para validar a assinatura.",
    });
  }

  if (requestMethod !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Metodo nao permitido.",
    });
  }

  const logEntry = {
    id: `log-${Date.now()}`,
    receivedAt: new Date().toISOString(),
    method: requestMethod,
    query,
    headers: {
      "x-signature": headers["x-signature"] || "",
      "x-request-id": headers["x-request-id"] || "",
      "content-type": headers["content-type"] || "",
    },
    body,
    signatureStatus,
  };

  appendWebhookLog(logEntry);

  return res.status(200).json({
    ok: true,
    message: "Webhook recebido com sucesso.",
    receivedAt: new Date().toISOString(),
    signatureStatus,
  });
};
