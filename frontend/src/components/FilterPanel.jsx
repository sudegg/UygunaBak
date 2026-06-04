import React, { useState, useEffect } from 'react';

// Sisteme bağlı mock kategoriler ve özellikler (Gerçek senaryoda API'den çekilir)
const mockCategories = [
    { id: 1, name: 'Kahve Dükkanı' },
    { id: 2, name: 'Tatlıcı' },
    { id: 3, name: 'Çay Bahçesi' }
];

const mockFeatures = [
    { id: 1, name: 'Wi-Fi' },
    { id: 2, name: 'Teras' },
    { id: 3, name: 'Priz' },
    { id: 4, name: 'Evcil Hayvan Dostu' }
];

function FilterPanel({ filters, setFilters, activeFilterCount }) {
    const [localFilters, setLocalFilters] = useState({
        category_id: filters.category_id || '',
        feature_ids: filters.feature_ids || [],
        min_price: filters.min_price || '',
        max_price: filters.max_price || '',
        sortBy: filters.sortBy || ''
    });

    // Ana bileşendeki state değişirse local state'i güncelle (örn. temizleme)
    useEffect(() => {
        setLocalFilters({
            category_id: filters.category_id || '',
            feature_ids: filters.feature_ids || [],
            min_price: filters.min_price || '',
            max_price: filters.max_price || '',
            sortBy: filters.sortBy || ''
        });
    }, [filters]);

    const handleFeatureChange = (featureId) => {
        const newFeatures = localFilters.feature_ids.includes(featureId)
            ? localFilters.feature_ids.filter(id => id !== featureId)
            : [...localFilters.feature_ids, featureId];

        const updated = { ...localFilters, feature_ids: newFeatures };
        setLocalFilters(updated);
        setFilters(prev => ({ ...prev, ...updated }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...localFilters, [name]: value };
        setLocalFilters(updated);
        // Doğrudan state'e yansıt (kısa gecikme olmadan)
        setFilters(prev => ({ ...prev, ...updated }));
    };

    const handleClear = () => {
        const cleared = {
            category_id: '',
            feature_ids: [],
            min_price: '',
            max_price: '',
            sortBy: ''
        };
        setLocalFilters(cleared);
        setFilters(prev => ({ ...prev, ...cleared }));
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 relative">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-xl font-bold flex items-center">
                    Filtreler
                    {activeFilterCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </h2>
                <button 
                    onClick={handleClear}
                    className="text-sm text-red-500 hover:text-red-700 underline"
                >
                    Filtreleri Temizle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Kategori Seçimi */}
                <div className="flex flex-col">
                    <label className="text-sm font-semibold mb-1 text-gray-700">Kategori</label>
                    <select 
                        name="category_id"
                        value={localFilters.category_id}
                        onChange={handleChange}
                        className="border p-2 rounded focus:outline-blue-500"
                    >
                        <option value="">Tümü</option>
                        {mockCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* Fiyat Aralığı */}
                <div className="flex flex-col">
                    <label className="text-sm font-semibold mb-1 text-gray-700">Fiyat Aralığı (₺)</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            name="min_price"
                            placeholder="Min" 
                            value={localFilters.min_price}
                            onChange={handleChange}
                            className="border p-2 rounded w-full focus:outline-blue-500"
                        />
                        <span>-</span>
                        <input 
                            type="number" 
                            name="max_price"
                            placeholder="Max" 
                            value={localFilters.max_price}
                            onChange={handleChange}
                            className="border p-2 rounded w-full focus:outline-blue-500"
                        />
                    </div>
                </div>

                {/* Sıralama */}
                <div className="flex flex-col">
                    <label className="text-sm font-semibold mb-1 text-gray-700">Sıralama</label>
                    <select 
                        name="sortBy"
                        value={localFilters.sortBy}
                        onChange={handleChange}
                        className="border p-2 rounded focus:outline-blue-500"
                    >
                        <option value="">Varsayılan (Konum/İsim)</option>
                        <option value="price_asc">Fiyat (Düşükten Yükseğe)</option>
                        <option value="price_desc">Fiyat (Yüksekten Düşüğe)</option>
                        <option value="rating_desc">Puan (Yüksekten Düşüğe)</option>
                    </select>
                </div>

                {/* Özellikler (Checkbox) */}
                <div className="flex flex-col">
                    <label className="text-sm font-semibold mb-1 text-gray-700">Özellikler</label>
                    <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
                        {mockFeatures.map(feat => (
                            <label key={feat.id} className="flex items-center text-sm">
                                <input 
                                    type="checkbox"
                                    checked={localFilters.feature_ids.includes(feat.id)}
                                    onChange={() => handleFeatureChange(feat.id)}
                                    className="mr-2"
                                />
                                {feat.name}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FilterPanel;
