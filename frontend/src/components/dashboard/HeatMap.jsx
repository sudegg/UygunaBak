import React from 'react';
import { MapPin } from 'lucide-react';

export default function HeatMap({ locations = [] }) {
  const defaultLocations = [
    { area: 'Taksim', searches: 342, percentage: 28 },
    { area: 'Beyoğlu', searches: 298, percentage: 24 },
    { area: 'Kadıköy', searches: 215, percentage: 17 },
    { area: 'Beşiktaş', searches: 189, percentage: 15 },
    { area: 'Şişli', searches: 156, percentage: 13 },
    { area: 'Diğer', searches: 45, percentage: 3 }
  ];

  const data = locations.length > 0 ? locations : defaultLocations;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
        🗺️ Konum Bazlı Arama Haritası
      </h2>

      <div className="space-y-3">
        {data.map((location, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-slate-900">{location.area}</span>
              </div>
              <span className="text-sm font-bold text-slate-600">{location.searches} arama</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full transition-all"
                style={{ width: `${location.percentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 text-right">{location.percentage}%</p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
        <p className="text-sm text-red-900">
          <strong>📍 Bulgu:</strong> Kullanıcılar çoğunlukla Taksim ve Beyoğlu'ndan sizi arıyorlar.
        </p>
      </div>
    </div>
  );
}