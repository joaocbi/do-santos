const { validateAdminPassword } = require("../_lib/admin-auth");

module.exports = async function handler(req, res) {
  if ((req.method || "GET") !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Metodo nao permitido.",
    });
  }

  const body = req.body || {};
  const password = body.password || "";
  const validation = await validateAdminPassword(password);

  if (validation.source === "missing") {
    return res.status(503).json({
      ok: false,
      message: "A senha do painel não está configurada no ambiente.",
    });
  }

  if (!validation.valid) {
    return res.status(401).json({
      ok: false,
      message: "Senha inválida.",
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Login realizado com sucesso.",
    source: validation.source,
  });
};
