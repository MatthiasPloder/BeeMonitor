import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bee-gray via-white to-bee-yellow/30">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg text-center">
          <div className="text-6xl mb-4">🐝</div>
          <h1 className="text-3xl font-bold text-bee-brown mb-2">
            Seite nicht gefunden
          </h1>
          <p className="text-gray-600 mb-6">
            Diese Seite summt leider noch nicht. Prüfe die Adresse oder gehe zurück zur
            Startseite.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-bee-yellow text-bee-brown font-bold rounded-lg hover:bg-bee-green hover:text-white transition"
          >
            Zur Startseite
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default NotFound;

