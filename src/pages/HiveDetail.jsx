import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Brush,
  ReferenceLine
} from "recharts";


import { fetchHive } from "../api";
import Header from '../components/Header';
import Footer from '../components/Footer';
import HiveMap from '../components/HiveMap';
import { useToast } from '../components/Toast';



// =========================================================
// ⭐ StatCard – kleine Sensor-Karten oben
// =========================================================
function StatCard({ icon, title, value, unit }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-all">
      <div className="flex items-center gap-4">
        <div className="text-3xl opacity-80">{icon}</div>
        <div>
          <div className="text-gray-500 text-sm">{title}</div>
          <div className="text-2xl font-semibold text-gray-800">
            {value} <span className="text-gray-500">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}



// =========================================================
// ⭐ FORMATTER
// =========================================================
const fmtTime = v => new Date(v).toLocaleString([], {
  hour: "2-digit",
  minute: "2-digit",
  day: "2-digit",
  month: "2-digit"
});

// =========================================================
// ⭐ MOVING AVERAGE (Glättung)
// =========================================================
function movingAverage(data, windowSize = 3) {
  if (!data) return [];

  const result = data.map((d, i) => {
    const slice = data.slice(Math.max(0, i - windowSize + 1), i + 1);
    const avg = slice.reduce((s, p) => s + p.value, 0) / slice.length;
    return { ...d, smooth: avg };
  });

  return result;
}

// =========================================================
// ⭐ WIND-DIRECTION SMOOTHING (Option 3)
// verhindert Sprung 359° → 0°
// =========================================================
function smoothWindDirection(data) {
  if (!data || data.length === 0) return [];

  const out = [{ ...data[0] }];
  for (let i = 1; i < data.length; i++) {
    let prev = out[i - 1].value;
    let curr = data[i].value;

    // Wrap-around handling
    if (prev > 300 && curr < 60) {
      curr += 360;
    }
    if (prev < 60 && curr > 300) {
      curr -= 360;
    }

    out.push({ ...data[i], value: curr });
  }
  return out;
}

