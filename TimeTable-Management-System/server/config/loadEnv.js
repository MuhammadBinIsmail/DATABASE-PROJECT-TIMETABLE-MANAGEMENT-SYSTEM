const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

function decodeEnvBuffer(buffer) {
  if (buffer.length >= 2) {
    const b0 = buffer[0];
    const b1 = buffer[1];

    if (b0 === 0xff && b1 === 0xfe) {
      return buffer.toString("utf16le", 2);
    }

    if (b0 === 0xfe && b1 === 0xff) {
      const swapped = Buffer.from(buffer.slice(2));
      for (let i = 0; i + 1 < swapped.length; i += 2) {
        const tmp = swapped[i];
        swapped[i] = swapped[i + 1];
        swapped[i + 1] = tmp;
      }
      return swapped.toString("utf16le");
    }
  }

  const text = buffer.toString("utf8");
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath);
  const parsed = dotenv.parse(decodeEnvBuffer(raw));

  Object.entries(parsed).forEach(([key, value]) => {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

module.exports = loadEnv;