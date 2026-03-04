import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Impressum() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bee-gray via-white to-bee-yellow/30">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-bee-brown mb-6">Impressum</h1>
          <div className="space-y-4 text-gray-700">
            <p>
              Dies ist eine Demo-Anwendung von <strong>BeeMonitor</strong>. Trage hier
              für den Live-Betrieb deine vollständigen Impressumsdaten (Name/Firma,
              Anschrift, Kontakt, Vertretungsberechtigte, Registerangaben usw.) ein.
            </p>
            <p>
              Die hier dargestellten Inhalte dienen ausschließlich der Demonstration der
              Benutzeroberfläche und stellen kein rechtliches Impressum dar.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Impressum;

