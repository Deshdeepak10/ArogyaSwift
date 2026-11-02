import { useState } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Bike,
  Building2,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  FileText,
  Thermometer,
  Star,
  Clock,
  Package,
  Award,
  CheckCircle2,
  Power,
  Edit3,
  Save,
  Activity
} from "lucide-react";
import { toast } from "sonner";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, loginAsRole, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<UserRole>(user.role);
  const [isEditing, setIsEditing] = useState(false);
  const [riderOnDuty, setRiderOnDuty] = useState(true);

  // Editable Profile Form State
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "+91 98765 43210",
    location: user.location || "Flat 402, Shipra Sun City, Indirapuram, Ghaziabad",
    licenseNo: user.licenseNo || "UP-2021-00921",
    vehicleType: user.vehicleType || "ArogyaSwift EV Scooter (Insulated Cold Box)",
    shopName: user.shopName || "Apollo Express Pharmacy (Raj Nagar, Ghaziabad)",
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleRoleSwitch = (role: UserRole) => {
    setActiveTab(role);
    loginAsRole(role);
    toast.info(`Switched active view to ${role.toUpperCase()} profile`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white text-slate-900 border-slate-200 rounded-3xl p-0 overflow-hidden shadow-2xl">
        {/* Profile Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white relative">
          <div className="flex items-center justify-between z-10 relative">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex items-center justify-center text-3xl shadow-lg">
                {user.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-white">{user.name}</h3>
                  <Badge className="bg-white/20 text-white font-bold text-xs border border-white/30 capitalize">
                    {user.role} Profile
                  </Badge>
                </div>
                <p className="text-xs text-white/90 font-medium mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" /> {user.badge}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="border-white/40 text-white hover:bg-white/20 bg-white/10 font-bold text-xs"
            >
              {isEditing ? <Save className="w-3.5 h-3.5 mr-1" /> : <Edit3 className="w-3.5 h-3.5 mr-1" />}
              {isEditing ? "Save" : "Edit Profile"}
            </Button>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="px-6 pt-4 bg-slate-50 border-b border-slate-200">
          <Tabs value={activeTab} onValueChange={(val) => handleRoleSwitch(val as UserRole)}>
            <TabsList className="grid grid-cols-3 bg-slate-200/80 p-1 rounded-2xl">
              <TabsTrigger
                value="patient"
                className="rounded-xl font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm flex items-center justify-center gap-1.5"
              >
                <User className="w-4 h-4" /> Patient User
              </TabsTrigger>
              <TabsTrigger
                value="rider"
                className="rounded-xl font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm flex items-center justify-center gap-1.5"
              >
                <Bike className="w-4 h-4" /> Delivery Rider
              </TabsTrigger>
              <TabsTrigger
                value="pharmacy"
                className="rounded-xl font-bold text-xs data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm flex items-center justify-center gap-1.5"
              >
                <Building2 className="w-4 h-4" /> Pharmacy Shop
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Profile Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: PATIENT USER PROFILE */}
          {activeTab === "patient" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Full Name</Label>
                  {isEditing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" /> {formData.name}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Mobile Phone</Label>
                  {isEditing ? (
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" /> {formData.phone}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Email Address</Label>
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" /> {formData.email}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase">Default Delivery Address</Label>
                  {isEditing ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" /> {formData.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Patient Stats & Medical Records */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-sm text-emerald-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-700" /> Verified Medical Records & History
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                    <span className="text-xl font-black text-emerald-800 block">4</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Active Prescriptions</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                    <span className="text-xl font-black text-cyan-800 block">12</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Orders</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                    <span className="text-xl font-black text-indigo-800 block">100%</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Cold Chain Safe</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DELIVERY RIDER PROFILE */}
          {activeTab === "rider" && (
            <div className="space-y-6">
              {/* Duty Toggle */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${riderOnDuty ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                    <Power className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-white">Duty Status</h5>
                    <p className="text-xs text-slate-400">
                      {riderOnDuty ? "🟢 Online & Accepting ArogyaSwift Express Orders" : "🔴 Off Duty"}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setRiderOnDuty(!riderOnDuty);
                    toast.info(riderOnDuty ? "Off duty mode enabled" : "On duty! Ready for express orders");
                  }}
                  className={riderOnDuty ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold" : "bg-slate-800 hover:bg-slate-700 text-white font-bold"}
                >
                  {riderOnDuty ? "Active On Duty" : "Go On Duty"}
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Courier ID</span>
                  <span className="font-extrabold text-sm text-slate-900 font-mono">Express Courier #R-4402</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Assigned Vehicle</span>
                  <span className="font-extrabold text-sm text-slate-900 font-mono">ArogyaSwift EV Scooter (UP-14-EV-8821)</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Rider Rating</span>
                  <span className="font-extrabold text-sm text-amber-600 flex items-center gap-1 font-mono">
                    <Star className="w-4 h-4 fill-amber-500" /> 4.9 ★ (2,410 Rides)
                  </span>
                </div>
                <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-cyan-800 uppercase block">Insulated Box Temp</span>
                  <span className="font-extrabold text-sm text-cyan-900 font-mono flex items-center gap-1">
                    <Thermometer className="w-4 h-4 text-cyan-600" /> 3.6 °C (Optimal Zone)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PHARMACY SHOP PROFILE */}
          {activeTab === "pharmacy" && (
            <div className="space-y-6">
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Licensed Pharmacy Partner</span>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> CDSCO Verified
                  </Badge>
                </div>
                <h4 className="text-lg font-extrabold text-white">{formData.shopName}</h4>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Kavi Nagar Main Rd, Ghaziabad
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Registered Pharmacist</span>
                  <span className="font-extrabold text-sm text-slate-900">Pharm. Priya Nair (B.Pharm)</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Drug License No</span>
                  <span className="font-extrabold text-sm text-slate-900 font-mono">DL-KA-2021-00921</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Cold Storage Readiness</span>
                  <span className="font-extrabold text-sm text-emerald-700 flex items-center gap-1">
                    <Thermometer className="w-4 h-4 text-emerald-600" /> 2°C–8°C Monitored
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Stock Sync Accuracy</span>
                  <span className="font-extrabold text-sm text-indigo-700 font-mono">100% Real-Time ERP</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={logout}
            className="text-red-600 hover:bg-red-50 text-xs font-bold"
          >
            Log Out Account
          </Button>
          <Button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 rounded-xl"
          >
            Close Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
