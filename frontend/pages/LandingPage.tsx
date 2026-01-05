import React, { useState } from 'react';
import { Link } from 'react-router-dom';

type BillingPeriod = 'monthly' | 'quarterly' | 'biannual' | 'annual';

const LandingPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [showContactModal, setShowContactModal] = useState(false);

  // Pricing calculation based on billing period
  const getPricing = (monthlyPrice: number) => {
    const multipliers = {
      monthly: 1,
      quarterly: 3,
      biannual: 6,
      annual: 12,
    };

    const discounts = {
      monthly: 0,
      quarterly: 0.05,  // 5% discount
      biannual: 0.10,   // 10% discount
      annual: 0.15,     // 15% discount
    };

    const baseTotal = monthlyPrice * multipliers[billingPeriod];
    const discount = baseTotal * discounts[billingPeriod];
    const finalPrice = baseTotal - discount;

    return {
      price: finalPrice,
      period: billingPeriod,
      discount: discounts[billingPeriod] * 100,
      monthlyEquivalent: finalPrice / multipliers[billingPeriod]
    };
  };

  const getPeriodLabel = () => {
    const labels = {
      monthly: 'per month',
      quarterly: 'per quarter',
      biannual: 'per 6 months',
      annual: 'per year',
    };
    return labels[billingPeriod];
  };

  const billingOptions = [
    { id: 'monthly', label: 'Monthly', discount: null },
    { id: 'quarterly', label: 'Quarterly', discount: '5%' },
    { id: 'biannual', label: 'Bi-Annually', discount: '10%' },
    { id: 'annual', label: 'Annually', discount: '15%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/icons/T-Logo.png" alt="TrainrUp" className="h-10" />
            <span className="text-lg font-bold text-white">TrainrUp</span>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/login"
              className="px-4 py-1.5 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-1.5 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Pricing Section - FIRST */}
      <section id="pricing" className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
          Simple, Transparent Pricing
        </h2>
        <p className="text-sm md:text-base text-gray-400 text-center mb-8 max-w-2xl mx-auto">
          Choose the plan that fits your business. Start with a 14-day free trial, no credit card required.
        </p>

        {/* Billing Period Selector - Sleek Horizontal Scroll */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="relative bg-dark-800/30 rounded-full p-0.5 border border-dark-700/50 backdrop-blur-sm">
            <div className="flex gap-0.5 overflow-x-auto scrollbar-hide">
              {billingOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setBillingPeriod(option.id as BillingPeriod)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full font-medium transition-all duration-300 ease-out whitespace-nowrap ${
                    billingPeriod === option.id
                      ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-dark-700/50 hover:scale-102'
                  }`}
                  style={{ fontSize: '11px' }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{option.label}</span>
                    {option.discount && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold transition-all duration-300 ${
                        billingPeriod === option.id
                          ? 'bg-green-400/20 text-green-300'
                          : 'bg-green-500/10 text-green-400'
                      }`}>
                        -{option.discount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scale-102 {
            transform: scale(1.02);
          }
        `}</style>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Starter Plan */}
          <div className="bg-dark-800 rounded-lg p-5 border border-dark-700 hover:border-brand-primary transition-all duration-200 hover:scale-105">
            <h3 className="text-lg font-bold text-white mb-1">Starter</h3>
            <p className="text-xs text-gray-400 mb-4">Perfect for getting started</p>
            <div className="mb-4">
              <div className="text-2xl font-bold text-brand-primary mb-1">
                KES {getPricing(2000).price.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">{getPeriodLabel()}</div>
              {billingPeriod !== 'monthly' && (
                <div className="text-xs text-green-400 mt-1">
                  Save {getPricing(2000).discount}% • KES {Math.round(getPricing(2000).monthlyEquivalent).toLocaleString()}/mo
                </div>
              )}
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">Up to 5 clients</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">Client management</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">Session booking</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">M-Pesa payments</span>
              </div>
            </div>
            <Link
              to="/signup"
              className="block w-full text-center px-4 py-2 text-xs bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Growth Plan */}
          <div className="bg-dark-800 rounded-lg p-5 border-2 border-brand-primary relative hover:scale-105 transition-all duration-200">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-brand-primary text-white px-3 py-0.5 rounded-full text-xs font-semibold">Popular</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Growth</h3>
            <p className="text-xs text-gray-400 mb-4">For growing businesses</p>
            <div className="mb-4">
              <div className="text-2xl font-bold text-brand-primary mb-1">
                KES {getPricing(5000).price.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">{getPeriodLabel()}</div>
              {billingPeriod !== 'monthly' && (
                <div className="text-xs text-green-400 mt-1">
                  Save {getPricing(5000).discount}% • KES {Math.round(getPricing(5000).monthlyEquivalent).toLocaleString()}/mo
                </div>
              )}
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">Up to 15 clients</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">Everything in Starter</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">Progress tracking</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">Workout plans</span>
              </div>
            </div>
            <Link
              to="/signup"
              className="block w-full text-center px-4 py-2 text-xs bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Professional Plan */}
          <div className="bg-dark-800 rounded-lg p-5 border border-dark-700 hover:border-brand-primary transition-all duration-200 hover:scale-105">
            <h3 className="text-lg font-bold text-white mb-1">Professional</h3>
            <p className="text-xs text-gray-400 mb-4">For established trainers</p>
            <div className="mb-4">
              <div className="text-2xl font-bold text-brand-primary mb-1">
                KES {getPricing(8000).price.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">{getPeriodLabel()}</div>
              {billingPeriod !== 'monthly' && (
                <div className="text-xs text-green-400 mt-1">
                  Save {getPricing(8000).discount}% • KES {Math.round(getPricing(8000).monthlyEquivalent).toLocaleString()}/mo
                </div>
              )}
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">Up to 30 clients</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">Everything in Growth</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">Advanced analytics</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">Priority support</span>
              </div>
            </div>
            <Link
              to="/signup"
              className="block w-full text-center px-4 py-2 text-xs bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-dark-800 rounded-lg p-5 border border-dark-700 hover:border-brand-primary transition-all duration-200 hover:scale-105">
            <h3 className="text-lg font-bold text-white mb-1">Enterprise</h3>
            <p className="text-xs text-gray-400 mb-4">For large operations</p>
            <div className="mb-4">
              <div className="text-2xl font-bold text-brand-primary mb-1">Custom</div>
              <div className="text-xs text-gray-400">pricing</div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">More than 30 clients</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">Everything in Professional</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">Dedicated support</span>
              </div>
              <div className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-gray-300">Custom features</span>
              </div>
            </div>
            <button
              onClick={() => setShowContactModal(true)}
              className="block w-full text-center px-4 py-2 text-xs bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>

        {/* Additional Client Pricing */}
        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20 rounded-lg p-4 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-brand-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-xs text-white text-center">
              <span className="font-semibold">Need more clients?</span> Add extra clients for just <span className="text-brand-primary font-bold">KES 200</span> per additional client per month
            </p>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Empower Your Training Business
        </h1>
        <p className="text-sm md:text-base text-gray-400 mb-8 max-w-2xl mx-auto">
          The all-in-one platform for personal trainers to manage clients, track progress,
          handle payments, and grow your fitness business.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/signup"
            className="px-6 py-2.5 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors shadow-lg"
          >
            Start 14-Day Free Trial
          </Link>
          <a
            href="#features"
            className="px-6 py-2.5 text-sm bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12">
          Everything You Need to Succeed
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature cards with reduced content */}
          <div className="bg-dark-800 p-6 rounded-lg border border-dark-700 hover:border-brand-primary transition-colors">
            <h3 className="text-base font-semibold text-white mb-2">Client Management</h3>
            <p className="text-xs text-gray-400">Organize and track all your clients in one place</p>
          </div>

          <div className="bg-dark-800 p-6 rounded-lg border border-dark-700 hover:border-brand-primary transition-colors">
            <h3 className="text-base font-semibold text-white mb-2">Progress Tracking</h3>
            <p className="text-xs text-gray-400">Visualize client achievements with analytics</p>
          </div>

          <div className="bg-dark-800 p-6 rounded-lg border border-dark-700 hover:border-brand-primary transition-colors">
            <h3 className="text-base font-semibold text-white mb-2">Payment Processing</h3>
            <p className="text-xs text-gray-400">M-Pesa integration for seamless transactions</p>
          </div>

          <div className="bg-dark-800 p-6 rounded-lg border border-dark-700 hover:border-brand-primary transition-colors">
            <h3 className="text-base font-semibold text-white mb-2">Session Booking</h3>
            <p className="text-xs text-gray-400">Intuitive scheduling for you and your clients</p>
          </div>

          <div className="bg-dark-800 p-6 rounded-lg border border-dark-700 hover:border-brand-primary transition-colors">
            <h3 className="text-base font-semibold text-white mb-2">Workout Plans</h3>
            <p className="text-xs text-gray-400">AI-powered customized training programs</p>
          </div>

          <div className="bg-dark-800 p-6 rounded-lg border border-dark-700 hover:border-brand-primary transition-colors">
            <h3 className="text-base font-semibold text-white mb-2">Mobile Ready</h3>
            <p className="text-xs text-gray-400">Access anywhere on any device</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-dark-800 rounded-xl p-8 border border-dark-700">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-brand-primary mb-1">500+</div>
              <div className="text-xs text-gray-400">Active Trainers</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-brand-primary mb-1">10,000+</div>
              <div className="text-xs text-gray-400">Clients Managed</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-brand-primary mb-1">98%</div>
              <div className="text-xs text-gray-400">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 border-t border-dark-700">
        <div className="text-center text-gray-500">
          <p className="text-xs">&copy; 2025 TrainrUp. All rights reserved.</p>
        </div>
      </footer>

      {/* Contact Sales Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 rounded-xl p-6 max-w-md w-full border border-dark-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Contact Sales</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Get in touch with our sales team</h3>
                <p className="text-xs text-gray-400 mb-4">
                  For enterprise pricing and custom solutions, contact us directly:
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg">
                  <svg className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Email</div>
                    <a href="mailto:sales@trainrup.com" className="text-sm text-white hover:text-brand-primary">
                      sales@trainrup.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg">
                  <svg className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Phone</div>
                    <a href="tel:+254700000000" className="text-sm text-white hover:text-brand-primary">
                      +254 700 000 000
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-dark-900 rounded-lg">
                  <svg className="w-5 h-5 text-brand-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Available</div>
                    <div className="text-sm text-white">Mon-Fri, 9AM-5PM EAT</div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/signup"
                  className="block w-full text-center px-4 py-2.5 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-secondary transition-colors"
                  onClick={() => setShowContactModal(false)}
                >
                  Or Start Free Trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
