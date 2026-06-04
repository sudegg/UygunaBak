import React, { useState, useEffect } from 'react';

// Sisteme bağlı mock iller ve ilçeler (Gerçek senaryoda API'den çekilir)
const locationData = {
    "İstanbul": ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar"],
    "Ankara": ["Çankaya", "Keçiören", "Yenimahalle"],
    "İzmir": ["Bornova", "Karşıyaka", "Konak"]
};

function LocationSelector({ onLocationSelect }) {
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');

    const handleCityChange = (e) => {
        const city = e.target.value;
        setSelectedCity(city);
        setSelectedDistrict(''); // İl değişirse ilçeyi sıfırla
        onLocationSelect(city, '');
    };

    const handleDistrictChange = (e) => {
        const district = e.target.value;
        setSelectedDistrict(district);
        onLocationSelect(selectedCity, district);
    };

    const cities = Object.keys(locationData);
    const districts = selectedCity ? locationData[selectedCity] : [];

    return (
        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">İl Seçin</label>
                <select 
                    className="border p-2 rounded"
                    value={selectedCity} 
                    onChange={handleCityChange}
                >
                    <option value="">Tüm İller</option>
                    {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
            </div>

            <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">İlçe Seçin</label>
                <select 
                    className="border p-2 rounded disabled:bg-gray-200"
                    value={selectedDistrict} 
                    onChange={handleDistrictChange}
                    disabled={!selectedCity}
                >
                    <option value="">Tüm İlçeler</option>
                    {districts.map((district) => (
                        <option key={district} value={district}>{district}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

export default LocationSelector;
