import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bee-gray via-white to-bee-yellow/30">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-bee-yellow/20 py-20">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-extrabold text-bee-brown mb-6">Willkommen bei BeeMonitor</h1>
            <p className="text-xl text-bee-brown/80 mb-8">Ihre intelligente Lösung für die moderne Imkerei</p>
            <div className="flex gap-4 justify-center">
              <Link to="/login" className="px-8 py-3 bg-bee-yellow text-bee-brown font-bold rounded-lg hover:bg-bee-green hover:text-white transition">
                👤 Login
              </Link>
              <Link to="/shop" className="px-8 py-3 bg-white text-bee-brown font-bold rounded-lg hover:bg-bee-green hover:text-white transition">
                🛒 Shop
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-bee-brown mb-12 text-center">Unsere Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4">🍯</div>
                <h3 className="text-xl font-bold text-bee-brown mb-2">Echtzeit-Monitoring</h3>
                <p className="text-gray-600">Überwachen Sie Ihre Bienenstöcke in Echtzeit mit präzisen Sensordaten.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-bee-brown mb-2">Detaillierte Analysen</h3>
                <p className="text-gray-600">Erhalten Sie tiefe Einblicke in das Verhalten Ihrer Bienenvölker.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4">🛒</div>
                <h3 className="text-xl font-bold text-bee-brown mb-2">Qualitätsprodukte</h3>
                <p className="text-gray-600">Entdecken Sie unsere hochwertigen Imkereiprodukte im Shop.</p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-bee-gray/30 py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-bee-brown mb-8 text-center">Über BeeMonitor</h2>
            <div className="prose max-w-none text-center">
              <p className="text-lg text-gray-700 mb-6">
                BeeMonitor ist Ihre digitale Unterstützung für die moderne Imkerei. 
                Mit unserer innovativen Technologie können Sie Ihre Bienenvölker optimal überwachen und pflegen.
              </p>
              <p className="text-lg text-gray-700">
                Melden Sie sich an, um Zugriff auf Ihre persönlichen Bienenstände zu erhalten, 
                oder besuchen Sie unseren Shop für hochwertige Imkereiprodukte.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Home;

