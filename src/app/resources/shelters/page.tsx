export default function shelterInfo() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12 pb-40">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-emerald-700 mb-4">🏠 Understanding Shelter Options</h1>

        <p className="text-lg text-gray-700 leading-relaxed">
          Toronto's shelter system plays a vital role in supporting individuals and families experiencing homelessness. However, shelters often face high demand and vary significantly in terms of availability and amenities.
        </p>

        <p className="text-lg text-gray-700 leading-relaxed">
          There are two main categories of shelters:
        </p>

        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>
            <strong>Emergency shelters</strong> provide short-term accommodation and immediate support for people who are unhoused or fleeing dangerous situations.
          </li>
          <li>
            <strong>Transitional shelters</strong> focus on long-term stability by helping residents move toward permanent housing, offering more structured support and safety.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-emerald-800 mt-8">Shelter Sectors</h2>

        <p className="text-lg text-gray-700 leading-relaxed">
          To better serve individuals' unique needs, Toronto’s shelters are organized into five primary sectors:
        </p>

        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>Adult Men</li>
          <li>Adult Women</li>
          <li>Mixed Adult (Co-ed)</li>
          <li>Youth</li>
          <li>Family</li>
        </ul>

        <p className="text-lg text-gray-700 leading-relaxed">
          These categories help tailor support services and ensure everyone receives care in an appropriate and respectful environment. This is why our service may ask you to indicate how you identify — to help recommend shelters that best match your needs.
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
