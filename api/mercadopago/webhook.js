module.exports = async function handler(req, res) {
  const requestMethod = req.method || "GET";
  const body = req.body || null;
  const query = req.query || {};
  const headers = req.headers || {};

  console.log("Mercado Pago webhook recebido", {
    method: requestMethod,
    query,
    headers: {
      "x-signature": headers["x-signature"] || "",
      "x-request-id": headers["x-request-id"] || "",
      "content-type": headers["content-type"] || "",
    },
    body,
  });

  if (requestMethod === "GET") {
    return res.status(200).json({
      ok: true,
      message: "Webhook Mercado Pago ativo.",
      endpoint: "/api/mercadopago/webhook",
    });
  }

  if (requestMethod !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Metodo nao permitido.",
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Webhook recebido com sucesso.",
    receivedAt: new Date().toISOString(),
  });
};
