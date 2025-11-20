import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import HeroSection from "@/components/ui/hero";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mt-40">
      {/* ⭐ HERO SECTION */}
      <HeroSection />

      {/* ⭐ STATS SECTION */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((statsData, index) => (
              <div
                key={index}
                className="text-center group transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl font-extrabold text-blue-600 mb-2 group-hover:text-blue-700 transition-colors">
                  {statsData.value}
                </div>
                <div className="text-gray-600 group-hover:text-gray-800 transition-colors">
                  {statsData.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⭐ FEATURES SECTION */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 tracking-tight">
            Everything you need to manage your finances
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuresData.map((feature, index) => (
              <Card
                key={index}
                className="
                  p-6 rounded-xl shadow-md border border-slate-200 
                  hover:shadow-xl hover:-translate-y-2 transition-all duration-300 
                  bg-white/90 backdrop-blur-sm
                "
              >
                <CardContent>
                  <div className="mb-4 text-blue-600 text-4xl">
                    {feature.icon}
                  </div>

                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>

                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ⭐ HOW IT WORKS */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 tracking-tight">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {howItWorksData.map((step, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 text-2xl">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⭐ TESTIMONIALS */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 tracking-tight">
            What Our Users Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {testimonialsData.map((testimonial, index) => (
              <Card
                key={index}
                className="
                  p-6 rounded-xl shadow-md border border-slate-200 
                  hover:shadow-xl hover:-translate-y-2 transition-all duration-300 
                  bg-white/90 backdrop-blur-sm
                "
              >
                <CardContent className="space-y-4">
                  {/* Avatar + name */}
                  <div className="flex items-center gap-3 mb-2">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="text-left">
                      <p className="font-semibold">{testimonial.name}</p>
                      {testimonial.role && (
                        <p className="text-xs text-gray-500">
                          {testimonial.role}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Quote */}
                  <p className="text-gray-600 leading-relaxed text-left relative">
                    <span className="text-3xl text-blue-300 absolute -left-1 -top-4">
                      “
                    </span>
                    <span className="pl-4 block">
                      {testimonial.quote ||
                        testimonial.feedback ||
                        testimonial.description}
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-blue-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-center mb-4 tracking-tight text-white">
            Ready to Take Control of Your Finances?
          </h2>

          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who already managing their finances smarter
            with Welth
          </p>  
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-white text-blue-500 hover:bg-blue-50 animate-bounce
          "
            >
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
