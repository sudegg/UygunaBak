import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { MapPinIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import CafeCard from "./CafeCard";

// Leaflet marker icon fix
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Harita merkezini güncelleyen bileşen
function MapController({ cafes }) {
  const map = useMap();

  useEffect(() => {
    if (!cafes || cafes.length === 0) {
      map.setView([39.0, 35.0], 5);
      return;
    }

    const validPoints = cafes.filter(
      (cafe) => cafe.latitude != null && cafe.longitude != null,
    );

    if (validPoints.length === 0) {
      map.setView([39.0, 35.0], 5);
      return;
    }

    const bounds = validPoints.map((cafe) => [cafe.latitude, cafe.longitude]);
    map.fitBounds(bounds, {
      padding: [60, 60],
      maxZoom: 8,
    });
  }, [cafes, map]);

  return null;
}

function CafeMap({ cafes, onCafeSelect, selectedCafeId }) {
  const getCafeFeatures = (cafe) => {
    const features = [];
    if (cafe.has_wifi) features.push("Wi-Fi");
    if (cafe.has_power) features.push("Priz");
    return features;
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "#10B981"; // yeşil
    if (rating >= 4.0) return "#F59E0B"; // sarı
    if (rating >= 3.5) return "#F97316"; // turuncu
    return "#EF4444"; // kırmızı
  };

  // Özel marker icon'u
  const createCustomIcon = (rating) => {
    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: ${getRatingColor(rating)};
          border: 2px solid white;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          ${rating?.toFixed(1) || "?"}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[39.0, 35.0]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController cafes={cafes} />

        {cafes &&
          cafes.map(
            (cafe) =>
              cafe.latitude &&
              cafe.longitude && (
                <Marker
                  key={cafe.id}
                  position={[cafe.latitude, cafe.longitude]}
                  icon={createCustomIcon(cafe.avg_rating)}
                  eventHandlers={{
                    click: () => onCafeSelect && onCafeSelect(cafe),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[250px]">
                      <h3 className="font-bold text-lg mb-2">{cafe.name}</h3>
                      <div className="space-y-1 text-sm">
                        <p className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          {cafe.city}, {cafe.district}
                        </p>
                        <p className="text-gray-600">{cafe.address}</p>
                        {cafe.avg_rating && (
                          <p className="font-medium">
                            ⭐ {cafe.avg_rating.toFixed(1)} puan
                          </p>
                        )}
                        {cafe.min_price && cafe.max_price && (
                          <p className="text-green-600">
                            💰 {cafe.min_price}₺ - {cafe.max_price}₺
                          </p>
                        )}
                        {getCafeFeatures(cafe).length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {getCafeFeatures(cafe).map((feature, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ),
          )}
      </MapContainer>

      {/* Harita Açıklaması */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <h4 className="font-semibold mb-2">Puan Renkleri</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>4.5+ Çok İyi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>4.0-4.4 İyi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span>3.5-3.9 Orta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>3.5- Düşük</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CafeMap;
