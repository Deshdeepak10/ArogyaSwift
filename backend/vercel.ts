import { app } from "./app";

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    console.error("[Vercel Serverless Invocation Error]", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Serverless Function Exception",
        message: err?.message || String(err),
        stack: err?.stack,
      });
    }
  }
}

export { app };
