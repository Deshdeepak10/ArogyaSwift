import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { SpamShield } from "@/components/SpamShield";
import { Building2, ShieldCheck, CheckCircle2, FileCheck2, Sparkles, Upload, MapPin, Phone, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { PharmacyRegisterSchema } from "@shared/schemas";

export function PharmacyRegisterModal() {
  const [, setLocation] = useLocation();
  const { isPharmacyRegisterModalOpen, setIsPharmacyRegisterModalOpen, registerPharmacyStore } = useAuth();

  const [ownerName, setOwnerName] = useState("");
  const [shopName, setShopName] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [category, setCategory] = useState("Cold-Chain Certified Retail");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [coldChainReady, setColdChainReady] = useState(true);
  const [honeypot, setHoneypot] = useState("");

  // License Scan Simulation
  const [isValidatingLicense, setIsValidatingLicense] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleSimulateLicenseVerify = () => {
    if (!licenseNo) {
      toast.error("Please enter a Drug License Number first");
      return;
    }
    setIsValidatingLicense(true);
    setTimeout(() => {
      setIsValidatingLicense(false);
      setIsVerified(true);
      toast.success("Medical Drug License verified against CDSCO Registry!");
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim().length > 0) {
      toast.error("Automated submission detected and rejected.");
      return;
    }
    const result = PharmacyRegisterSchema.safeParse({
      ownerName,
      shopName,
      licenseNo,
      category,
      address,
      phone,
      email,
      coldChainReady
    });

    if (!result.success) {
      toast.error(result.error.issues[0]?.message || "Invalid pharmacy registration details");
      return;
    }

    registerPharmacyStore(result.data);

    toast.success(`🎉 ${result.data.shopName} successfully registered on ArogyaSwift! Awaiting admin credential check.`);
    setLocation("/app");
  };

  return (
    <Dialog open={isPharmacyRegisterModalOpen} onOpenChange={setIsPharmacyRegisterModalOpen}>
      <DialogContent className="sm:max-w-xl bg-white border-slate-200 text-slate-900 shadow-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-teal-700 rounded-xl text-white shadow-md shadow-teal-700/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Register Your Pharmacy Shop
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-xs">
                Join ArogyaSwift's verified independent pharmacy network to fulfill orders and quote prices.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <SpamShield value={honeypot} onChange={setHoneypot} />
          {/* Pharmacist & Shop Name */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Owner / Pharmacist Name *
              </label>
              <Input
                placeholder="e.g. Pharm. Dr. Ramesh Gupta"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" /> Pharmacy Shop Title *
              </label>
              <Input
                placeholder="e.g. Gupta Care Pharmacy & Meds"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                required
              />
            </div>
          </div>

          {/* Medical License & Verification */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Drug License Number *
              </label>
              {isVerified && (
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                  ✓ License Verified
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="e.g. DL-KA-2026-99482"
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
                className="bg-white border-slate-300 font-mono text-slate-900 text-sm"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSimulateLicenseVerify}
                disabled={isValidatingLicense}
                className="border-emerald-500 text-emerald-700 hover:bg-emerald-100 font-bold text-xs whitespace-nowrap"
              >
                {isValidatingLicense ? (
                  <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 animate-spin" /> Verifying...</span>
                ) : (
                  "Verify License"
                )}
              </Button>
            </div>
            <p className="text-[11px] text-slate-500">Must be a valid Schedule H retail/wholesale drug license issued under CDSCO.</p>
          </div>

          {/* License Category */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">License Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-slate-50 border-slate-300 text-slate-900 text-sm">
                <SelectValue placeholder="Select license category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cold-Chain Certified Retail">Cold-Chain Certified Retail (Insulin & Biologics)</SelectItem>
                <SelectItem value="Retail Pharmacy Hub">Retail Pharmacy Hub (Over-the-counter & Rx)</SelectItem>
                <SelectItem value="Wholesale & Hospital Supply">Wholesale & Hospital Supply Distributor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" /> Shop Address & Location *
            </label>
            <Input
              placeholder="e.g. Shop #12, MG Road, Indiranagar, Bangalore"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
              required
            />
          </div>

          {/* Phone & Email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-600" /> Contact Phone *
              </label>
              <Input
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-600" /> Official Email *
              </label>
              <Input
                type="email"
                placeholder="store@pharmacy.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-slate-300 text-slate-900 text-sm"
                required
              />
            </div>
          </div>

          {/* Cold Storage Ready */}
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="coldChain"
              checked={coldChainReady}
              onCheckedChange={(val) => setColdChainReady(!!val)}
            />
            <label htmlFor="coldChain" className="text-xs text-slate-700 font-medium cursor-pointer">
              Pharmacy has dedicated refrigerated cold-chain storage (2°C – 8°C) for vaccines and insulin
            </label>
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 text-sm shadow-md mt-4">
            Register Pharmacy & Launch Store Dashboard <CheckCircle2 className="w-4 h-4 ml-1" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
