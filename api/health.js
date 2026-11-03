export default async function handler(req, res) {
  try {
    // Attempt to load the main app and report exact error if it fails
    const appModule = await import("./index.js");
    const app = appModule.default || appModule.app;
    if (typeof app === "function") {
      return app(req, res);
    }
    return res.status(200).json({
      status: "loaded",
      appType: typeof app,
      keys: Object.keys(appModule)
    });
  } catch (err) {
    return res.status(200).json({
      status: "error_caught",
      message: err?.message,
      stack: err?.stack,
      code: err?.code
    });
  }
}
