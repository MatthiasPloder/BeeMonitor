import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchHives } from "../api";
import Header from '../components/Header';
import Footer from '../components/Footer';
import HiveMap from '../components/HiveMap';
import { useToast } from '../components/Toast';
import { useWebSocket } from '../hooks/useWebSocket';

function HiveCard({ hive }) {
  const weightSensor = hive.sensors?.weight;
  const tempSensor = hive.sensors?.temp_internal;
  const weatherSensor = hive.sensors?.weather;
  
  const hasWeather = hive.features?.enabled?.includes('weather_station');
  const isOnline = new Date(hive.location?.current?.fix_time) > new Date(Date.now() - 24*60*60*1000);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
      {/* Map Section */}
      <div className="p-2">
        <HiveMap 
          lat={hive.location?.current?.lat}
          lon={hive.location?.current?.lon}
          name={hive.name}
          lastUpdate={hive.location?.current?.fix_time}
        />
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-bee-brown">{hive.name}</h3>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </div>
        </div>

        {/* Sensors Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col items-center rounded-xl shadow-sm p-3 bg-bee-gray/30">
            <div className="text-2xl mb-1">⚖️</div>
            <div className="text-xs text-gray-500">Gewicht</div>
            <div className="text-xl font-bold text-bee-brown">
              {weightSensor?.last} {weightSensor?.unit}
            </div>
          </div>
          
          <div className="flex flex-col items-center rounded-xl shadow-sm p-3 bg-bee-gray/30">
            <div className="text-2xl mb-1">🌡️</div>
            <div className="text-xs text-gray-500">Temp. innen</div>
            <div className="text-xl font-bold text-orange-500">
              {tempSensor?.last} {tempSensor?.unit}
            </div>
          </div>
        </div>

        {/* Weather Add-on (wenn aktiviert) */}
        {hasWeather && weatherSensor && (
          <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <div className="text-center">
              <div className="text-xs text-gray-600">Außentemp.</div>
              <div className="font-bold text-sm">{weatherSensor.temp_external?.last}°C</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Luftfeuchte</div>
              <div className="font-bold text-sm">{weatherSensor.humidity?.last}%</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600">Regen (24h)</div>
              <div className="font-bold text-sm">{weatherSensor.rain_24h?.last}mm</div>
            </div>
          </div>
        )}

        <Link
          to={`/hive/${hive.id}`}
          className="block w-full text-center py-2 bg-bee-yellow text-bee-brown font-bold rounded-lg hover:bg-bee-green hover:text-white transition"
        >
          Details anzeigen →
        </Link>
      </div>
    </div>
  );
}

function Dashboard() {
  const [hives, setHives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();
  const { isOpen, sendMessage, messages } = useWebSocket();

  const loadHives = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHives();
      setHives(data);
    } catch (err) {
      const errorMsg = err.message || 'Fehler beim Laden der Bienenstände';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      console.error('Fehler beim Laden der Hives:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHives();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bee-gray via-white to-bee-yellow/30">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="mb-4 bg-white rounded-2xl shadow p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-bee-brown">Live-Verbindung (WebSocket)</span>
            <span className={isOpen ? "text-green-600" : "text-red-600"}>
              {isOpen ? "verbunden" : "nicht verbunden"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => sendMessage("Testnachricht vom Dashboard")}
            className="self-start mt-1 px-3 py-1 text-sm bg-bee-yellow text-bee-brown font-semibold rounded-lg hover:bg-bee-green hover:text-white transition"
          >
            Testnachricht an Backend senden
          </button>
          {messages.length > 0 && (
            <div className="mt-2 max-h-24 overflow-auto text-xs text-gray-600">
              <div className="font-semibold mb-1">Empfangene Nachrichten:</div>
              {messages.map((m, i) => (
                <div key={i}>{m}</div>
              ))}
            </div>
          )}
        </div>
        <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-bee-brown">Meine Bienenstände</h1>
          <div className="flex gap-2">
            <button
              onClick={loadHives}
              disabled={loading}
              className="px-4 py-2 bg-white border-2 border-bee-yellow text-bee-brown font-bold rounded-lg hover:bg-bee-gray transition disabled:opacity-50"
              title="Daten aktualisieren"
            >
              🔄 {loading ? 'Lädt...' : 'Aktualisieren'}
            </button>
            <Link
              to="/hive/pair"
              className="px-4 py-2 bg-bee-yellow text-bee-brown font-bold rounded-lg hover:bg-bee-green hover:text-white transition"
            >
              + Neuer Bienenstand
            </Link>
          </div>
        </div>

        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-red-800">Fehler beim Laden</h3>
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadHives}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Erneut versuchen
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : hives.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🐝</div>
            <h2 className="text-2xl font-bold text-bee-brown mb-2">Noch keine Bienenstände</h2>
            <p className="text-gray-600 mb-6">Füge deinen ersten Bienenstand hinzu</p>
            <Link
              to="/hive/pair"
              className="inline-block px-6 py-3 bg-bee-yellow text-bee-brown font-bold rounded-lg hover:bg-bee-green hover:text-white transition"
            >
              Bienenstand hinzufügen
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hives.map(hive => (
              <HiveCard key={hive.id} hive={hive} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
