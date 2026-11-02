import { Request, Response, NextFunction } from "express";

export type AllowedRole = "customer" | "patient" | "pharmacy" | "rider" | "admin";

export interface AuthenticatedUserRequest extends Request {
  user?: {
    id: string;
    role: AllowedRole;
    email: string;
    name?: string;
  };
}

/**
 * Server-side Role-based Access Control (RBAC) Middleware.
 * Enforces permissions on the backend API, rejecting unauthorized requests with 403 Forbidden.
 */
export function requireRole(allowedRoles: AllowedRole[]) {
  return (req: AuthenticatedUserRequest, res: Response, next: NextFunction): void => {
    // Check Authorization header or role header simulation
    const roleHeader = (req.headers["x-user-role"] as string)?.toLowerCase() as AllowedRole;
    const userId = (req.headers["x-user-id"] as string) || "u-anon";
    const userEmail = (req.headers["x-user-email"] as string) || "user@arogyaswiftlocal.in";

    if (!roleHeader) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Missing role authentication credentials in request header.",
      });
      return;
    }

    // Treat 'patient' as alias for 'customer'
    const normalizedRole = roleHeader === "patient" ? "customer" : roleHeader;
    const normalizedAllowed = allowedRoles.map((r) => (r === "patient" ? "customer" : r));

    if (!normalizedAllowed.includes(normalizedRole)) {
      res.status(403).json({
        error: "Forbidden",
        message: `Access denied. Role '${roleHeader}' does not have sufficient permissions to access this endpoint. Required: [${allowedRoles.join(", ")}].`,
      });
      return;
    }

    req.user = {
      id: userId,
      role: roleHeader,
      email: userEmail,
    };

    next();
  };
}
