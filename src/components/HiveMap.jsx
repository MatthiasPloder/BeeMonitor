import React from 'react';

export default function HiveMap({ lat, lon, name, lastUpdate }) {
  if (!lat || !lon) {
    return (
      <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        🚫 Kein GPS-Signal
      </div>
    );
  }

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lon}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=13#map=13/${lat}/${lon}`;

  return (
    <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0, borderRadius: '0.5rem' }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={mapUrl}
        title={`Map for ${name}`}
      />
      <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded shadow text-xs">
        <a href={osmUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
          ↗ Größere Karte
        </a>
      </div>
    </div>
  );
}

