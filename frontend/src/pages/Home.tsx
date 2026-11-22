import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Pill } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-cyan-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="font-bold text-xl text-slate-900">ArogyaSwift</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setLocation("/food-delivery")}
              className="text-slate-600 hover:text-cyan-600 transition-colors"
            >
              Food Delivery
            </button>
            <button
              onClick={() => setLocation("/medicine-delivery")}
              className="text-slate-600 hover:text-cyan-600 transition-colors"
            >
              Medicine Delivery
            </button>
            <button
              onClick={() => setLocation("/medicine-mvp")}
              className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              Medicine MVP <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Live</span>
            </button>
            <button
              onClick={() => setLocation("/quick-launch")}
              className="text-slate-600 hover:text-cyan-600 transition-colors"
            >
              Quick Launch
            </button>
            <button
              onClick={() => setLocation("/resources")}
              className="text-slate-600 hover:text-cyan-600 transition-colors"
            >
              Resources
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
                  How Modern Delivery Systems Work
                </h1>
                <p className="text-xl text-slate-600">
                  From food to medicine: understand the technology behind every order. Explore system architecture, real-time tracking, smart dispatch algorithms, and more.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-500/20 font-bold"
                  onClick={() => setLocation("/medicine-mvp")}
                >
                  Launch Medicine MVP <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-2"
                  onClick={() => setLocation("/food-delivery")}
                >
                  Food Delivery <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 gap-2"
                  onClick={() => setLocation("/medicine-delivery")}
                >
                  Medicine Blueprint <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-cyan-600">3</p>
                  <p className="text-sm text-slate-600">App Ecosystem</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-emerald-600">8</p>
                  <p className="text-sm text-slate-600">Order Steps</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-cyan-600">∞</p>
                  <p className="text-sm text-slate-600">Possibilities</p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative h-96 md:h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 to-emerald-200 rounded-3xl opacity-20 blur-3xl"></div>
              <div className="relative h-full bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center gap-6">
                <div className="w-full h-32 bg-gradient-to-r from-cyan-100 to-emerald-100 rounded-lg flex items-center justify-center p-4">
                  <div className="flex items-center gap-3 text-emerald-700 font-bold">
                    <Package className="w-8 h-8 text-emerald-600" />
                    <span className="text-sm">Hyperlocal Pharmacy & Rider Network</span>
                  </div>
                </div>
                <div className="space-y-3 w-full">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-cyan-600" />
                    <span className="text-sm text-slate-600">Real-time Order Tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Pill className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm text-slate-600">Prescription Verification</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-slate-900 mb-16">
            What You'll Learn
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Medicine Delivery App MVP Card */}
            <div
              onClick={() => setLocation("/")}
              className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all cursor-pointer group border border-emerald-200"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                <Pill className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Medicine Delivery MVP App
              </h3>
              <p className="text-slate-600 mb-4">
                Interactive medicine order suite featuring Rx OCR parsing, pharmacist verification audits, cold-chain live tracking, and dosage reminders.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all">
                Launch Application <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Medicine Delivery Systems Card */}
            <div
              onClick={() => setLocation("/medicine-delivery")}
              className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Medicine Delivery Blueprint
              </h3>
              <p className="text-slate-600 mb-4">
                Explore prescription verification, compliance requirements, pharmacy networks, unit economics, and regulatory oversight.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all">
                Learn More <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Quick Launch Card */}
            <div
              onClick={() => setLocation("/quick-launch")}
              className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <ArrowRight className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Quick Launch Guide
              </h3>
              <p className="text-slate-600 mb-4">
                Get a practical MVP blueprint, minimal tech stack, database schemas, and step-by-step flows to launch a hyperlocal delivery app in hours.
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                Get Started <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">ArogyaSwift</h4>
              <p className="text-sm">
                Educational platform for understanding modern medicine delivery systems.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setLocation("/")}
                    className="hover:text-emerald-400 transition-colors text-emerald-400 font-medium"
                  >
                    Medicine Delivery App
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLocation("/medicine-delivery")}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Medicine Delivery Blueprint
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setLocation("/quick-launch")}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Quick Launch
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setLocation("/resources")}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    References
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Learn</h4>
              <p className="text-sm">
                Understanding how delivery systems work, from architecture to implementation.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-sm">
            <p>
              © 2026 ArogyaSwift. Built with knowledge and passion for delivery systems.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
