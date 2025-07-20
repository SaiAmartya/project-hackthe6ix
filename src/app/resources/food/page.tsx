export default function FoodInfoPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12 pb-40">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-emerald-700 mb-4">🍽️ Food Support in Toronto</h1>

        <p className="text-lg text-gray-700 leading-relaxed">
          Toronto offers a wide range of food programs and drives aimed at helping individuals and families experiencing food insecurity. These services are provided by local nonprofits, city agencies, religious organizations, and community centers.
        </p>

        <h2 className="text-2xl font-semibold text-emerald-800">Types of Food Programs</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            <strong>Hot Meal Programs:</strong> Provide ready-to-eat meals, often served on-site at set times during the day.
          </li>
          <li>
            <strong>Food Banks:</strong> Distribute groceries including canned goods, fresh produce, and hygiene products to take home.
          </li>
          <li>
            <strong>Mobile Food Services:</strong> Deliver food directly to communities through vans or mobile pop-ups, especially in underserved areas.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-emerald-800">⏰ Service Hours</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Hours vary depending on the program and provider. Some locations are only open during weekday business hours, while others offer evening or weekend support. Availability may change due to holidays or high demand.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
          When using Live.ly, our system will automatically prioritize programs that are open based on the current time and day to help reduce wait times and wasted trips.
        </p>

        <h2 className="text-2xl font-semibold text-emerald-800">🤲 Why We Ask for Info</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Some food services specialize in helping specific groups such as youth, seniors, or newcomers. Live.ly may ask you for optional details like your age, household status, or dietary needs so we can match you with the most suitable programs.
        </p>
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
