import React from 'react';
import { Star, MessageCircle } from 'lucide-react';

export default function CustomerFeedback({ feedbacks = [], onViewAll }) {
  const reviews = feedbacks;

  const renderStars = (rating) => {
    const numRating = Math.round(parseFloat(rating) || 0);
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < numRating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500">
      <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
        ⭐ Son Yorumlar
      </h2>

      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.slice(0, 3).map((review) => (
          <div key={review.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-slate-900">{review.user_name}</p>
                <p className="text-xs text-slate-500">
                  {review.created_at ? new Date(review.created_at).toLocaleDateString('tr-TR') : ''}
                </p>
              </div>
              {renderStars(review.calculated_rating)}
            </div>
            <p className="text-sm text-slate-700">{review.comment}</p>
          </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Bu işletme için henüz yorum yapılmamış.
        </div>
      )}

      <button
        onClick={onViewAll}
        className="mt-6 w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
      >
        <MessageCircle className="w-4 h-4" /> Tüm Yorumları Görüntüle
      </button>
    </div>
  );
}