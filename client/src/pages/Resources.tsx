import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

export default function Resources() {
  const [, setLocation] = useLocation();

  const resources = [
    {
      category: "Hyperlocal & Logistics Systems",
      items: [
        {
          title: "How Hyperlocal Delivery Systems Work",
          url: "https://codeflies.com/delivery-app-process-explained/",
        },
        {
          title: "System Design: On-Demand Delivery Platform",
          url: "https://www.youtube.com/watch?v=thwJEdYSBIE",
        },
        {
          title: "Smart Dispatch & Driver Assignment Algorithms",
          url: "https://medium.com/@sarthaksalunkhe114/how-food-delivery-apps-assign-drivers-using-smart-algorithms-cee099d0d0ff",
        },
      ],
    },
    {
      category: "Medicine Delivery Systems",
      items: [
        {
          title: "Medicine Delivery App Business Model",
          url: "https://www.topdevelopers.co/blog/medicine-delivery-app-business-model/",
        },
        {
          title: "1mg Business Model Analysis",
          url: "https://whitelabelfox.com/1mg-business-model/",
        },
        {
          title: "Develop Medicine Delivery App Like 1mg",
          url: "https://kodytechnolab.com/blog/develop-on-demand-medicine-delivery-app-like-1mg/",
        },
      ],
    },
    {
      category: "Quick Commerce & Hyperlocal",
      items: [
        {
          title: "Hyperlocal Delivery Business Guide",
          url: "https://sarkarimap.com/hyper-local-delivery-business/",
        },
        {
          title: "Quick Commerce: How to Build 10-Minute Delivery",
          url: "https://dev.to/indianwebsiteco/the-quick-commerce-tech-stack-how-to-build-10-minute-delivery-logic-in-2025-3p9k",
        },
        {
          title: "Building Hyperlocal Delivery in Small Towns",
          url: "https://bosswallah.ai/blog/business-guides/local-business/how-to-start-a-hyperlocal-delivery-business-in-small-indian-towns-2026-guide/",
        },
      ],
    },
    {
      category: "Technical Implementation",
      items: [
        {
          title: "Microservices in Pharmacy Industry",
          url: "https://umeey.medium.com/building-domain-driven-microservices-in-the-pharmacy-industry-a-python-example-d7017d602dfd",
        },
        {
          title: "Online Pharmacy Microservice (GitHub)",
          url: "https://github.com/ELDERGARLIC/Online-Pharmacy-Microservice",
        },
        {
          title: "AWS: Building Patient-Centric Health Repository",
          url: "https://aws.amazon.com/blogs/startups/1mg-building-a-patient-centric-digital-health-repository-part-1/",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            Resources & References
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
              Learning Resources
            </h2>
            <p className="text-lg text-slate-600 mb-4">
              A curated collection of articles, videos, GitHub repositories, and
              research papers to deepen your understanding of delivery systems,
              medicine delivery apps, and hyperlocal commerce.
            </p>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="container mx-auto px-4">
          <div className="space-y-16">
            {resources.map((section, idx) => (
              <div key={idx}>
                <h2 className="text-2xl font-bold text-slate-900 mb-8 pb-4 border-b-2 border-slate-200">
                  {section.category}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {section.items.map((item, itemIdx) => (
                    <Card
                      key={itemIdx}
                      className="p-6 hover:shadow-lg transition-all group cursor-pointer"
                      onClick={() => window.open(item.url, "_blank")}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                          {item.title}
                        </h3>
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-cyan-600 transition-colors flex-shrink-0" />
                      </div>
                      <p className="text-slate-600 text-sm mt-2">
                        {item.url.replace("https://", "").split("/")[0]}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Key Concepts */}
        <section className="bg-slate-50 py-16 mt-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              Key Concepts to Master
            </h2>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-3 text-lg">
                  System Architecture
                </h3>
                <p className="text-slate-600 text-sm">
                  Understanding microservices, API gateways, load balancing, and
                  how different services communicate in a distributed system.
                </p>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-3 text-lg">
                  Real-time Tracking
                </h3>
                <p className="text-slate-600 text-sm">
                  WebSockets, GPS tracking, live location updates, and how to
                  efficiently push updates to millions of users.
                </p>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-3 text-lg">
                  Dispatch Algorithms
                </h3>
                <p className="text-slate-600 text-sm">
                  Optimization problems, matching algorithms, and how to minimize
                  delivery time while maximizing rider utilization.
                </p>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-3 text-lg">
                  Compliance & Regulations
                </h3>
                <p className="text-slate-600 text-sm">
                  Prescription verification, pharmacy licensing, audit trails, and
                  regulatory requirements for medicine delivery.
                </p>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-3 text-lg">
                  Database Design
                </h3>
                <p className="text-slate-600 text-sm">
                  Schema design, indexing strategies, geospatial queries, and
                  scaling databases for high-traffic applications.
                </p>
              </Card>

              <Card className="p-8">
                <h3 className="font-bold text-slate-900 mb-3 text-lg">
                  Payment Processing
                </h3>
                <p className="text-slate-600 text-sm">
                  Payment gateways, PCI compliance, transaction security, and
                  handling multiple payment methods.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Tools & Platforms */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">
              Recommended Tools & Platforms
            </h2>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              <div className="border border-slate-200 rounded-lg p-8">
                <h3 className="font-bold text-slate-900 mb-4">Backend</h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• Node.js + Express for rapid development</li>
                  <li>• Python + FastAPI for data science integration</li>
                  <li>• PostgreSQL for relational data</li>
                  <li>• Redis for caching and real-time features</li>
                  <li>• Firebase for quick prototyping</li>
                </ul>
              </div>

              <div className="border border-slate-200 rounded-lg p-8">
                <h3 className="font-bold text-slate-900 mb-4">Frontend</h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• React or Next.js for web</li>
                  <li>• React Native or Flutter for mobile</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Socket.io for real-time updates</li>
                  <li>• Google Maps API for location services</li>
                </ul>
              </div>

              <div className="border border-slate-200 rounded-lg p-8">
                <h3 className="font-bold text-slate-900 mb-4">Infrastructure</h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• AWS or Google Cloud for hosting</li>
                  <li>• Docker for containerization</li>
                  <li>• Kubernetes for orchestration</li>
                  <li>• GitHub Actions for CI/CD</li>
                  <li>• Datadog for monitoring</li>
                </ul>
              </div>

              <div className="border border-slate-200 rounded-lg p-8">
                <h3 className="font-bold text-slate-900 mb-4">Third-party APIs</h3>
                <ul className="space-y-2 text-slate-600 text-sm">
                  <li>• Razorpay for payments (India)</li>
                  <li>• Twilio for SMS/OTP</li>
                  <li>• Firebase for push notifications</li>
                  <li>• AWS S3 for file storage</li>
                  <li>• SendGrid for email</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="bg-gradient-to-r from-cyan-50 to-emerald-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
              Your Next Steps
            </h2>

            <div className="max-w-3xl mx-auto space-y-4">
              <div className="bg-white p-6 rounded-lg border-l-4 border-cyan-500">
                <h3 className="font-bold text-slate-900 mb-2">1. Choose Your Focus</h3>
                <p className="text-slate-600 text-sm">
                  Focus on building an end-to-end hyperlocal medicine delivery platform with prescription verification and cold-chain logistics.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border-l-4 border-emerald-500">
                <h3 className="font-bold text-slate-900 mb-2">
                  2. Start with MVP
                </h3>
                <p className="text-slate-600 text-sm">
                  Build a minimal viable product for one area or city to validate
                  your business model before scaling.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="font-bold text-slate-900 mb-2">
                  3. Learn the Tech
                </h3>
                <p className="text-slate-600 text-sm">
                  Study system design, database optimization, and real-time
                  technologies through the resources provided above.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border-l-4 border-orange-500">
                <h3 className="font-bold text-slate-900 mb-2">
                  4. Build & Iterate
                </h3>
                <p className="text-slate-600 text-sm">
                  Start coding, launch your MVP, gather user feedback, and
                  continuously improve based on real-world usage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Build Your Delivery App?
            </h2>
            <p className="mb-8 max-w-2xl mx-auto text-white/90">
              You have all the knowledge, resources, and guidance you need. Start
              with the quick launch guide and build something amazing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-cyan-500 text-white hover:bg-cyan-600"
                onClick={() => setLocation("/quick-launch")}
              >
                Back to Quick Launch <ArrowRight className="w-4 h-4" />
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
