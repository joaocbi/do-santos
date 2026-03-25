const fs = require("fs");
const path = require("path");

const dataDirectory = path.join(process.cwd(), ".data");
let redisClientPromise = null;

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
    console.error(`Failed to read ${fileName} from local fallback storage.`, error);
    return fallback;
  }
}

function writeJsonFile(fileName, data) {
  const filePath = getFilePath(fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function getKvClient() {
  if (redisClientPromise) {
    return redisClientPromise;
  }

  redisClientPromise = import("@upstash/redis")
    .then(({ Redis }) => Redis.fromEnv())
    .catch(() => null);

  return redisClientPromise;
}

async function isKvEnabled() {
  return Boolean(
    process.env.KV_REST_API_URL &&
      process.env.KV_REST_API_TOKEN &&
      (await getKvClient())
  );
}

async function readData(key, fallback) {
  if (await isKvEnabled()) {
    try {
      const redis = await getKvClient();
      const result = await redis.get(key);
      return result ?? fallback;
    } catch (error) {
      console.error(`Failed to read ${key} from Upstash Redis.`, error);
      return fallback;
    }
  }

  return readJsonFile(key, fallback);
}

async function writeData(key, data) {
  if (await isKvEnabled()) {
    try {
      const redis = await getKvClient();
      await redis.set(key, data);
      return;
    } catch (error) {
      console.error(`Failed to write ${key} to Upstash Redis.`, error);
    }
  }

  writeJsonFile(key, data);
}

module.exports = {
  isKvEnabled,
  readData,
  readJsonFile,
  writeData,
  writeJsonFile,
};
