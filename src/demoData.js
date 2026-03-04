// ======================
// HILFSFUNKTIONEN (MATH & UTILS)
// ======================

// Fügt Zufallsrauschen hinzu, um "zu glatte" Kurven zu vermeiden
const jitter = (amount) => (Math.random() - 0.5) * amount;

// Simuliert einen Trend (z.B. Wetterfront) über längere Zeit
const trend = (idx, period = 100) => Math.sin(idx / period);

function generateHourlySeries(startIso, hours, valueFn) {
  const start = new Date(startIso);
  const data = [];
  // Status-Objekt, falls eine Funktion den vorherigen Wert braucht (z.B. für Gewichtsintegration)
  let lastVal = null; 

  for (let i = 0; i < hours; i++) {
    const t = new Date(start.getTime() + i * 60 * 60 * 1000);
    // Wir übergeben i (Index), t (Zeit) und lastVal (Vorheriger Wert für kumulative Logik)
    const v = valueFn(t, i, lastVal);
    lastVal = v;
    data.push([t.toISOString(), Number(v.toFixed(2))]);
  }

  return data;
}

// ======================
// PHYSIKALISCHE MODELLE
// ======================

function makeExternalTempFn(base = 12, amplitude = 8) {
  return (date, i) => {
    const hour = date.getUTCHours();
    // Tiefsttemperatur ca. 5 Uhr morgens, Höchst ca. 15 Uhr
    // Verschiebung der Sinuskurve für realistischen Tagesverlauf
    const dailyCycle = Math.sin(((hour - 9) / 24) * 2 * Math.PI);
    const weeklyTrend = Math.sin(i / (24 * 5)); // Wetterfront alle 5 Tage
    
    let val = base + (amplitude * dailyCycle) + (2 * weeklyTrend);
    return val + jitter(0.5); // Kleines Rauschen
  };
}

function makeInternalTempFn(target = 35.0) {
  return (date, i, lastVal) => {
    // Bienen regulieren extrem genau (Brutnest ~35°C)
    // Wenn es draußen sehr kalt ist (Nachts), schwankt es minimal mehr
    const hour = date.getUTCHours();
    const isNight = hour < 6 || hour > 20;
    
    // Basis-Schwankung sehr gering
    let val = target + Math.sin(i / 6) * 0.2; 
    
    // Zufällige "Heiz-Events" oder "Abkühlung"
    if (isNight) val -= 0.3; 
    
    return val + jitter(0.1);
  };
}

/**
 * Realistische Gewichtsfunktion:
 * - Tagsüber: Zunahme (Trachtflug) -> positiv
 * - Nachts: Abnahme (Wasserverdunstung aus Nektar + Eigenverbrauch) -> negativ
 * - Regen: Keine Zunahme
 */
function makeWeightFn(startKg, hasFlow = true) {
  let currentWeight = startKg;
  
  return (date, i) => {
    const hour = date.getUTCHours();
    const isDay = hour >= 9 && hour <= 19;
    
    // Simulierter Regen alle paar Tage (Sinus-basiert für Demo)
    const isRaining = Math.sin(i / 50) > 0.8; 

    let change = 0;

    if (isDay && !isRaining && hasFlow) {
      // Eintrag: Zwischen 0.05kg und 0.3kg pro Stunde (gute Tracht)
      change = 0.15 + jitter(0.1) + (Math.sin(hour) * 0.05);
    } else {
      // Nachts/Regen: Verbrauch und Trocknung (-0.02 bis -0.05 pro Stunde)
      change = -0.04 + jitter(0.01);
    }

    currentWeight += change;
    return currentWeight;
  };
}

function makeHumidityFn() {
  return (date, i) => {
    const hour = date.getUTCHours();
    // Nachts hoch (bis 95%), Mittags runter (bis 40-60%)
    const cycle = Math.cos(((hour - 4) / 24) * 2 * Math.PI); 
    const base = 75;
    return Math.min(100, Math.max(30, base + (cycle * 20) + jitter(3)));
  };
}

function makePressureFn(base = 1013) {
  return (_, i) => {
    // Luftdruck ändert sich langsam (Wetterlagen)
    return base + (10 * Math.sin(i / 48)) + jitter(0.2); 
  };
}

// Wind ist chaotisch (Weibull distribution approximation via random)
function makeWindSpeedFn() {
  return () => {
    const val = Math.abs(2 + jitter(4)); // Basiswind
    return val > 0 ? val : 0;
  };
}

