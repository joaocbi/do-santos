const { readData, isKvEnabled } = require("../_lib/store");

module.exports = async function handler(req, res) {
  if ((req.method || "GET") !== "GET") {
    return res.status(405).json({
      ok: false,
      message: "Metodo nao permitido.",
    });
  }

  const logs = await readData("webhook-logs.json", []);

  return res.status(200).json({
    ok: true,
    total: logs.length,
    logs,
    storage: (await isKvEnabled()) ? "upstash-redis" : "local-fallback",
  });
};
