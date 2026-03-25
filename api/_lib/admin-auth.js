const crypto = require("crypto");
const { readData, writeData } = require("./store");

const ADMIN_AUTH_KEY = "admin-auth.json";

function normalizePassword(password) {
  return String(password || "").replace(/\r/g, "").trim();
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(normalizePassword(password)).digest("hex");
}

async function resolveAdminAuth() {
  const storedAuth = await readData(ADMIN_AUTH_KEY, null);

  if (storedAuth?.passwordHash) {
    return {
      passwordHash: storedAuth.passwordHash,
      source: "storage",
      updatedAt: storedAuth.updatedAt || null,
    };
  }

  const environmentPassword = normalizePassword(process.env.ADMIN_PANEL_PASSWORD);

  if (!environmentPassword) {
    return {
      passwordHash: "",
      source: "missing",
      updatedAt: null,
    };
  }

  return {
    passwordHash: hashPassword(environmentPassword),
    source: "environment",
    updatedAt: null,
  };
}

async function validateAdminPassword(password) {
  const auth = await resolveAdminAuth();

  if (!auth.passwordHash) {
    return {
      valid: false,
      source: auth.source,
    };
  }

  return {
    valid: hashPassword(password) === auth.passwordHash,
    source: auth.source,
  };
}

async function updateAdminPassword(newPassword) {
  const normalizedPassword = normalizePassword(newPassword);
  const nextAuth = {
    passwordHash: hashPassword(normalizedPassword),
    updatedAt: new Date().toISOString(),
  };

  await writeData(ADMIN_AUTH_KEY, nextAuth);

  console.log("Admin password updated in persistent storage.", {
    updatedAt: nextAuth.updatedAt,
  });

  return nextAuth;
}

module.exports = {
  normalizePassword,
  resolveAdminAuth,
  validateAdminPassword,
  updateAdminPassword,
};
