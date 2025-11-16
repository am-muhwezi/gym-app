import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">T</span>
            </div>
            <span className="text-2xl font-bold text-white">TrainrUp</span>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/login"
              className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Empower Your Training Business
        </h1>
        <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
          The all-in-one platform for personal trainers to manage clients, track progress,
          handle payments, and grow your fitness business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/signup"
            className="px-8 py-4 bg-brand-primary text-white text-lg rounded-lg hover:bg-brand-secondary transition-colors shadow-lg"
          >
            Start Free Trial
          </Link>
          <a
            href="#features"
            className="px-8 py-4 bg-dark-700 text-white text-lg rounded-lg hover:bg-dark-600 transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Everything You Need to Succeed
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-brand-primary transition-colors">
            <div className="w-12 h-12 bg-brand-primary bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Client Management</h3>
            <p className="text-gray-400">
              Easily manage client profiles, track their progress, and maintain detailed workout and nutrition plans.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-brand-primary transition-colors">
            <div className="w-12 h-12 bg-brand-primary bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Progress Tracking</h3>
            <p className="text-gray-400">
              Monitor client achievements, set goals, and visualize progress with comprehensive analytics and reports.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-brand-primary transition-colors">
            <div className="w-12 h-12 bg-brand-primary bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Payment Processing</h3>
            <p className="text-gray-400">
              Accept payments seamlessly with M-Pesa integration. Track invoices and manage your revenue effortlessly.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-brand-primary transition-colors">
            <div className="w-12 h-12 bg-brand-primary bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Session Booking</h3>
            <p className="text-gray-400">
              Manage your schedule with an intuitive booking system. Let clients book sessions and avoid double-bookings.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-brand-primary transition-colors">
            <div className="w-12 h-12 bg-brand-primary bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Workout Plans</h3>
            <p className="text-gray-400">
              Create customized workout plans with AI assistance. Save templates and quickly assign plans to clients.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-brand-primary transition-colors">
            <div className="w-12 h-12 bg-brand-primary bg-opacity-20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Mobile Ready</h3>
            <p className="text-gray-400">
              Access your business from anywhere. Our PWA works seamlessly on desktop and mobile devices.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-dark-800 rounded-2xl p-12 border border-dark-700">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-brand-primary mb-2">500+</div>
              <div className="text-gray-400">Active Trainers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-primary mb-2">10,000+</div>
              <div className="text-gray-400">Clients Managed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-brand-primary mb-2">98%</div>
              <div className="text-gray-400">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Transform Your Training Business?
        </h2>
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          Join hundreds of trainers who are already using TrainrUp to streamline their business and focus on what matters most - their clients.
        </p>
        <Link
          to="/signup"
          className="inline-block px-8 py-4 bg-brand-primary text-white text-lg rounded-lg hover:bg-brand-secondary transition-colors shadow-lg"
        >
          Get Started For Free
        </Link>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-8 border-t border-dark-700">
        <div className="text-center text-gray-500">
          <p>&copy; 2025 TrainrUp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
