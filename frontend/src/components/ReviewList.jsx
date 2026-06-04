/**
 * Yorum Listesi Bileşeni (ReviewList Component)
 * 
 * Belirli bir kafe için tüm müşteri yorumlarını gösterir. Yorumların
 * derecelendirmelerini yıldız ile görüntüler ve işletme sahibinin 
 * yanıtlarını gösterir.
 * 
 * Props:
 * - reviews {Array} : Yorum nesneleri
 *   - id: Yorum ID'si
 *   - user_name: Yorum yapan kullanıcı adı
 *   - comment: Yorum metni
 *   - calculated_rating: Hesaplanmış ağırlıklı puan
 *   - created_at: Oluşturulma tarihi
 *   - owner_reply: İşletme sahibinin yanıtı (varsa)
 *   - reply_at: Yanıt tarihi (varsa)
 * 
 * Özellikler:
 * - 5 yıldız görüntüleme sistemi
 * - Yorum içeriği ve tarih bilgisi
 * - İşletme sahibi yanıtlarının vurgulanması
 * - Uygunsuz yorum raporlama butonu
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.reviews - Kafe yorumları
 * @returns {JSX.Element} - Yorum listesi JSX'i
 */

import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

/**
 * ReviewList Fonksiyonel Bileşeni
 * 
 * @param {Object} props - Props nesnes
 * @param {Array} props.reviews - Gösterilecek yorumlar
 * @returns {JSX.Element}
 */
function ReviewList({ reviews }) {
    // Eğer yorum yoksa bilgilendirme mesajı göster
    if (!reviews || reviews.length === 0) {
        return <p className="text-gray-500">Bu işletme için henüz yorum yapılmamış.</p>;
    }

    /**
     * Derecelendirmeyi 5 yıldız sisteminde gösterir
     * 
     * @param {number} rating - 1-5 arası derecelendirme
     * @returns {JSX.Element} - Yıldız ve puan bilgisi
     */
    const renderStars = (rating) => {
        const numRating = parseFloat(rating) || 0;
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                        key={star}
                        className={`h-5 w-5 ${
                            star <= Math.round(numRating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-300'
                        }`}
                    />
                ))}
                <span className="ml-2 text-sm font-semibold text-gray-700">
                    {numRating.toFixed(1)}
                </span>
            </div>
        );
    };

    return (
        <div className="mt-8 space-y-6">
            <h3 className="text-2xl font-bold border-b pb-2">Müşteri Yorumları</h3>
            
            {/* Her yorum için kartı render et */}
            {reviews.map((review) => (
                <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border">
                    {/* Kullanıcı Bilgisi ve Derecelendirme */}
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="font-semibold text-lg">{review.user_name}</span>
                            <span className="text-xs text-gray-400 ml-2">
                                {new Date(review.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        {renderStars(review.calculated_rating)}
                    </div>

                    {/* Yorum Metni */}
                    <p className="text-gray-700 mt-2">{review.comment}</p>

                    {/* İşletme Sahibi Yanıtı (Varsa) */}
                    {review.owner_reply && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-md border-l-4 border-blue-500 relative">
                            {/* İşletme Sahibi Rozeti */}
                            <div className="absolute -top-3 left-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                                İşletme Sahibi
                            </div>
                            
                            <p className="text-gray-800 text-sm mt-2 font-medium">
                                {review.owner_reply}
                            </p>
                            <span className="text-xs text-gray-500 block mt-2">
                                Yanıtlandı: {new Date(review.reply_at).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                    
                    {/* Rapor Butonu */}
                    <div className="mt-3 flex justify-end">
                        <button className="text-xs text-red-500 hover:text-red-700 underline">
                            Bu yorumu bildir
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ReviewList;