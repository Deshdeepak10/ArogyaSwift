import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Shield,
  KeyRound,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Building,
  CheckCircle2
} from "lucide-react";

export function AdminAuthModal() {
  const [, setLocation] = useLocation();
  const {
    activeRoleModal,
    closeRoleAuth,
    roleModalMode,
    setRoleModalMode,
    loginAdminUser,
    registerAdminStaff
  } = useAuth();
  const { addNotification } = useNotifications();

  const isOpen = activeRoleModal === "admin";

  // Login form state
  const [adminEmail, setAdminEmail] = useState("admin@arogyaswift.in");
  const [adminPin, setAdminPin] = useState("AS-ADMIN-2026");
  const [roleTitle, setRoleTitle] = useState("Platform SuperAdmin");

  // Onboard staff state
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [department, setDepartment] = useState("Operations & Dispatch Control");
  const [masterKey, setMasterKey] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim()) {
      toast.error("Please enter admin email");
      return;
    }
    if (adminPin.trim() !== "AS-ADMIN-2026" && adminPin.trim() !== "admin" && adminPin.trim() !== "1234") {
      toast.error("Invalid Admin Passkey. Demo Passkey: AS-ADMIN-2026");
      return;
    }

    loginAdminUser("Operations Control Admin", adminEmail.trim(), adminPin.trim(), roleTitle);
    addNotification({
      title: "Admin Security Session Active 🛡️",
      message: `${roleTitle} authenticated from ArogyaSwift Control Center.`,
      role: "admin",
      type: "system_alert"
    });
    toast.success(`Authenticated as ${roleTitle}!`);
    closeRoleAuth();
    setLocation("/admin");
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (staffName.trim().length < 2) {
      toast.error("Enter staff full name");
      return;
    }
    if (!staffEmail.includes("@")) {
      toast.error("Enter official staff email");
      return;
    }
    if (masterKey.trim() !== "AS-ADMIN-2026" && masterKey.trim() !== "AS-HQ-MASTER") {
      toast.error("Invalid Master Authorization Key. Use demo key: AS-ADMIN-2026");
      return;
    }

    registerAdminStaff({
      name: staffName.trim(),
      email: staffEmail.trim(),
      department,
      pin: masterKey.trim()
    });

    addNotification({
      title: "Staff Account Authorized 🛡️",
      message: `${staffName.trim()} granted ${department} administrative privileges.`,
      role: "admin",
      type: "system_alert"
    });

    toast.success(`Staff account created for ${staffName}!`);
    closeRoleAuth();
    setLocation("/admin");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeRoleAuth()}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-bold text-slate-900">
                Admin Control Center
              </DialogTitle>
              <Badge className="bg-slate-900 text-emerald-300 border-none text-[10px] uppercase font-bold">
                SuperAdmin
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Live operations oversight, chemist license audits, and partner fleet dispatch.
            </DialogDescription>
          </div>
        </div>

        <Tabs
          value={roleModalMode}
          onValueChange={(v) => setRoleModalMode(v as any)}
          className="mt-4"
        >
          <TabsList className="grid grid-cols-2 bg-slate-100/90 p-1 rounded-xl">
            <TabsTrigger
              value="login"
              className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs cursor-pointer"
            >
              Admin Sign In
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-xs cursor-pointer"
            >
              Onboard Staff Access
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ADMIN LOGIN */}
          <TabsContent value="login" className="space-y-4 pt-3">
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@arogyaswift.in"
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Security Access Passkey
                  </label>
                  <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                    Passkey: AS-ADMIN-2026
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    type="password"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="AS-ADMIN-2026"
                    className="pl-9 text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Privilege Level / Department
                </label>
                <select
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                >
                  <option value="Platform SuperAdmin">Platform SuperAdmin (Full Clearance)</option>
                  <option value="Operations Dispatch Supervisor">Operations Dispatch Supervisor</option>
                  <option value="CDSCO Chemist Compliance Officer">CDSCO Chemist Compliance Officer</option>
                  <option value="Cold-Chain Logistics Auditor">Cold-Chain Logistics Auditor</option>
                </select>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer mt-2"
              >
                <span>Authorize & Open Admin Console</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>

            <button
              type="button"
              onClick={() => {
                loginAdminUser("Operations Control Admin", "admin@arogyaswift.in", "AS-ADMIN-2026", "Platform SuperAdmin");
                toast.success("Loaded Platform SuperAdmin Session");
                setLocation("/admin");
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer text-center"
            >
              ⚡ Fast Demo Access: <strong>SuperAdmin #AS-HQ</strong>
            </button>
          </TabsContent>

          {/* TAB 2: ONBOARD STAFF */}
          <TabsContent value="register" className="space-y-3.5 pt-3">
            <form onSubmit={handleOnboardSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Staff Member Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="e.g. Rahul Sen"
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Corporate Staff Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    type="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="rahul.sen@arogyaswift.in"
                    className="pl-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="Operations & Dispatch Control">Operations & Dispatch Control</option>
                  <option value="Pharmacist & License Verification">Pharmacist & License Verification</option>
                  <option value="Fleet Management & Cold-Chain">Fleet Management & Cold-Chain</option>
                  <option value="Customer Trust & Safety">Customer Trust & Safety</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Master Security Authorization Key *
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Demo: AS-ADMIN-2026</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    type="password"
                    value={masterKey}
                    onChange={(e) => setMasterKey(e.target.value)}
                    placeholder="AS-ADMIN-2026"
                    className="pl-9 text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#065F46] hover:bg-[#044E39] text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-all cursor-pointer mt-2"
              >
                <span>Authorize & Provision Staff Account</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

