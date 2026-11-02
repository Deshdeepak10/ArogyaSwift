import { createServer as createHttpServer } from "http";
import { createServer as createHttpsServer } from "https";
import fs from "fs";
import { app } from "./app";

const port = Number(process.env.PORT) || 3000;
const sslKeyPath = process.env.SSL_KEY_PATH;
const sslCertPath = process.env.SSL_CERT_PATH;

// If SSL certificates are provided via environment variables, launch with native HTTPS
if (sslKeyPath && sslCertPath && fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath)) {
  const httpsOptions = {
    key: fs.readFileSync(sslKeyPath),
    cert: fs.readFileSync(sslCertPath),
  };
  const httpsServer = createHttpsServer(httpsOptions, app);
  httpsServer.listen(port, () => {
    console.log(`[ArogyaSwift HTTPS] Secure server listening on https://localhost:${port}/`);
  });
} else {
  // Launch standard server with reverse proxy / Cloudflare HTTPS redirection active
  const httpServer = createHttpServer(app);
  httpServer.listen(port, () => {
    console.log(`[ArogyaSwift] Server listening on port ${port} (HTTPS redirect & HSTS enabled)`);
  });
}
