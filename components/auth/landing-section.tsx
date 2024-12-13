"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Menu, X, ArrowUp } from 'lucide-react';

const menuItems = [
  { id: 'home', label: 'Home', content: 'home-content' },
  { id: 'how-it-works', label: 'How It Works', content: 'how-it-works-content' },
  { id: 'why-choose', label: 'Why Choose Veedence?', content: 'why-choose-content' },
  { id: 'get-started', label: 'Get Started', content: 'get-started-content' },
];

const stats = [
  { label: 'Success Rate', value: '92%' },
  { label: 'Goals Achieved', value: '10k+' },
  { label: 'Active Users', value: '5k+' },
];

interface LandingSectionProps {
  onLoginClick: () => void;
}

export function LandingSection({ onLoginClick }: LandingSectionProps) {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setScrollPosition(target.scrollTop);
    };

    const contentElement = document.getElementById('landing-content');
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="relative flex flex-col h-full text-white">
      {/* Sticky Header */}
      <header className={`sticky top-0 z-30 transition-colors duration-300 ${
        scrollPosition > 50 ? 'bg-purple-900/95' : 'bg-transparent'
      } p-4 md:p-6 border-b border-white/10`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="w-32 h-8 bg-[url('/images/svg/veedence_logo_wide.svg')] bg-contain bg-no-repeat bg-center" />
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`text-sm font-medium transition-colors hover:text-white/90 ${
                  activeSection === item.id ? 'text-white' : 'text-white/70'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Login/Register */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={onLoginClick}
              className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
            >
              Login
            </button>
            <Link
              href="/auth/register"
              className="px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-purple-900/95 pt-16">
          <nav className="flex flex-col p-6 space-y-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full text-left py-3 px-4 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* Mobile Login/Register */}
            <div className="pt-4 mt-4 border-t border-white/10">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onLoginClick();
                }}
                className="block w-full px-4 py-3 bg-white text-purple-600 rounded-lg font-medium text-center mb-3"
              >
                Login
              </button>
              <Link
                href="/auth/register"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full px-4 py-3 bg-purple-500 text-white rounded-lg font-medium text-center"
              >
                Register
              </Link>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main id="landing-content" className="flex-1 overflow-y-auto relative">
        <div className="min-h-full">
          {/* Content sections remain the same */}
          {activeSection === 'home' && (
            <div className="relative bg-purple-900">
              {/* Hero Section */}
              <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-[url('/images/goal_images/goal_image_1.jpg')] bg-cover bg-center opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-purple-600/30 to-purple-900" />
                </div>
                
                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    Your AI-Powered
                    <span className="block text-purple-300">Accountability Partner</span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto">
                    Achieve your goals with personalized guidance and 24/7 support
                  </p>

                  <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <Link
                      href="/auth/register"
                      className="px-8 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                    >
                      Start Your Journey <ChevronRight className="inline ml-2" />
                    </Link>
                  </div>

                  {/* Floating Stats */}
                  <div className="grid grid-cols-3 gap-6 mt-12">
                    {stats.map((stat, index) => (
                      <div
                        key={stat.label}
                        className="bg-purple-900/50 backdrop-blur-sm p-4 rounded-xl transform hover:-translate-y-1 transition-transform duration-300"
                        style={{ animationDelay: `${index * 200}ms` }}
                      >
                        <div className="text-3xl font-bold text-purple-300">{stat.value}</div>
                        <div className="text-sm text-white/80">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating Images */}
                <div className="hidden md:block absolute right-[10%] top-[50%] w-48 h-48 rounded-2xl overflow-hidden transform rotate-6 shadow-xl">
                  <img src="/images/goal_images/goal_image_2.jpg" alt="Success" className="w-full h-full object-cover" />
                </div>
                <div className="hidden md:block absolute left-[10%] bottom-[20%] w-40 h-40 rounded-2xl overflow-hidden transform -rotate-12 shadow-xl">
                  <img src="/images/goal_images/goal_image_3.jpg" alt="Achievement" className="w-full h-full object-cover" />
                </div>
              </section>

              {/* Features Section */}
              <section className="relative py-20 px-6">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                    Transform Your Goals into Reality
                  </h2>

                  <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-purple-900/50 backdrop-blur-sm p-6 rounded-xl transform hover:-translate-y-2 transition-all duration-300">
                      <h3 className="text-xl font-semibold mb-4">Smart Goal Setting</h3>
                      <p className="text-white/80">AI-powered guidance to help you set achievable and meaningful goals</p>
                    </div>

                    <div className="bg-purple-900/50 backdrop-blur-sm p-6 rounded-xl transform hover:-translate-y-2 transition-all duration-300">
                      <h3 className="text-xl font-semibold mb-4">Progress Tracking</h3>
                      <p className="text-white/80">Visual insights and real-time updates on your journey</p>
                    </div>

                    <div className="bg-purple-900/50 backdrop-blur-sm p-6 rounded-xl transform hover:-translate-y-2 transition-all duration-300">
                      <h3 className="text-xl font-semibold mb-4">24/7 Support</h3>
                      <p className="text-white/80">Always available to provide guidance and motivation</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeSection === 'how-it-works' && (
            <section className="px-4 md:px-6 py-8 space-y-8 bg-gradient-to-br from-purple-900 to-purple-800 min-h-[calc(100vh-80px)]">
              {/* Title with frosted glass */}
              <div className="text-center mb-8 md:mb-16">
                <div className="inline-block bg-white/10 backdrop-blur-lg px-6 md:px-12 py-4 md:py-6 rounded-2xl border border-white/20 shadow-lg">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">How It Works</h2>
                  <p className="text-lg md:text-xl text-white/80">Your journey to success, simplified</p>
                </div>
              </div>

              <div className="max-w-6xl mx-auto">
                {/* Image and Steps Grid */}
                <div className="relative grid md:grid-cols-2 gap-6 md:gap-12 items-center">
                  {/* Steps Container */}
                  <div className="space-y-4 md:space-y-8">
                    <div className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg p-4 md:p-8 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center text-xl md:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">1</div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-semibold mb-1 md:mb-2">Connect with Your AI Coach</h3>
                          <p className="text-sm md:text-base text-white/80">Begin your journey with personalized goal setting and strategy development</p>
                        </div>
                      </div>
                    </div>

                    <div className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg p-4 md:p-8 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center text-xl md:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">2</div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-semibold mb-1 md:mb-2">Track Your Progress</h3>
                          <p className="text-sm md:text-base text-white/80">Monitor achievements and receive real-time feedback on your journey</p>
                        </div>
                      </div>
                    </div>

                    <div className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg p-4 md:p-8 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-white/20 backdrop-blur-lg flex items-center justify-center text-xl md:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">3</div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-semibold mb-1 md:mb-2">Adapt and Grow</h3>
                          <p className="text-sm md:text-base text-white/80">Get AI-powered insights and adjust your strategies for optimal results</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Image Container */}
                  <div className="relative hidden md:block">
                    <div className="absolute -top-8 -left-8 w-full h-full bg-white/10 rounded-3xl transform rotate-3"></div>
                    <div className="absolute -bottom-8 -right-8 w-full h-full bg-white/10 rounded-3xl transform -rotate-3"></div>
                    <div className="relative aspect-square rounded-3xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                      <img 
                        src="/images/goal_images/goal_image_6_helping.jpg" 
                        alt="AI Coaching Journey" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
                    </div>
                  </div>
                </div>

                {/* Additional Features */}
                <div className="mt-12 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                  <div className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg p-4 md:p-8 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl text-center transform hover:-translate-y-1 transition-all duration-300">
                    <div className="text-3xl md:text-4xl font-bold text-purple-300 mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">24/7</div>
                    <div className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Always Available</div>
                    <p className="text-sm md:text-base text-white/80">Access your AI coach anytime, anywhere</p>
                  </div>

                  <div className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg p-4 md:p-8 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl text-center transform hover:-translate-y-1 transition-all duration-300">
                    <div className="text-3xl md:text-4xl font-bold text-purple-300 mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">100%</div>
                    <div className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Personalized</div>
                    <p className="text-sm md:text-base text-white/80">Tailored guidance for your unique goals</p>
                  </div>

                  <div className="group bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-lg p-4 md:p-8 rounded-2xl border border-white/20 shadow-lg hover:shadow-xl text-center transform hover:-translate-y-1 transition-all duration-300">
                    <div className="text-3xl md:text-4xl font-bold text-purple-300 mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300">∞</div>
                    <div className="text-lg md:text-xl font-semibold mb-1 md:mb-2">Unlimited Support</div>
                    <p className="text-sm md:text-base text-white/80">No limits on interactions or guidance</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'why-choose' && (
            <section className="p-6 space-y-8 bg-purple-900">
              <div className="relative min-h-[calc(100vh-80px)]">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-[url('/images/goal_images/goal_image_5_decisions.jpg')] bg-cover bg-top opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-purple-600/30 to-purple-900" />
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-6xl mx-auto pt-[30vh]">
                  <div className="text-center mb-20">
                    <div className="inline-block bg-purple-900/50 backdrop-blur-sm px-8 py-4 rounded-xl">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Veedence?</h2>
                      <p className="text-xl text-white/80">The future of coaching is here</p>
                    </div>
                  </div>

                  {/* Feature Cards */}
                  <div className="grid md:grid-cols-3 gap-8 mt-12">
                    <div className="bg-purple-900/50 backdrop-blur-sm p-6 rounded-xl transform hover:-translate-y-2 transition-all duration-300">
                      <h3 className="text-xl font-semibold mb-4">AI-Powered Insights</h3>
                      <p className="text-white/80">Advanced algorithms provide personalized guidance and adapt to your progress</p>
                    </div>

                    <div className="bg-purple-900/50 backdrop-blur-sm p-6 rounded-xl transform hover:-translate-y-2 transition-all duration-300">
                      <h3 className="text-xl font-semibold mb-4">24/7 Availability</h3>
                      <p className="text-white/80">Get support and track progress whenever you need, day or night</p>
                    </div>

                    <div className="bg-purple-900/50 backdrop-blur-sm p-6 rounded-xl transform hover:-translate-y-2 transition-all duration-300">
                      <h3 className="text-xl font-semibold mb-4">Data-Driven Growth</h3>
                      <p className="text-white/80">Make informed decisions based on your performance metrics</p>
                    </div>
                  </div>

                  {/* Testimonials/Stats Section */}
                  <div className="mt-20 grid md:grid-cols-2 gap-8">
                    <div className="bg-purple-900/50 backdrop-blur-sm p-8 rounded-xl">
                      <div className="text-3xl font-bold text-purple-300 mb-2">92%</div>
                      <div className="text-xl font-semibold mb-2">Success Rate</div>
                      <p className="text-white/80">Our users consistently achieve their goals with our AI-powered guidance</p>
                    </div>

                    <div className="bg-purple-900/50 backdrop-blur-sm p-8 rounded-xl">
                      <div className="text-3xl font-bold text-purple-300 mb-2">24/7</div>
                      <div className="text-xl font-semibold mb-2">Continuous Support</div>
                      <p className="text-white/80">Always available to help you stay on track and motivated</p>
                    </div>
                  </div>

                  {/* CTA Section */}
                  <div className="mt-20 text-center pb-12">
                    <Link
                      href="/auth/register"
                      className="inline-block px-8 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                    >
                      Start Your Journey
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'get-started' && (
            <section className="p-6 space-y-8 bg-purple-900">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started Today</h2>
                <p className="text-xl text-white/80">Your journey to success begins here</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-purple-900/50 backdrop-blur-sm p-6 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">1. Create Your Account</h3>
                  <p className="text-white/80">Sign up in minutes and start your journey to success.</p>
                </div>

                <div className="bg-purple-900/50 backdrop-blur-sm p-6 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">2. Set Your Goals</h3>
                  <p className="text-white/80">Define your objectives with our AI-powered guidance.</p>
                </div>

                <div className="bg-purple-900/50 backdrop-blur-sm p-6 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">3. Track Progress</h3>
                  <p className="text-white/80">Monitor your achievements and stay motivated.</p>
                </div>

                <div className="bg-purple-900/50 backdrop-blur-sm p-6 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4">4. Achieve Success</h3>
                  <p className="text-white/80">Reach your goals with personalized support.</p>
                </div>
              </div>

              <div className="bg-purple-900/50 backdrop-blur-sm p-8 rounded-xl mt-12">
                <h3 className="text-2xl font-semibold mb-6 text-center">Ready to Transform Your Life?</h3>
                <div className="flex flex-col md:flex-row justify-center items-center gap-4">
                  <Link
                    href="/auth/register"
                    className="px-8 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-white/90 transition-colors"
                  >
                    Start Your Journey
                  </Link>
                  <Link
                    href="/auth/login"
                    className="px-8 py-3 bg-purple-900 text-white rounded-lg font-medium hover:bg-purple-800 transition-colors"
                  >
                    Login
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Scroll to Top Button */}
          {scrollPosition > 300 && (
            <button
              onClick={() => {
                const content = document.getElementById('landing-content');
                if (content) content.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="fixed bottom-6 right-6 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowUp size={20} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
