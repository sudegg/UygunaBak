import React from 'react';

export default function KPICard({ title, value, trend, reviews, icon, bgColor }) {
  return (
    <div className={`${bgColor} rounded-lg shadow-lg p-6 border-l-4 border-current transition hover:shadow-xl`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {trend && <p className="text-green-600 text-sm font-semibold mt-2">{trend}</p>}
          {reviews && <p className="text-slate-500 text-xs mt-2">{reviews} yorum</p>}
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );
}