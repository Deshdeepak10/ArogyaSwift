export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    service: "ArogyaSwift Vercel Serverless Health Check",
    timestamp: new Date().toISOString(),
    node_version: process.version,
    platform: process.platform,
  });
}
