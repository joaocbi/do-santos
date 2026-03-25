const { readJsonFile } = require("../_lib/store");

module.exports = async function handler(req, res) {
  if ((req.method || "GET") !== "GET") {
    return res.status(405).json({
      ok: false,
      message: "Metodo nao permitido.",
    });
  }

  const logs = readJsonFile("webhook-logs.json", []);

  return res.status(200).json({
    ok: true,
    total: logs.length,
    logs,
  });
};
