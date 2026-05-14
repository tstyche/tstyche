import http from "node:http";

const serverPort = 3000;
const serverHost = "localhost";

/** @type {http.Server | undefined} */
let server;

export function getServerUrl() {
  return `http://${serverHost}:${serverPort}`;
}

/**
 * @param {Array<{ status: number; body: Record<string, string> }>} configs
 * @returns {Promise<void>}
 */
export function startServer(configs) {
  server = http.createServer((request, response) => {
    const statusMatch = request.url?.match(/\/(\d{3})/);
    const statusCode = statusMatch?.[1] ? Number.parseInt(statusMatch[1], 10) : 200;

    const config = configs.find((config) => config.status === statusCode);

    response.writeHead(statusCode, { "Content-Type": "application/json" });

    if (config) {
      response.end(JSON.stringify(config.body));
    } else {
      response.end(JSON.stringify({ body: {} }));
    }
  });

  return new Promise((resolve, reject) => {
    server?.listen(serverPort, serverHost, () => {
      resolve();
    });

    server?.on("error", reject);
  });
}

/**
 * @returns {Promise<void>}
 */
export function stopServer() {
  return new Promise((resolve, reject) => {
    server?.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