function makeRain1hFn() {
  return (_, i) => {
    // Korreliert lose mit "Regenwetter" (aus WeightFn Logic)
    // Wenn der Sinus > 0.8 ist, regnet es wahrscheinlich
    const stormPattern = Math.sin(i / 50);
    if (stormPattern > 0.8) {
      return Math.abs(Math.sin(i) * 2) + jitter(0.5); // Regenschauer
    }
    return 0;
  };
}

// ======================
// DEMO-ZEITREIHEN KONFIGURATION
// ======================
const DAYS = 30; // 1 Monat
const HOURS = 24 * DAYS;
const START = "2025-09-01T00:00:00Z"; // Spätsommer/Frühherbst

// Hive A: Starkes Volk, sammelt noch
const tsA = {
  weight:         generateHourlySeries(START, HOURS, makeWeightFn(42.5, true)),
  temp_internal:  generateHourlySeries(START, HOURS, makeInternalTempFn(34.8)),
  temp_external:  generateHourlySeries(START, HOURS, makeExternalTempFn(15, 10)), // Warmere Tage
  humidity:       generateHourlySeries(START, HOURS, makeHumidityFn()),
  pressure:       generateHourlySeries(START, HOURS, makePressureFn(1015)),
  wind_speed:     generateHourlySeries(START, HOURS, makeWindSpeedFn()),
  // Windrichtung einfach 0-360 random walk
  wind_dir:       generateHourlySeries(START, HOURS, (_, i, last) => (last || 180) + jitter(20) % 360),
  rain_1h:        generateHourlySeries(START, HOURS, makeRain1hFn())
};

// Hive B: Kleineres Volk, kaum Zunahme (Winterfutter-Verbrauch)
const tsB = {
  // false = kein Flow, verliert langsam Gewicht
  weight:         generateHourlySeries(START, HOURS, makeWeightFn(28.0, false)), 
  temp_internal:  generateHourlySeries(START, HOURS, makeInternalTempFn(33.5))
};

// PREVIEW HELPER (Letzte 24h für Sparklines oft besser als nur 4 Werte)
const preview = (series, count = 24) => {
  const obj = {};
  for (const key in series) {
    obj[key] = series[key].slice(-count);
  }
  return obj;
};

// ======================
// EXPORT DEMO STATE
// ======================
export const demoState = {
  meta: {
    generated: new Date().toISOString(),
    period_days: DAYS
  },
  hives: [
    {
      id: "hive_a",
      name: "Standplatz Ost (Wirtschaftsvolk)",
      hiveKey: "BM-A-9K3J-1Q2W",
      features: {
        plan: "pro",
        enabled: ["weight", "temp_internal", "weather_station", "alerting"]
      },
      location: {
        current: {
          lat: 47.0707, // Graz Umgebung
          lon: 15.4395,
          accuracy_m: 4.2,
          fix_time: new Date(new Date(START).getTime() + HOURS * 3600 * 1000).toISOString()
        }
      },
      sensors: {
        // Wir nehmen den allerletzten Wert der generierten Reihe
        weight: { unit: "kg", last: tsA.weight.at(-1)[1], trend: "rising" },
        temp_internal: { unit: "°C", last: tsA.temp_internal.at(-1)[1], status: "ok" },
        weather: {
          temp_external: { unit: "°C", last: tsA.temp_external.at(-1)[1] },
          humidity:      { unit: "%", last: tsA.humidity.at(-1)[1] },
          pressure:      { unit: "hPa", last: tsA.pressure.at(-1)[1] },
          wind_speed:    { unit: "m/s", last: tsA.wind_speed.at(-1)[1] },
          rain_1h:       { unit: "mm", last: tsA.rain_1h.at(-1)[1] }
        }
      },
      timeseries: tsA,
      timeseries_preview: preview(tsA, 12)
    },
    {
      id: "hive_b",
      name: "Waldkante (Ableger)",
      hiveKey: "BM-B-4H8S-7Z9X",
      features: {
        plan: "basic",
        enabled: ["weight", "temp_internal"]
      },
      location: {
        current: {
          lat: 47.3883, 
          lon: 15.0937,
          accuracy_m: 12.0,
          fix_time: new Date(new Date(START).getTime() + HOURS * 3600 * 1000).toISOString()
        }
      },
      sensors: {
        weight: { unit: "kg", last: tsB.weight.at(-1)[1], trend: "stable" },
        temp_internal: { unit: "°C", last: tsB.temp_internal.at(-1)[1], status: "ok" }
      },
      timeseries: tsB,
      timeseries_preview: preview(tsB, 12)
    }
  ]
};