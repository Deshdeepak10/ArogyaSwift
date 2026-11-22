import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../app.ts";
import http from "node:http";

function createTestServer() {
  const app = createApp();
  const server = http.createServer(app);
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((res) => server.close(res)),
      });
    });
  });
}

test("Production Readiness: Security & Engineering Suite", async (t) => {
  const { baseUrl, close } = await createTestServer();

  await t.test("1. Public Health Check returns 200 with service metadata", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, "ok");
    assert.equal(data.service, "ArogyaSwift Hyperlocal Marketplace API");
  });

  await t.test("2. Sensitive Path Shield blocks attempt to read .env or server files", async () => {
    const resEnv = await fetch(`${baseUrl}/.env`);
    assert.equal(resEnv.status, 404);

    const resGit = await fetch(`${baseUrl}/.git/config`);
    assert.equal(resGit.status, 404);

    const resSchema = await fetch(`${baseUrl}/schema.sql`);
    assert.equal(resSchema.status, 404);
  });

  await t.test("3. Zod Input Validation rejects malformed login payloads with 400 Bad Request", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customName: "", customEmail: "invalid-email", selectedRole: "unknown" }),
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.error, "Invalid input schema");
    assert.ok(Array.isArray(data.details));
  });

  await t.test("4. Server-Side RBAC: Customer is rejected from Admin endpoints with 403 Forbidden", async () => {
    const res = await fetch(`${baseUrl}/api/admin/metrics`, {
      headers: {
        "x-user-role": "customer",
        "x-user-id": "u-cust-123",
      },
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.error, "Forbidden");
  });

  await t.test("5. IDOR Protection: Unknown order tracking returns 404 without leaking other records", async () => {
    const res = await fetch(`${baseUrl}/api/delivery/tracking/unauthorized-order-9999`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.error, "Tracking details not found");
  });

  await t.test("6. Authentication: Invalid OTP code is rejected with 401 Unauthorized", async () => {
    const res = await fetch(`${baseUrl}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "9876543210", enteredOtp: "0000" }),
    });
    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.error, "Authentication failed");
  });

  await t.test("7. Marketplace Economics: Revenue calculator enforces math consistency", async () => {
    const res = await fetch(`${baseUrl}/api/calculator/revenue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyOrders: 100, avgOrderValue: 500, riderCommission: 10 }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.calculations.totalGMV, 50000);
    assert.equal(data.calculations.platformFacilitationCut, 1500);
    assert.equal(data.calculations.riderCost, 5000);
  });

  await close();
});

