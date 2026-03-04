import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-bee-brown to-bee-green text-bee-yellow py-6 mt-12 shadow-inner">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-3">
        <div className="flex items-center gap-2 text-center md:text-left">
          <span className="font-semibold text-lg">
            BeeMonitor &copy; {new Date().getFullYear()} – Für Imker mit Herz 🐝
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/impressum" className="hover:underline">
            Impressum
          </Link>
          <Link to="/datenschutz" className="hover:underline">
            Datenschutz
          </Link>
        </div>
      </div>
    </footer>
  );
}
 
