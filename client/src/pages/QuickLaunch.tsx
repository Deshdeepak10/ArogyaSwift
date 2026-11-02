import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Copy, Check } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

export default function QuickLaunch() {
  const [, setLocation] = useLocation();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            Quick Launch Guide
          </h1>
          <div className="w-8"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-16">
        {/* Introduction */}
        <section className="container mx-auto px-4 mb-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Launch a Medicine Delivery App in Hours
            </h2>
            <p className="text-lg text-slate-600 mb-4">
              A practical guide to building a hyperlocal, area-based medicine
              delivery app with an MVP approach. Focus on one area, limited catalog,
              and simple operations to launch quickly.
            </p>
          </div>
        </section>

        {/* Fast Delivery Model */}
        <section className="bg-blue-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              Step 1: Decide Your Fast Delivery Model
            </h2>

            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white p-8 rounded-lg border border-blue-200">
                <h3 className="font-bold text-slate-900 mb-3 text-lg">
                  To beat 24-48 hours, you need hyperlocal + pre-stocked:
                </h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>
                      <strong>Service radius:</strong> 2-5 km from a small dark store
                      or partner pharmacy
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>
                      <strong>Catalog:</strong> 200-500 high-demand OTC + common
                      chronic meds
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>
                      <strong>Promise:</strong> 30-60 minute delivery in your area
                      instead of pan-city
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Minimal Feature Set */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              Step 2: Minimal Feature Set for Hours MVP
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-blue-600">👤</span> Customer Side
                </h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• Area selection / pincode check</li>
                  <li>• Simple medicine list or search</li>
                  <li>• Prescription upload</li>
                  <li>• Cart + checkout</li>
                  <li>• Order status page</li>
                </ul>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-emerald-600">⚙️</span> Ops Side
                </h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• Google Sheet / Airtable</li>
                  <li>• Prescription status tracking</li>
                  <li>• Assigned rider info</li>
                  <li>• Order status updates</li>
                  <li>• Route grouping by lane</li>
                </ul>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="text-cyan-600">🏍️</span> Rider Side
                </h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• WhatsApp group or app</li>
                  <li>• Pickup location</li>
                  <li>• Delivery address + map</li>
                  <li>• OTP confirmation</li>
                  <li>• Status updates</li>
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="bg-slate-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              Step 3: Simple Tech Stack
            </h2>

            <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-4">Frontend</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Next.js (React) or single-page React app for quick development.
                </p>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-4">Backend</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Node.js (Express) or Python (FastAPI) for rapid prototyping.
                </p>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-4">Database</h3>
                <p className="text-slate-600 text-sm mb-3">
                  PostgreSQL or Firebase/Supabase for speed and simplicity.
                </p>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-4">Storage</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Firebase Storage or Supabase Storage for prescription images.
                </p>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-4">Auth</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Simple phone + OTP via Firebase Auth or just name + phone for MVP.
                </p>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-4">Payments</h3>
                <p className="text-slate-600 text-sm mb-3">
                  Razorpay Payment Links API or UPI intent for quick integration.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Key Flows */}
        <section className="bg-blue-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              Step 4: Key Flows
            </h2>

            <div className="max-w-3xl mx-auto space-y-8">
              <div className="bg-white p-8 rounded-lg border border-blue-200">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">
                  A) Place Order
                </h3>
                <ol className="space-y-3 text-slate-600 text-sm">
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">1.</span>
                    Customer visits web app, selects area or enters pincode
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">2.</span>
                    Browses/searches medicines, adds to cart
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">3.</span>
                    If any item needs prescription, uploads photo
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">4.</span>
                    Submits order with status PENDING_VERIFICATION
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-600 font-bold">5.</span>
                    You get email/WhatsApp notification
                  </li>
                </ol>
              </div>

              <div className="bg-white p-8 rounded-lg border border-emerald-200">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">
                  B) Verify & Dispatch
                </h3>
                <ol className="space-y-3 text-slate-600 text-sm">
                  <li className="flex gap-3">
                    <span className="text-emerald-600 font-bold">1.</span>
                    Open admin sheet/page, see new order
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-600 font-bold">2.</span>
                    If prescription needed, verify and mark VERIFIED or REJECTED
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-600 font-bold">3.</span>
                    Check stock in local inventory
                  </li>
                  <li className="flex gap-3">
                    <span className="text-emerald-600 font-bold">4.</span>
                    Pack order, assign rider, update status OUT_FOR_DELIVERY
                  </li>
                </ol>
              </div>

              <div className="bg-white p-8 rounded-lg border border-cyan-200">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">
                  C) Delivery & Completion
                </h3>
                <ol className="space-y-3 text-slate-600 text-sm">
                  <li className="flex gap-3">
                    <span className="text-cyan-600 font-bold">1.</span>
                    Rider goes to address using Google Maps link
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-600 font-bold">2.</span>
                    At delivery, asks for OTP or name confirmation
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-600 font-bold">3.</span>
                    Marks as DELIVERED in sheet/app
                  </li>
                  <li className="flex gap-3">
                    <span className="text-cyan-600 font-bold">4.</span>
                    You update order status to COMPLETED
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Speed Tips */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              How to Make It Actually Fast
            </h2>

            <div className="max-w-3xl mx-auto space-y-4">
              <div className="border-l-4 border-blue-500 pl-6 py-4">
                <h3 className="font-bold text-slate-900 mb-2">
                  Pre-stock Common Meds
                </h3>
                <p className="text-slate-600">
                  Keep a small shelf/room as a dark store with high-demand SKUs to
                  minimize picking time.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6 py-4">
                <h3 className="font-bold text-slate-900 mb-2">
                  Batch Runs
                </h3>
                <p className="text-slate-600">
                  Group orders by nearby lanes and do batch runs every 30-45
                  minutes instead of individual deliveries.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6 py-4">
                <h3 className="font-bold text-slate-900 mb-2">
                  Local Riders
                </h3>
                <p className="text-slate-600">
                  Use local riders who know shortcuts on bikes/scooters for faster
                  navigation.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6 py-4">
                <h3 className="font-bold text-slate-900 mb-2">
                  Clear Cut-offs
                </h3>
                <p className="text-slate-600">
                  Set clear cut-off times (e.g., 8 AM-10 PM) and realistic delivery
                  windows.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-500 to-cyan-500 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Build?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              You now have a complete blueprint to launch your hyperlocal medicine
              delivery app. Start with the MVP, validate with your area, then scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-slate-100"
                onClick={() => setLocation("/resources")}
              >
                View Resources <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                className="bg-white/20 text-white hover:bg-white/30 border border-white"
                onClick={() => setLocation("/")}
              >
                Back to Home <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
