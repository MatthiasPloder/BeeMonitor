import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Dummy-Produktdaten
const produkte = [
  {
    id: 1,
    name: 'Stockwaage Basic',
    beschreibung: 'Einfache Stockwaage für den Einstieg',
    preis: 299.99,
    bild: '/image.png',
    kategorie: 'Stockwaagen',
  },
  {
    id: 2,
    name: 'Stockwaage Pro',
    beschreibung: 'Professionelle Stockwaage mit WLAN',
    preis: 499.99,
    bild: '/image.png',
    kategorie: 'Stockwaagen',
  },
  {
    id: 3,
    name: 'Temperatursensor',
    beschreibung: 'Präziser Temperatursensor für den Bienenstock',
    preis: 49.99,
    bild: '/image.png',
    kategorie: 'Sensoren',
  },
  {
    id: 4,
    name: 'Feuchtigkeitssensor',
    beschreibung: 'Misst die Luftfeuchtigkeit im Bienenstock',
    preis: 39.99,
    bild: '/image.png',
    kategorie: 'Sensoren',
  },
];

function Shop() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const handleAddToCart = (produkt) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === produkt.id);
      if (existing) {
        return prev.map((p) =>
          p.id === produkt.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [...prev, { ...produkt, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const handleChangeQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.preis, 0),
    [cart]
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bee-gray via-white to-bee-yellow/30">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-bee-brown">Shop</h1>
          <button
            onClick={() => setCartOpen((o) => !o)}
            className="px-4 py-2 bg-bee-yellow text-bee-brown font-bold rounded-lg hover:bg-bee-green hover:text-white transition flex items-center gap-2 relative"
          >
            🛒 Warenkorb
            {totalItems > 0 && (
              <span className="ml-1 inline-flex items-center justify-center rounded-full bg-bee-brown text-bee-yellow text-xs w-6 h-6">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {cartOpen && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold text-bee-brown">Dein Warenkorb</h2>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-sm text-red-500 hover:underline"
                >
                  Warenkorb leeren
                </button>
              )}
            </div>
            {cart.length === 0 ? (
              <p className="text-gray-600 text-sm">
                Noch keine Produkte im Warenkorb. Füge Artikel hinzu, um sie hier zu
                sehen. Ein Checkout ist in dieser Demo noch nicht aktiv.
              </p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-gray-100 pb-2"
                  >
                    <div>
                      <div className="font-semibold text-bee-brown">{item.name}</div>
                      <div className="text-xs text-gray-500">
                        {item.preis.toFixed(2)} € / Stk.
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleChangeQuantity(item.id, -1)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm"
                      >
                        -
                      </button>
                      <span className="min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleChangeQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm"
                      >
                        +
                      </button>
                      <div className="w-20 text-right font-semibold text-bee-brown text-sm">
                        {(item.quantity * item.preis).toFixed(2)} €
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-bee-brown">Zwischensumme</span>
                  <span className="font-bold text-bee-brown text-lg">
                    {totalPrice.toFixed(2)} €
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Hinweis: Dies ist eine Demo. Ein richtiger Checkout mit Bestellung und
                  Zahlung ist noch nicht aktiviert.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {produkte.map((produkt) => (
            <div
              key={produkt.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
            >
              <div className="w-full h-48 bg-bee-gray/40 flex items-center justify-center">
                <img
                  src={produkt.bild}
                  alt={produkt.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Wenn das Bild nicht lädt, bleibt der neutrale Hintergrund */}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-sm text-bee-green font-medium">
                  {produkt.kategorie}
                </span>
                <h2 className="text-xl font-bold text-bee-brown mb-2">
                  {produkt.name}
                </h2>
                <p className="text-gray-600 mb-4 flex-1">{produkt.beschreibung}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-2xl font-bold text-bee-brown">
                    {produkt.preis} €
                  </span>
                  <button
                    onClick={() => handleAddToCart(produkt)}
                    className="px-4 py-2 bg-bee-yellow text-bee-brown font-bold rounded-lg hover:bg-bee-green hover:text-white transition"
                  >
                    In den Warenkorb
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Shop;

