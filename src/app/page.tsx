import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-green-600/10"></div>
        
        {/* Floating geometric elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tl from-green-400/20 to-emerald-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-300/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 gap-4 h-full w-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-emerald-400 rounded-sm"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 p-6 md:p-8">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
              LIVE.LY
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <span className="text-emerald-700 font-medium">Toronto, ON</span>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero section */}
          <div className="mb-16 space-y-8">
            {/* Logo and icon */}
            <div className="flex flex-col items-center space-y-6">
              {/* Main logo container */}
              <div className="relative group">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 rounded-3xl flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
                  {/* Animated rings */}
                  <div className="absolute inset-0 rounded-3xl border-4 border-white/30 animate-spin-slow"></div>
                  <div className="absolute inset-2 rounded-2xl border-2 border-white/20 animate-pulse"></div>
                  
                  {/* Heart icon with caring hands */}
                  <div className="relative z-10">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" className="text-white drop-shadow-lg">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    {/* Caring hands overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-white/90">
                        <path d="M13 8c0-2.76-2.24-5-5-5S3 5.24 3 8c0 2.76 2.24 5 5 5s5-2.24 5-5zm4 7c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-8 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-4 7c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Brand name */}
              <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-800 bg-clip-text text-transparent drop-shadow-sm">
                    LIVE.LY
                  </span>
                </h1>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <div className="w-12 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
                </div>
                
                {/* Main CTA Button - Relocated here */}
                <div className="pt-4">
                  <Link href="/dashboard" className="inline-block group mb-0">
                    <button className="relative px-12 py-4 md:px-16 md:py-5 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold text-lg md:text-xl rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 overflow-hidden">
                      {/* Button shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <span className="relative flex items-center space-x-3">
                        <span>Find Resources Now</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2 transition-transform group-hover:translate-x-1">
                          <path d="M5 12h14"/>
                          <path d="M12 5l7 7-7 7"/>
                        </svg>
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Tagline and description */}
            <div className="space-y-6 max-w-4xl mx-auto">
              <p className="text-xl md:text-2xl font-semibold text-emerald-800 leading-relaxed">
                AI-Powered Resource Locator
              </p>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Connecting those in need with <b>essential resources</b> in Toronto. 
                Find nearby shelters, food banks, and various resource, using <b>intelligent, 
                compassionate </b>technology tailored to your needs.
              </p>
            </div>

            {/* Key features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-12">
              <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-200 rounded-xl flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-emerald-700 stroke-2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-emerald-800">Smart Location</h3>
                <p className="text-sm text-gray-600 text-center">Real-time location-based recommendations</p>
              </div>

              <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-200 rounded-xl flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-emerald-700 stroke-2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-emerald-800">AI Assistance</h3>
                <p className="text-sm text-gray-600 text-center">Intelligent matching to your specific needs</p>
              </div>

              <div className="flex flex-col items-center space-y-4 p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-200 rounded-xl flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-emerald-700 stroke-2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <h3 className="font-semibold text-emerald-800">24/7 Access</h3>
                <p className="text-sm text-gray-600 text-center">Available whenever you need support</p>
              </div>
            </div>          </div>

          {/* Trust indicators - moved up since CTA is now above */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-emerald-700/80 pt-8">
            <div className="flex items-center space-x-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-600">
                <path d="M12 2L13.09 4.26L15 4L16.91 4.26L18 2L19.74 3.91L22 4L21.74 6.09L23 8L21.74 9.91L22 12L19.74 12.09L18 14L16.91 15.74L15 16L13.09 15.74L12 18L10.91 15.74L9 16L7.09 15.74L6 18L4.26 16.09L2 16L2.26 13.91L1 12L2.26 10.09L2 8L4.26 7.91L6 6L7.09 4.26L9 4L10.91 4.26L12 2Z"/>
                <path d="M8 12L11 15L16 10" stroke="white" strokeWidth="2" fill="none"/>
              </svg>
              <span>Trusted by Toronto Community</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-600">
                <path d="M12 1L9 9L1 9L7.5 14L5 22L12 17L19 22L16.5 14L23 9L15 9L12 1Z"/>
              </svg>
              <span>Free & Confidential</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Available 24/7</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
