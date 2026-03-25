const fs = require("fs");
const path = require("path");

const dataDirectory = path.join(process.cwd(), ".data");

function ensureDirectory() {
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, { recursive: true });
  }
}

function getFilePath(fileName) {
  ensureDirectory();
  return path.join(dataDirectory, fileName);
}

function readJsonFile(fileName, fallback) {
  const filePath = getFilePath(fileName);

  if (!fs.existsSync(filePath)) {
    return fallback;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Erro ao ler ${fileName}:`, error);
    return fallback;
  }
}

function writeJsonFile(fileName, data) {
  const filePath = getFilePath(fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

module.exports = {
  readJsonFile,
  writeJsonFile,
};
