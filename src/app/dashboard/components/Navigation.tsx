import Link from 'next/link';
import { LocationPermission } from './types';

interface NavigationProps {
  locationPermission: LocationPermission;
}

export default function Navigation({ locationPermission }: NavigationProps) {
  const getLocationStatus = () => {
    switch (locationPermission) {
      case 'granted':
        return (
          <div className="flex items-center space-x-1 text-green-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span className="hidden sm:inline">Location</span>
          </div>
        );
      case 'denied':
        return (
          <div className="flex items-center space-x-1 text-red-500">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2">
              <path d="m3 3 18 18M21 10c0 2.4-.8 4.7-2.3 6.5l-2-2A7 7 0 0 0 19 10c0-3.9-3.1-7-7-7-1.5 0-2.9.5-4.1 1.3L5.6 2"/>
            </svg>
            <span className="hidden sm:inline">No Location</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 text-yellow-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="stroke-2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <span className="hidden sm:inline">Location?</span>
          </div>
        );
    }
  };

  return (
    <nav className="relative z-50 p-4 md:p-6">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-700 bg-clip-text text-transparent">
            LIVE.LY
          </span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-emerald-700/80">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span>Live Support</span>
          </div>
          <div className="text-xs">
            {getLocationStatus()}
          </div>
        </div>
      </div>
    </nav>
  );
} 