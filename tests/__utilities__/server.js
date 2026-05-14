import http from "node:http";

/** @type {Array<http.IncomingMessage>} */
let requests = [];

export function getRequests() {
  return requests;
}

export function clearRequests() {
  requests = [];
}

/** @type {string | undefined} */
let serverUrl;

export function getServerUrl() {
  if (!serverUrl) {
    throw new Error("Server not started. Call 'startServer()' first.");
  }

  return serverUrl;
}

/** @type {http.Server | undefined} */
let server;

/** @returns {Promise<void>} */
export function startServer() {
  server = http.createServer((request, response) => {
    requests.push(request);

    const statusMatch = request.url?.match(/\/(\d{3})/);
    const statusCode = statusMatch?.[1] ? Number.parseInt(statusMatch[1], 10) : 200;

    response.writeHead(statusCode, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ body: {} }));
  });

  return new Promise((resolve, reject) => {
    const serverHost = "localhost";

    // Automatically assign an available port (0 = dynamic port allocation) to avoid conflicts in CI environments
    server?.listen(0, serverHost, () => {
      const address = server?.address();
      if (address && typeof address !== "string") {
        serverUrl = `http://${serverHost}:${address.port}`;

        resolve();
      } else {
        reject(new Error("Failed to get server address."));
      }
    });

    server?.on("error", reject);
  });
}

/** @returns {Promise<void>} */
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
