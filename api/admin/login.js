module.exports = async function handler(req, res) {
  if ((req.method || "GET") !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Metodo nao permitido.",
    });
  }

  const body = req.body || {};
  const password = body.password || "";
  const configuredPassword = process.env.ADMIN_PANEL_PASSWORD || "";

  if (!configuredPassword) {
    return res.status(503).json({
      ok: false,
      message: "A senha do painel não está configurada no ambiente.",
    });
  }

  if (password !== configuredPassword) {
    return res.status(401).json({
      ok: false,
      message: "Senha inválida.",
    });
  }

  return res.status(200).json({
    ok: true,
    message: "Login realizado com sucesso.",
  });
};
