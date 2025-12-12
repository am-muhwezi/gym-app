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
            Start 14-Day Free Trial
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
          {/* Feature 1 - Client Management */}
          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-brand-primary transition-colors group">
            <div className="mb-6 relative h-48 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                {/* Background circle */}
                <circle cx="100" cy="100" r="80" fill="url(#clientGradient)" opacity="0.1"/>
                {/* Profile cards illustration */}
                <rect x="50" y="60" width="100" height="80" rx="8" fill="#1e293b" stroke="url(#clientGradient)" strokeWidth="2"/>
                <circle cx="100" cy="85" r="12" fill="url(#clientGradient)"/>
                <rect x="80" y="105" width="40" height="4" rx="2" fill="#475569"/>
                <rect x="75" y="115" width="50" height="3" rx="1.5" fill="#334155"/>
                <rect x="70" y="125" width="60" height="3" rx="1.5" fill="#334155"/>
                {/* Additional profile cards in background */}
                <rect x="40" y="50" width="100" height="80" rx="8" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" opacity="0.6"/>
                <rect x="60" y="70" width="100" height="80" rx="8" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" opacity="0.3"/>
                <defs>
                  <linearGradient id="clientGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#2563eb"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Client Management</h3>
            <p className="text-sm text-gray-400">Organize and track all your clients in one place</p>
          </div>

          {/* Feature 2 - Progress Tracking */}
          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-brand-primary transition-colors group">
            <div className="mb-6 relative h-48 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                {/* Background */}
                <circle cx="100" cy="100" r="80" fill="url(#progressGradient)" opacity="0.1"/>
                {/* Chart illustration */}
                <line x1="40" y1="140" x2="160" y2="140" stroke="#475569" strokeWidth="2"/>
                <line x1="40" y1="60" x2="40" y2="140" stroke="#475569" strokeWidth="2"/>
                {/* Bar chart */}
                <rect x="55" y="110" width="15" height="30" rx="2" fill="url(#progressGradient)" opacity="0.6"/>
                <rect x="80" y="95" width="15" height="45" rx="2" fill="url(#progressGradient)" opacity="0.75"/>
                <rect x="105" y="75" width="15" height="65" rx="2" fill="url(#progressGradient)"/>
                <rect x="130" y="85" width="15" height="55" rx="2" fill="url(#progressGradient)" opacity="0.8"/>
                {/* Trend line */}
                <path d="M 60 120 L 87 105 L 112 80 L 137 90" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none"/>
                <circle cx="60" cy="120" r="4" fill="#10b981"/>
                <circle cx="87" cy="105" r="4" fill="#10b981"/>
                <circle cx="112" cy="80" r="4" fill="#10b981"/>
                <circle cx="137" cy="90" r="4" fill="#10b981"/>
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#2563eb"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Progress Tracking</h3>
            <p className="text-sm text-gray-400">Visualize client achievements with analytics</p>
          </div>

          {/* Feature 3 - Payment Processing */}
          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-brand-primary transition-colors group">
            <div className="mb-6 relative h-48 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                {/* Background */}
                <circle cx="100" cy="100" r="80" fill="url(#paymentGradient)" opacity="0.1"/>
                {/* M-Pesa card illustration */}
                <rect x="45" y="70" width="110" height="70" rx="8" fill="url(#paymentGradient)"/>
                <circle cx="70" cy="95" r="8" fill="#ffffff" opacity="0.3"/>
                <circle cx="85" cy="95" r="8" fill="#ffffff" opacity="0.3"/>
                <rect x="55" y="115" width="40" height="5" rx="2.5" fill="#ffffff" opacity="0.5"/>
                <rect x="55" y="125" width="60" height="4" rx="2" fill="#ffffff" opacity="0.3"/>
                {/* Checkmark */}
                <circle cx="135" cy="110" r="18" fill="#10b981"/>
                <path d="M 128 110 L 133 115 L 142 105" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <defs>
                  <linearGradient id="paymentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#2563eb"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Payment Processing</h3>
            <p className="text-sm text-gray-400">M-Pesa integration for seamless transactions</p>
          </div>

          {/* Feature 4 - Session Booking */}
          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-brand-primary transition-colors group">
            <div className="mb-6 relative h-48 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                {/* Background */}
                <circle cx="100" cy="100" r="80" fill="url(#bookingGradient)" opacity="0.1"/>
                {/* Calendar illustration */}
                <rect x="50" y="60" width="100" height="90" rx="8" fill="#1e293b" stroke="url(#bookingGradient)" strokeWidth="2"/>
                <rect x="50" y="60" width="100" height="20" rx="8" fill="url(#bookingGradient)"/>
                {/* Calendar grid */}
                <rect x="60" y="90" width="12" height="12" rx="2" fill="#475569"/>
                <rect x="78" y="90" width="12" height="12" rx="2" fill="#475569"/>
                <rect x="96" y="90" width="12" height="12" rx="2" fill="url(#bookingGradient)"/>
                <rect x="114" y="90" width="12" height="12" rx="2" fill="#475569"/>
                <rect x="132" y="90" width="12" height="12" rx="2" fill="#475569"/>
                <rect x="60" y="108" width="12" height="12" rx="2" fill="#475569"/>
                <rect x="78" y="108" width="12" height="12" rx="2" fill="url(#bookingGradient)"/>
                <rect x="96" y="108" width="12" height="12" rx="2" fill="#475569"/>
                <rect x="114" y="108" width="12" height="12" rx="2" fill="#475569"/>
                <rect x="60" y="126" width="12" height="12" rx="2" fill="#475569"/>
                <rect x="78" y="126" width="12" height="12" rx="2" fill="#475569"/>
                <defs>
                  <linearGradient id="bookingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#2563eb"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Session Booking</h3>
            <p className="text-sm text-gray-400">Intuitive scheduling for you and your clients</p>
          </div>

          {/* Feature 5 - Workout Plans */}
          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-brand-primary transition-colors group">
            <div className="mb-6 relative h-48 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                {/* Background */}
                <circle cx="100" cy="100" r="80" fill="url(#workoutGradient)" opacity="0.1"/>
                {/* Workout plan document */}
                <rect x="60" y="50" width="80" height="100" rx="8" fill="#1e293b" stroke="url(#workoutGradient)" strokeWidth="2"/>
                {/* AI sparkle */}
                <circle cx="130" cy="60" r="12" fill="url(#workoutGradient)"/>
                <path d="M 130 54 L 130 66 M 124 60 L 136 60" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="126" cy="56" r="1.5" fill="#ffffff"/>
                <circle cx="134" cy="64" r="1.5" fill="#ffffff"/>
                {/* Exercise list */}
                <circle cx="70" cy="70" r="3" fill="url(#workoutGradient)"/>
                <rect x="78" y="68" width="50" height="3" rx="1.5" fill="#475569"/>
                <circle cx="70" cy="82" r="3" fill="url(#workoutGradient)"/>
                <rect x="78" y="80" width="45" height="3" rx="1.5" fill="#475569"/>
                <circle cx="70" cy="94" r="3" fill="url(#workoutGradient)"/>
                <rect x="78" y="92" width="40" height="3" rx="1.5" fill="#475569"/>
                <circle cx="70" cy="106" r="3" fill="#475569"/>
                <rect x="78" y="104" width="48" height="3" rx="1.5" fill="#334155"/>
                <circle cx="70" cy="118" r="3" fill="#475569"/>
                <rect x="78" y="116" width="42" height="3" rx="1.5" fill="#334155"/>
                <defs>
                  <linearGradient id="workoutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#2563eb"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Workout Plans</h3>
            <p className="text-sm text-gray-400">AI-powered customized training programs</p>
          </div>

          {/* Feature 6 - Mobile Ready */}
          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-brand-primary transition-colors group">
            <div className="mb-6 relative h-48 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                {/* Background */}
                <circle cx="100" cy="100" r="80" fill="url(#mobileGradient)" opacity="0.1"/>
                {/* Desktop monitor */}
                <rect x="45" y="70" width="70" height="50" rx="4" fill="#1e293b" stroke="url(#mobileGradient)" strokeWidth="2"/>
                <rect x="70" y="122" width="20" height="3" rx="1.5" fill="#475569"/>
                <rect x="65" y="125" width="30" height="2" rx="1" fill="#334155"/>
                {/* Mobile phone */}
                <rect x="120" y="80" width="35" height="60" rx="6" fill="#1e293b" stroke="url(#mobileGradient)" strokeWidth="2"/>
                <rect x="125" y="88" width="25" height="45" rx="2" fill="url(#mobileGradient)" opacity="0.2"/>
                <circle cx="137.5" cy="137" r="3" fill="url(#mobileGradient)"/>
                {/* Sync arrows */}
                <path d="M 105 90 Q 112 85 118 88" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M 120 88 L 118 85 L 118 91" fill="#10b981"/>
                <path d="M 118 105 Q 112 110 105 107" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M 105 107 L 107 110 L 107 104" fill="#10b981"/>
                <defs>
                  <linearGradient id="mobileGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6"/>
                    <stop offset="100%" stopColor="#2563eb"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Mobile Ready</h3>
            <p className="text-sm text-gray-400">Access anywhere on any device</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Choose the plan that fits your business. Start with a 14-day free trial, no credit card required.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Starter Plan */}
          <div className="bg-dark-800 rounded-xl p-8 border border-dark-700 hover:border-brand-primary transition-all duration-200 hover:scale-105">
            <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
            <p className="text-gray-400 mb-6">Perfect for getting started</p>
            <div className="mb-6">
              <div className="text-4xl font-bold text-brand-primary mb-2">KES 2,000</div>
              <div className="text-gray-400">per month</div>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Up to 5 clients</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Client management</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Session booking</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">M-Pesa payments</span>
              </div>
            </div>
            <Link
              to="/signup"
              className="block w-full text-center px-6 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Growth Plan */}
          <div className="bg-dark-800 rounded-xl p-8 border-2 border-brand-primary relative hover:scale-105 transition-all duration-200">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-brand-primary text-white px-4 py-1 rounded-full text-sm font-semibold">Popular</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Growth</h3>
            <p className="text-gray-400 mb-6">For growing businesses</p>
            <div className="mb-6">
              <div className="text-4xl font-bold text-brand-primary mb-2">KES 5,000</div>
              <div className="text-gray-400">per month</div>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Up to 15 clients</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Everything in Starter</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Progress tracking</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Workout plans</span>
              </div>
            </div>
            <Link
              to="/signup"
              className="block w-full text-center px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Professional Plan */}
          <div className="bg-dark-800 rounded-xl p-8 border border-dark-700 hover:border-brand-primary transition-all duration-200 hover:scale-105">
            <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
            <p className="text-gray-400 mb-6">For established trainers</p>
            <div className="mb-6">
              <div className="text-4xl font-bold text-brand-primary mb-2">KES 8,000</div>
              <div className="text-gray-400">per month</div>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Up to 30 clients</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Everything in Growth</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Advanced analytics</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Priority support</span>
              </div>
            </div>
            <Link
              to="/signup"
              className="block w-full text-center px-6 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-dark-800 rounded-xl p-8 border border-dark-700 hover:border-brand-primary transition-all duration-200 hover:scale-105">
            <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
            <p className="text-gray-400 mb-6">For large operations</p>
            <div className="mb-6">
              <div className="text-4xl font-bold text-brand-primary mb-2">Custom</div>
              <div className="text-gray-400">pricing</div>
            </div>
            <div className="space-y-3 mb-8">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">More than 30 clients</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Everything in Professional</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Dedicated support</span>
              </div>
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Custom features</span>
              </div>
            </div>
            <Link
              to="/signup"
              className="block w-full text-center px-6 py-3 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              Contact Sales
            </Link>
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
          Start Your Free Trial Today
        </Link>
      </section>

      {/* Trial Benefits Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 rounded-2xl p-12 border border-brand-primary/20">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Start Your 14-Day Free Trial
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Credit Card Required</h3>
              <p className="text-gray-400 text-sm">Start your trial instantly, no payment info needed</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Up to 5 Clients</h3>
              <p className="text-gray-400 text-sm">Perfect for testing with your first clients</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">All Features Unlocked</h3>
              <p className="text-gray-400 text-sm">Full access to every feature during your trial</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Cancel Anytime</h3>
              <p className="text-gray-400 text-sm">No commitment, cancel with one click</p>
            </div>
          </div>
        </div>
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
