import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Datenschutz() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bee-gray via-white to-bee-yellow/30">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-bee-brown mb-6">
            Datenschutzerklärung
          </h1>
          <div className="space-y-4 text-gray-700">
            <p>
              Diese Seite ist eine Demo-Anwendung. Ergänze hier für den Live-Betrieb
              deine vollständige, rechtssichere Datenschutzerklärung (insbesondere
              Angaben zu Verantwortlichen, erhobenen Daten, Zwecken der Verarbeitung,
              Rechtsgrundlagen, Speicherdauer, Betroffenenrechten, Einsatz von Cookies
              und Drittanbietern usw.).
            </p>
            <p>
              Die hier hinterlegte Beschreibung ist lediglich ein Platzhalter und
              ersetzt keine rechtliche Beratung.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Datenschutz;

