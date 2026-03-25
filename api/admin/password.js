const { resolveAdminAuth, validateAdminPassword, updateAdminPassword } = require("../_lib/admin-auth");

module.exports = async function handler(req, res) {
  const method = req.method || "GET";

  if (method === "GET") {
    const auth = await resolveAdminAuth();

    return res.status(200).json({
      ok: true,
      source: auth.source,
      updatedAt: auth.updatedAt,
    });
  }

  if (method !== "POST") {
    return res.status(405).json({
      ok: false,
      message: "Metodo nao permitido.",
    });
  }

  const body = req.body || {};
  const currentPassword = String(body.currentPassword || "").trim();
  const newPassword = String(body.newPassword || "").trim();
  const confirmPassword = String(body.confirmPassword || "").trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      ok: false,
      message: "Preencha todos os campos de senha.",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      ok: false,
      message: "A nova senha deve ter pelo menos 6 caracteres.",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      ok: false,
      message: "A confirmação da nova senha não confere.",
    });
  }

  const validation = await validateAdminPassword(currentPassword);

  if (validation.source === "missing") {
    return res.status(503).json({
      ok: false,
      message: "A senha do painel não está configurada no ambiente.",
    });
  }

  if (!validation.valid) {
    return res.status(401).json({
      ok: false,
      message: "A senha atual está incorreta.",
    });
  }

  await updateAdminPassword(newPassword);

  return res.status(200).json({
    ok: true,
    message: "Senha do painel atualizada com sucesso.",
  });
};
