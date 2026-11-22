import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import RevenueCalculator from "@/components/RevenueCalculator";

export default function MedicineDelivery() {
  const [, setLocation] = useLocation();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const steps = [
    {
      number: 1,
      title: "You search or upload prescription",
      description:
        "You can search a medicine by name, salt, or brand, or upload a photo/PDF of your prescription. The app uses OCR + manual review to read the prescription and map it to exact products.",
    },
    {
      number: 2,
      title: "Cart, pricing, and delivery slot",
      description:
        "The app shows price, available brands/generics, discounts, and estimated delivery time. For cold-chain items like insulin, it ensures special packaging and faster delivery.",
    },
    {
      number: 3,
      title: "Prescription verification (critical step)",
      description:
        "A registered pharmacist reviews your prescription for correct drug, dose, quantity, doctor details, and validity. If something is missing or unclear, they call you or ask for re-upload.",
    },
    {
      number: 4,
      title: "Sourcing the medicine",
      description:
        "The order is routed to a licensed pharmacy partner or the company's own warehouse that has stock. The system checks batch number and expiry date to avoid sending near-expiry medicines.",
    },
    {
      number: 5,
      title: "Packing and quality checks",
      description:
        "Medicines are packed in tamper-evident packaging with an invoice and prescription copy if required. Some apps do multi-level checks: automated system check → pharmacist final check → packing.",
    },
    {
      number: 6,
      title: "Dispatch and delivery",
      description:
        "A courier/delivery partner picks up the parcel and delivers to your address. For prescription drugs, some apps require OTP or signature at delivery to confirm the right person receives it.",
    },
    {
      number: 7,
      title: "Post-delivery",
      description:
        "You can reorder easily as the app saves your prescription and past orders. You can raise issues like wrong item or damage and get replacements/refunds as per policy.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            Medicine Delivery Systems
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
              How Medicine Delivery Apps Work
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              Medicine delivery apps like 1mg, PharmEasy, NetMeds, and Apollo 24/7
              work similarly to food delivery apps, but with extra safety, legal,
              and pharmacy checks because medicines are regulated products.
            </p>

            {/* Interactive MVP Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 my-8">
              <div>
                <span className="bg-white/20 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                  Live Interactive MVP
                </span>
                <h3 className="text-2xl font-bold text-white mb-1">
                  Try the Medicine Delivery App Simulator
                </h3>
                <p className="text-white/90 text-sm max-w-xl">
                  Test Rx OCR parsing, pharmacist verification, cold-chain temperature telemetry, and secure OTP handovers in real time.
                </p>
              </div>
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-slate-100 font-bold flex-shrink-0 shadow-md"
                onClick={() => setLocation("/medicine-mvp")}
              >
                Launch Interactive MVP <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </section>

        {/* What Makes Them Different */}
        <section className="bg-gradient-to-r from-emerald-50 to-cyan-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              Core Idea: What Makes Them Different
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-emerald-600 font-bold">✓</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  Prescription Verification
                </h3>
                <p className="text-slate-600 text-sm">
                  They must verify prescriptions for many medicines, especially
                  antibiotics and chronic medications.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-emerald-600 font-bold">📋</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  Licensed Sourcing
                </h3>
                <p className="text-slate-600 text-sm">
                  They must source from licensed pharmacies and keep proper records
                  including invoice, batch number, and expiry dates.
                </p>
              </Card>

              <Card className="p-8 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-emerald-600 font-bold">🏥</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  Extended Services
                </h3>
                <p className="text-slate-600 text-sm">
                  They often offer lab tests, doctor consultations, and health
                  products alongside medicines.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Medicine Order Flow */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              Step-by-Step Flow: How Your Order Moves
            </h2>

            <div className="max-w-3xl mx-auto space-y-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="border border-slate-200 rounded-lg overflow-hidden hover:border-emerald-300 transition-colors"
                >
                  <button
                    onClick={() =>
                      setExpandedStep(
                        expandedStep === step.number ? null : step.number
                      )
                    }
                    className="w-full p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 text-lg">
                        {step.title}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedStep === step.number ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expandedStep === step.number && (
                    <div className="px-6 pb-6 bg-slate-50 border-t border-slate-200">
                      <p className="text-slate-600">{step.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Behind the Scenes */}
        <section className="bg-slate-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              Behind the Scenes: Key Systems
            </h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-emerald-600">📄</span> e-Prescription Module
                </h3>
                <p className="text-slate-600 text-sm">
                  Stores your prescriptions securely, links them to orders, and
                  allows reuse for chronic medications.
                </p>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-emerald-600">🏪</span> Pharmacy Network
                </h3>
                <p className="text-slate-600 text-sm">
                  Connects to many licensed pharmacies/warehouses to improve
                  availability and speed of delivery.
                </p>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-emerald-600">✓</span> Compliance & Audit Trail
                </h3>
                <p className="text-slate-600 text-sm">
                  Logs who verified the prescription, which batch was sent, and
                  when—important for regulatory compliance.
                </p>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="text-emerald-600">💳</span> Payments & Offers
                </h3>
                <p className="text-slate-600 text-sm">
                  Supports UPI, cards, wallets, COD. Often has subscription plans
                  like 1mg Pro for extra discounts and free delivery.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Revenue Model */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              How They Make Money
            </h2>

            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border-l-4 border-emerald-500 pl-6 py-4">
                <h3 className="font-bold text-slate-900 mb-2">
                  Margin on Medicines and Health Products
                </h3>
                <p className="text-slate-600">
                  Primary revenue from selling medicines and health products at a
                  markup.
                </p>
              </div>

              <div className="border-l-4 border-emerald-500 pl-6 py-4">
                <h3 className="font-bold text-slate-900 mb-2">
                  Delivery and Shipping Fees
                </h3>
                <p className="text-slate-600">
                  Charges for delivery, often waived above a certain order threshold
                  to encourage larger purchases.
                </p>
              </div>

              <div className="border-l-4 border-emerald-500 pl-6 py-4">
                <h3 className="font-bold text-slate-900 mb-2">
                  Lab Tests and Doctor Consultations
                </h3>
                <p className="text-slate-600">
                  Revenue from paid services like lab test bookings and doctor
                  consultations.
                </p>
              </div>

              <div className="border-l-4 border-emerald-500 pl-6 py-4">
                <h3 className="font-bold text-slate-900 mb-2">
                  Subscription Plans
                </h3>
                <p className="text-slate-600">
                  Recurring revenue from subscription plans like 1mg Pro that charge
                  a small fee for recurring benefits.
                </p>
              </div>
            </div>

            {/* Interactive Calculator Embed */}
            <div className="mt-12 max-w-5xl mx-auto">
              <RevenueCalculator darkTheme={false} />
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="bg-yellow-50 border-l-4 border-yellow-500 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Compliance Basics
            </h2>
            <p className="text-slate-600 mb-6">
              Even for a small area, medicine delivery requires careful attention to
              regulations:
            </p>
            <ul className="space-y-3 text-slate-600">
              <li className="flex gap-3">
                <span className="text-yellow-600 font-bold">•</span>
                Partner with a licensed pharmacy or get proper licenses if you
                store/sell medicines yourself
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-600 font-bold">•</span>
                Maintain records: prescription copy, invoice, batch, and expiry for
                prescription drugs
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-600 font-bold">•</span>
                Don't deliver restricted/narcotic meds without proper compliance
              </li>
              <li className="flex gap-3">
                <span className="text-yellow-600 font-bold">•</span>
                Add clear disclaimers about prescription requirements and possible
                order cancellations
              </li>
            </ul>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-emerald-500 to-cyan-500 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Build Your Own?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Get a practical guide to launching a hyperlocal medicine delivery app
              in hours with our quick launch blueprint.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-slate-100"
                onClick={() => setLocation("/quick-launch")}
              >
                Quick Launch Guide <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                className="bg-white/20 text-white hover:bg-white/30 border border-white"
                onClick={() => setLocation("/resources")}
              >
                Resources <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
