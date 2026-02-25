'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FiCheckCircle, FiTrendingUp, FiZap, FiTarget } from 'react-icons/fi';
import { analytics } from '@/lib/analytics';

export default function Home() {
  useEffect(() => {
    analytics.pageView('landing');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-10"></div>
        <div className="container mx-auto px-4 py-12 lg:py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <img 
                src="/logo.png" 
                alt="BeamX Solutions" 
                className="h-16 mx-auto"
              />
            </div>

            <div className="inline-block mb-6 px-4 py-2 bg-purple-100 rounded-full">
              <span className="text-primary font-semibold text-sm">Free Assessment • Takes 5 Minutes</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-heading leading-tight">
              Stellar: Is Your Business Idea Ready to Launch?
            </h1>

            <p className="text-xl lg:text-2xl text-gray-700 mb-8 leading-relaxed">
              Get instant, AI-powered validation with a personalized roadmap. Know exactly what to do next.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/assessment"
                onClick={() => analytics.ctaClicked('start_assessment', 'hero')}
                className="group btn btn-primary px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Free Assessment
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>

              <a
                href="#how-it-works"
                className="btn-see group"
              >
                See How It Works <span className="arrow inline-block ml-2">→</span>
              </a>
            </div>


          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <div className="text-gray-600">Ideas Validated</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">87%</div>
              <div className="text-gray-600">Launch Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">5 min</div>
              <div className="text-gray-600">Average Completion Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            A simple 3-step process to validate your business idea
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <FiTarget className="text-3xl text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">1. Answer 10 Questions</h3>
              <p className="text-gray-600">
                Our research-backed framework covers foundation, market validation, skills, and commitment.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <FiZap className="text-3xl text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">2. Get AI Analysis</h3>
              <p className="text-gray-600">
                Receive instant personalized insights powered by advanced AI, tailored to your specific situation.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <FiTrendingUp className="text-3xl text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">3. Follow Your Roadmap</h3>
              <p className="text-gray-600">
                Get a week-by-week action plan with specific tasks to launch or improve your business idea.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Get */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">What You'll Get</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Comprehensive insights to move your idea forward
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <FiCheckCircle className="text-2xl text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Readiness Score</h3>
                <p className="text-gray-600">Clear Green/Yellow/Red light status with specific score breakdown</p>
              </div>
            </div>

            <div className="flex gap-4">
              <FiCheckCircle className="text-2xl text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Strength Analysis</h3>
                <p className="text-gray-600">Identify what you're doing right and leverage your advantages</p>
              </div>
            </div>

            <div className="flex gap-4">
              <FiCheckCircle className="text-2xl text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Gap Identification</h3>
                <p className="text-gray-600">Know exactly what's missing and how to fill those gaps</p>
              </div>
            </div>

            <div className="flex gap-4">
              <FiCheckCircle className="text-2xl text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Personalized Roadmap</h3>
                <p className="text-gray-600">Week-by-week action plan customized to your situation</p>
              </div>
            </div>

            <div className="flex gap-4">
              <FiCheckCircle className="text-2xl text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Resource Library</h3>
                <p className="text-gray-600">Curated tools and resources for your specific needs</p>
              </div>
            </div>

            <div className="flex gap-4">
              <FiCheckCircle className="text-2xl text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">PDF Report</h3>
                <p className="text-gray-600">Downloadable 8-10 page comprehensive report</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Validate Your Idea?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join 100+ entrepreneurs who got clarity on their business ideas
          </p>
          <Link
            href="/assessment"
            onClick={() => analytics.ctaClicked('start_assessment', 'bottom_cta')}
            className="inline-block bg-white text-primary px-10 py-4 rounded-lg text-lg font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
          >
            Start Your Free Assessment Now
          </Link>
          <p className="text-white/70 mt-4 text-sm">Takes less than 5 minutes • No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <img 
              src="/logo-white.png" 
              alt="BeamX Solutions" 
              className="h-12 mx-auto mb-3"
            />
            <p className="text-gray-400">Data-driven startup validation</p>
          </div>
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} BeamX Solutions. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}