// =========================================================
// ⭐ RANGE FILTER (24h, 7d, 30d, all)
// =========================================================
function filterByRange(data, range) {
  if (!data || data.length === 0) return [];

  const lastTS = data.at(-1).ts;
  let cutoff = null;

  switch (range) {
    case "24h":
      cutoff = new Date(lastTS.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "7d":
      cutoff = new Date(lastTS.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      cutoff = new Date(lastTS.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      return data;
  }

  return data.filter(d => d.ts >= cutoff);
}

// =========================================================
// ⭐ CSV EXPORT
// =========================================================
function exportCSV(data, filename = "hive_data.csv") {
  const header = "timestamp,value\n";
  const rows = data.map(d => `${d.ts.toISOString()},${d.value}`).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// =========================================================
// ⭐ PNG EXPORT
// (chartRef → screenshot als PNG)
// =========================================================
function exportPNG(chartRef, filename = "chart.png") {
  if (!chartRef.current) return;

  const svg = chartRef.current.querySelector("svg");
  if (!svg) return;

  const svgData = new XMLSerializer().serializeToString(svg);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const png = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = png;
    link.download = filename;
    link.click();
  };

  img.src = "data:image/svg+xml;base64," + btoa(svgData);
}

// =========================================================
// ⭐ TAB-DEFINITION – ALLE SENSOR-CHARTS
// =========================================================
const CHART_TABS = [
  { key: "weight", label: "Gewicht", color: "#FFD600" },
  { key: "temp_internal", label: "Temp innen", color: "#FF6B00" },
  { key: "temp_external", label: "Temp außen", color: "#00A6FF" },
  { key: "humidity", label: "Feuchte", color: "#0099CC" },
  { key: "pressure", label: "Luftdruck", color: "#7B68EE" },
  { key: "wind_speed", label: "Windgeschwindigkeit", color: "#00CC99" },
  { key: "wind_dir", label: "Windrichtung", color: "#6666FF" },
  { key: "rain_1h", label: "Regen 1h", color: "#55AAFF" }
];

// =========================================================
// ⭐ FORMAT TIMESERIES (raw → ts,value)
// =========================================================
function formatTimeseries(ts) {
  return ts.map(([time, value]) => ({
    ts: new Date(time),
    value
  }));
}
function HiveDetail() {
  const { id } = useParams();

  const [hive, setHive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  // ⭐ aktive Tab: welcher Sensor wird angezeigt?
  const [activeTab, setActiveTab] = useState("weight");

  // ⭐ aktive Zeitspanne
  const [range, setRange] = useState("7d");

  // Chart-Ref für PNG Export
  const chartRef = useRef();

  // =========================================================
  // ⭐ Hive laden
  // =========================================================
  const loadHive = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHive(id);
      if (!data) {
        throw new Error('Bienenstand nicht gefunden');
      }
      setHive(data);
    } catch (err) {
      const errorMsg = err.message || 'Fehler beim Laden der Bienenstand-Daten';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      console.error("Fehler beim Laden:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHive();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-bee-gray via-white to-bee-yellow/30">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-xl text-gray-600 animate-pulse">
            Lade Hive-Daten…
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hive && !loading && error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-bee-gray via-white to-bee-yellow/30">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4">
          <div className="text-center p-10 bg-white rounded-xl shadow-lg max-w-md">
            <div className="text-5xl mb-4">❌</div>
            <div className="text-xl font-bold text-bee-brown mb-2">Bienenstand nicht gefunden</div>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={loadHive}
                className="px-6 py-3 bg-bee-yellow rounded-lg text-bee-brown hover:bg-bee-green hover:text-white transition"
              >
                Erneut versuchen
              </button>
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition"
              >
                Zurück zum Dashboard
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // =========================================================
  // ⭐ Timeseries extrahieren und formatieren
  // =========================================================
  const ts = hive.timeseries || {};

  const tsFormatted = {
    weight: ts.weight ? formatTimeseries(ts.weight) : [],
    temp_internal: ts.temp_internal ? formatTimeseries(ts.temp_internal) : [],
    temp_external: ts.temp_external ? formatTimeseries(ts.temp_external) : [],
    humidity: ts.humidity ? formatTimeseries(ts.humidity) : [],
    pressure: ts.pressure ? formatTimeseries(ts.pressure) : [],
    wind_speed: ts.wind_speed ? formatTimeseries(ts.wind_speed) : [],
    wind_dir: ts.wind_dir ? smoothWindDirection(formatTimeseries(ts.wind_dir)) : [],
    rain_1h: ts.rain_1h ? formatTimeseries(ts.rain_1h) : []
  };

  // =========================================================
  // ⭐ Range-Filter anwenden + Glättung
  // =========================================================
  const filtered = {};
  Object.keys(tsFormatted).forEach((key) => {
    const fd = filterByRange(tsFormatted[key], range);
    filtered[key] = movingAverage(fd);
  });

  // =========================================================
  // ⭐ Chart-Renderer
  // =========================================================
  function RenderChart({ sensor }) {
    const data = filtered[sensor] || [];
    const color = CHART_TABS.find(t => t.key === sensor)?.color || "#FFD600";

    if (!data.length) return <div>Keine Daten</div>;

    // Warnlinien für Temperatur innen
    const showWarn = sensor === "temp_internal";

    return (
      <div ref={chartRef} className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} syncId="hiveCharts">
            <defs>
              <linearGradient id={`grad-${sensor}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />

            <XAxis
              dataKey="ts"
              tickFormatter={(v) => new Date(v).toLocaleString([], { hour: "2-digit", minute: "2-digit" })}
              stroke="#666"
            />

            <YAxis
              stroke="#666"
              type="number"
              allowDecimals={false}
              tickCount={6}   // Recharts versucht 6 schöne Ticks zu setzen
              domain={[
                (dataMin) => Math.floor(dataMin / 10) * 10,  // nach unten auf 10er abrunden
                (dataMax) => Math.ceil(dataMax / 10) * 10    // nach oben auf 10er aufrunden
              ]}
              tickFormatter={(value) => value.toFixed(0)}    // keine Nachkommastellen
            />



            <Tooltip
              labelFormatter={(v) => fmtTime(v)}
              formatter={(v) => v.toFixed(2)}
            />

            {/* Warnlinien */}
            {showWarn && (
              <>
                <ReferenceLine y={30} stroke="red" strokeDasharray="4 4" label="Min 30°C" />
                <ReferenceLine y={38} stroke="red" strokeDasharray="4 4" label="Max 38°C" />
              </>
            )}

            <Area
              type="monotone"
              dataKey="smooth"
              stroke={color}
              fill={`url(#grad-${sensor})`}
              strokeWidth={2}
              dot={false}
            />

            {/* Brush für Zoom */}
            <Brush dataKey="ts" height={20} stroke={color} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // =========================================================
  // ⭐ Export UI
  // =========================================================
  function ExportButtons() {
    const data = filtered[activeTab];

    return (
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => exportCSV(data, `${activeTab}.csv`)}
          className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100"
        >
          CSV Export
        </button>

        <button
          onClick={() => exportPNG(chartRef, `${activeTab}.png`)}
          className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100"
        >
          PNG Export
        </button>
      </div>
    );
  }
  // =========================================================
  // ⭐ UI Start
  // =========================================================
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bee-gray via-white to-bee-yellow/30">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 w-full">

        {/* BACK BUTTON */}
        <div className="mb-4">
          <Link
            to="/dashboard"
            className="text-bee-brown hover:text-bee-green font-semibold flex items-center gap-2"
          >
            ← Zurück zur Übersicht
          </Link>
        </div>

        {/* HEADER CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-3xl font-bold text-bee-brown">{hive.name}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={loadHive}
                disabled={loading}
                className="px-3 py-2 bg-white border-2 border-bee-yellow text-bee-brown rounded-lg hover:bg-bee-gray transition disabled:opacity-50"
                title="Daten aktualisieren"
              >
                🔄 {loading ? 'Lädt...' : ''}
              </button>
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                🟢 Online
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mt-4">
            <div><strong>HiveKey:</strong> {hive.hiveKey}</div>
            <div><strong>GPS:</strong> {hive.location.current.accuracy_m.toFixed(1)}m</div>
          </div>
        </div>

        {/* MAP */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-bee-brown mb-4">📍 Standort</h2>
          <HiveMap
            lat={hive.location.current.lat}
            lon={hive.location.current.lon}
            name={hive.name}
            lastUpdate={hive.location.current.fix_time}
          />
        </div>

        {/* SENSOR CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatCard icon="⚖️" title="Gewicht" value={hive.sensors.weight.last} unit="kg" />
          <StatCard icon="🌡️" title="Temp innen" value={hive.sensors.temp_internal.last} unit="°C" />

          {(() => {
            const w = hive?.sensors?.weather;
            return (
              w && (
                <>
                  <StatCard icon="🌡️" title="Temp außen" value={w?.temp_external?.last ?? "—"} unit="°C" />
                  <StatCard icon="💧" title="Feuchte" value={w?.humidity?.last ?? "—"} unit="%" />
                  <StatCard icon="🌬️" title="Wind" value={w?.wind_speed?.last ?? "—"} unit="m/s" />
                  <StatCard icon="🌧️" title="Regen 24h" value={w?.rain_24h?.last ?? "—"} unit="mm" />
                </>
              )
            );
          })()}
        </div>

        {/* RANGE SELECTOR MODERN */}
        <div className="flex mb-6">
          <div className="flex bg-white shadow-inner rounded-xl overflow-hidden border border-gray-200">
            {[
              { key: "24h", label: "24h" },
              { key: "7d", label: "7 Tage" },
              { key: "30d", label: "30 Tage" },
              { key: "all", label: "Gesamt" },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setRange(item.key)}
                className={`
          px-4 py-2 text-sm font-medium transition-all
          ${range === item.key
                    ? "bg-bee-yellow text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"}
        `}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>


        {/* MODERN TABS */}
        <div className="flex gap-2 overflow-x-auto mb-6 pb-1">
          {CHART_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
        flex items-center gap-2 px-4 py-2 rounded-xl
        text-sm border transition-all whitespace-nowrap
        ${activeTab === tab.key
                  ? "bg-bee-yellow text-white border-bee-yellow shadow-md scale-[1.03]"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"}
      `}
            >
              <span className="text-lg">
                {tab.key === "weight" ? "⚖️" :
                  tab.key === "temp_internal" ? "🔥" :
                    tab.key === "temp_external" ? "🌡️" :
                      tab.key === "humidity" ? "💧" :
                        tab.key === "pressure" ? "📉" :
                          tab.key === "wind_speed" ? "🌬️" :
                            tab.key === "wind_dir" ? "🧭" :
                              tab.key === "rain_1h" ? "🌧️" : "📈"}
              </span>
              {tab.label}
            </button>
          ))}
        </div>


        {/* EXPORT BUTTONS */}
        <ExportButtons />

        {/* CHART DISPLAY */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          <h2 className="text-xl font-bold text-bee-brown mb-4">
            {CHART_TABS.find(t => t.key === activeTab)?.label}
          </h2>
          <RenderChart sensor={activeTab} />
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default HiveDetail;
