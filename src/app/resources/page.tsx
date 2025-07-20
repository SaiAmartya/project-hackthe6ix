export default function ResourcePage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12 pb-40">
      <div className="max-w-5xl mx-auto space-y-12">
        <h1 className="text-4xl font-bold text-emerald-700 mb-8">📚 Resources</h1>

        <p className="text-lg text-gray-700 leading-relaxed">
            Live.ly is designed to connect you with essential resources in Toronto, whether you need shelter, food, mental health support, or other assistance.
            Below are some key areas we cover to help you navigate available services.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <a href="/resources/shelters">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-200 transition hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-2">🏠 Shelter Info</h2>
            <p className="text-gray-700">
              Learn about the different types of shelters available in Toronto, who they serve, and how to access them.
            </p>
          </div>
            </a>
            <a href="/resources/food">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-200 transition hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-2">🍽️ Food Info</h2>
            <p className="text-gray-700">
              Discover the variety of food programs and drives across Toronto, including who they’re intended for and how to find them.
            </p>
          </div>
          </a>
        
            <a href="https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/mental-health-resources/">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-200 transition hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-2">🧠 Mental Health Hub</h2>
            <p className="text-gray-700">
              Sometimes, just existing can be overwhelming. This page links to the City of Toronto’s official mental health resource portal for support and services.
            </p>
          </div>
          </a>

            <a href="https://housing-infrastructure.canada.ca/homelessness-sans-abri/index-eng.html">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-200 transition hover:shadow-xl">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-2">🤝 Helping Programs</h2>
            <p className="text-gray-700">
              This section redirects to the Government of Canada’s <em>Reaching Home</em> initiative, providing access to national support programs and helpful resources.
            </p>
          </div>
          </a>
        </div>
      </div>

      {/* Enhanced Bottom Navigation - Sticky */}
<div className="fixed bottom-4 left-0 w-full z-50 px-4 md:px-6">
  <div className="max-w-4xl mx-auto">
    <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-4 shadow-2xl">
      <div className="flex justify-center items-center space-x-12">
        
        {/* Resources Icon */}
        <a href="/resources">
          <button className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all hover:scale-105 group">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white stroke-2 group-hover:scale-110 transition-transform">
              <path d="M21 8v13H3V8"/>
              <path d="M1 3h22l-2 5H3l-2-5z"/>
              <path d="M10 12v6"/>
              <path d="M14 12v6"/>
            </svg>
          </button>
        </a>

        {/* Home Icon - Active */}
        <a href="/dashboard">
          <button className="w-18 h-18 bg-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/30">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="text-emerald-600">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </button>
        </a>

        {/* Info Icon */}
        <a href="/info">
          <button className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all hover:scale-105 group">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white stroke-2 group-hover:scale-110 transition-transform">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
          </button>
        </a>

      </div>
    </div>
  </div>
</div>
    </div>
  );
}
