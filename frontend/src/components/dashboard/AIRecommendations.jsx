import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AIRecommendations({ recommendations = [] }) {
  const defaultRecommendations = [
    {
      id: 1,
      title: 'Fiyat Optimizasyonu',
      description: 'Latte fiyatını 35₺ → 32₺ düşürürseniz tıklanma oranı %18 artabilir',
      priority: 'high',
      impact: '+18% tıklama'
    },
    {
      id: 2,
      title: 'Kampanya Zamanlaması',
      description: 'Öğle saatleri (12:00-14:00) en yüksek arama trafiğine sahiptir',
      priority: 'medium',
      impact: '+12% görünürlük'
    },
    {
      id: 3,
      title: 'Ürün Açıklaması',
      description: '"Espresso" açıklamasında "taze kahve" kelimesi ekleyin (SEO)',
      priority: 'low',
      impact: '+5% arama'
    }
  ];

  const tips = recommendations.length > 0 ? recommendations : defaultRecommendations;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-6 border-l-4 border-indigo-500">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
        🤖 AI Destekli Öneriler
      </h2>

      <div className="space-y-4">
        {tips.map((tip) => {
          const priorityStyles = {
            high: 'bg-red-100 border-red-300 text-red-800',
            medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
            low: 'bg-blue-100 border-blue-300 text-blue-800'
          };
          const priorityIcons = {
            high: <AlertTriangle className="w-5 h-5" />,
            medium: <TrendingUp className="w-5 h-5" />,
            low: <Lightbulb className="w-5 h-5" />
          };

          return (
            <div key={tip.id} className={`p-4 rounded-lg border-2 ${priorityStyles[tip.priority]}`}>
              <div className="flex gap-3">
                <div>{priorityIcons[tip.priority]}</div>
                <div className="flex-1">
                  <p className="font-semibold">{tip.title}</p>
                  <p className="text-sm mt-1 opacity-90">{tip.description}</p>
                  <p className="text-xs font-bold mt-2 opacity-75">Beklenen Etki: {tip.impact}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition">
        Tüm AI Önerilerini Görüntüle
      </button>
    </div>
  );
}