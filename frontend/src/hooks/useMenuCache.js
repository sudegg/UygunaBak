/**
 * useMenuCache - Menü verileri cache yönetim hook'u
 * 
 * Fiyat güncellemelerinden sonra cache'in temizlenmesini sağlar.
 * Farklı componentler arasında cache invalidation'ı yönetir.
 */

import { useEffect } from 'react';

// Global cache event emitter
const cacheEvents = new EventTarget();

/**
 * Cache invalidation event'ini tetikle
 * @param {string} cafeId - Hangi kafeye ait cache temizlensin
 * @param {string} type - Cache türü: 'menu', 'prices', 'all'
 */
export const invalidateMenuCache = (cafeId, type = 'menu') => {
    const event = new CustomEvent('cacheInvalidate', {
        detail: { cafeId, type, timestamp: Date.now() }
    });
    cacheEvents.dispatchEvent(event);
};

/**
 * Cache invalidation event'ini dinle
 * @param {Function} callback - Cache temizlendiğinde çağrılacak function
 */
export const useMenuCache = (callback) => {
    useEffect(() => {
        const handleCacheInvalidate = (event) => {
            callback?.(event.detail);
        };

        cacheEvents.addEventListener('cacheInvalidate', handleCacheInvalidate);

        return () => {
            cacheEvents.removeEventListener('cacheInvalidate', handleCacheInvalidate);
        };
    }, [callback]);
};

/**
 * Session storage'da menü cache'i al
 */
export const getMenuCache = (cafeId) => {
    try {
        const key = `cafe_menu_${cafeId}`;
        const cached = sessionStorage.getItem(key);
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
};

/**
 * Session storage'a menü cache'i kaydet
 */
export const setMenuCache = (cafeId, data) => {
    try {
        const key = `cafe_menu_${cafeId}`;
        sessionStorage.setItem(key, JSON.stringify(data));
    } catch {
        // Storage full veya başka hata, sessiz başarısız ol
    }
};

/**
 * Session storage'dan menü cache'ini temizle
 */
export const clearMenuCache = (cafeId) => {
    try {
        const key = `cafe_menu_${cafeId}`;
        sessionStorage.removeItem(key);
        // Tüm componentlere haber ver
        invalidateMenuCache(cafeId, 'all');
    } catch {
        // Sessiz başarısız ol
    }
};
