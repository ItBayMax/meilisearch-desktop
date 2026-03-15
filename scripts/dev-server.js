/**
 * 开发服务器启动脚本
 * 在 50001~59999 范围内随机选择可用端口启动 Vite 开发服务器
 */

import { spawn } from "child_process";
import net from "net";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync, writeFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

// 端口范围: 50001 ~ 59999
const MIN_PORT = 50001;
const MAX_PORT = 59999;

/**
 * 检查端口是否可用
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => {
      server.close();
      resolve(true);
    });
    server.listen(port, "127.0.0.1");
  });
}

/**
 * 获取可用端口 (50001~59999)
 * 随机选择起始点，如果被占用则尝试下一个
 */
async function getAvailablePort() {
  // 生成随机起始端口
  const range = MAX_PORT - MIN_PORT + 1;
  const startOffset = Math.floor(Math.random() * range);
  const startPort = MIN_PORT + startOffset;

  // 从起始端口开始尝试
  for (let offset = 0; offset < range; offset++) {
    const port = startPort + offset;
    if (port > MAX_PORT) continue;

    if (await isPortAvailable(port)) {
      console.log(`[dev-server] Selected port: ${port}`);
      return port;
    }
    console.log(`[dev-server] Port ${port} is occupied, trying next...`);
  }

  // 如果随机扫描没找到，尝试完整扫描
  for (let port = MIN_PORT; port <= MAX_PORT; port++) {
    if (await isPortAvailable(port)) {
      console.log(`[dev-server] Selected port (full scan): ${port}`);
      return port;
    }
  }

  throw new Error(`No available port found in range ${MIN_PORT}-${MAX_PORT}`);
}

/**
 * 更新 .env 文件中的端口配置
 */
function updateEnvFile(port) {
  const envPath = join(rootDir, ".env");
  const devUrl = `http://localhost:${port}`;

  try {
    let envContent = "";
    try {
      envContent = readFileSync(envPath, "utf-8");
    } catch {
      // 文件不存在，创建新文件
    }

    // 更新或添加 VITE_DEV_PORT 和 TAURI_DEV_URL
    const lines = envContent.split("\n");
    const newLines = [];
    let hasPort = false;
    let hasDevUrl = false;

    for (const line of lines) {
      if (line.startsWith("VITE_DEV_PORT=")) {
        newLines.push(`VITE_DEV_PORT=${port}`);
        hasPort = true;
      } else if (line.startsWith("TAURI_DEV_URL=")) {
        newLines.push(`TAURI_DEV_URL=${devUrl}`);
        hasDevUrl = true;
      } else {
        newLines.push(line);
      }
    }

    if (!hasPort) {
      newLines.push(`VITE_DEV_PORT=${port}`);
    }
    if (!hasDevUrl) {
      newLines.push(`TAURI_DEV_URL=${devUrl}`);
    }

    writeFileSync(envPath, newLines.join("\n").trim() + "\n");
    console.log(`[dev-server] Updated .env with port: ${port}`);
  } catch (error) {
    console.warn("[dev-server] Failed to update .env file:", error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    const port = await getAvailablePort();

    // 设置环境变量，供 Tauri 读取
    process.env.VITE_DEV_PORT = port.toString();

    // 更新 .env 文件
    updateEnvFile(port);

    // 启动 Vite，传入端口参数
    const viteProcess = spawn(
      "npx",
      ["vite", "--port", port.toString(), "--strictPort"],
      {
        stdio: "inherit",
        shell: true,
        cwd: rootDir,
        env: {
          ...process.env,
          VITE_DEV_PORT: port.toString(),
        },
      }
    );

    // 处理进程退出
    process.on("SIGINT", () => {
      viteProcess.kill("SIGINT");
    });

    process.on("SIGTERM", () => {
      viteProcess.kill("SIGTERM");
    });

    viteProcess.on("exit", (code) => {
      process.exit(code);
    });
  } catch (error) {
    console.error("[dev-server] Error:", error.message);
    process.exit(1);
  }
}

main();
