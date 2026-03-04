import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useToast } from '../components/Toast';

function HivePair() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    hiveKey: '',
    name: '',
    locationHint: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.hiveKey.trim()) {
      newErrors.hiveKey = 'HiveKey ist erforderlich';
    } else if (form.hiveKey.length < 5) {
      newErrors.hiveKey = 'HiveKey muss mindestens 5 Zeichen lang sein';
    }
    
    if (!form.name.trim()) {
      newErrors.name = 'Anzeigename ist erforderlich';
    } else if (form.name.length < 2) {
      newErrors.name = 'Anzeigename muss mindestens 2 Zeichen lang sein';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('Bitte korrigiere die Fehler im Formular', 'error');
      return;
    }
    
    setSubmitting(true);

    try {
      // In der aktuellen Demo-Version gibt es noch kein echtes Backend-Pairing.
      // Hier könnte später ein API-Call wie `pairHive(hiveKey, name, ...)` erfolgen.
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      showToast(`Bienenstand "${form.name}" erfolgreich hinzugefügt!`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast('Fehler beim Hinzufügen des Bienenstands', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bee-gray via-white to-bee-yellow/30">
      <Header />
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-8">
          <h1 className="text-3xl font-bold text-bee-brown mb-4 text-center">
            Neuer Bienenstand verbinden
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Trage hier den HiveKey deiner Stockwaage ein. In der Demo-Version werden
            keine echten Bienenstände angelegt, aber der Ablauf entspricht der
            späteren Live-Version.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🧾 HiveKey
              </label>
              <input
                type="text"
                name="hiveKey"
                value={form.hiveKey}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                  errors.hiveKey
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-bee-yellow focus:border-bee-green'
                }`}
                placeholder="z.B. BEE-1234-ABCD"
              />
              {errors.hiveKey && (
                <p className="text-red-500 text-sm mt-1">{errors.hiveKey}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🐝 Anzeigename
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                  errors.name
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-bee-yellow focus:border-bee-green'
                }`}
                placeholder="z.B. Stand Obstwiese"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📍 Standort-Hinweis (optional)
              </label>
              <input
                type="text"
                name="locationHint"
                value={form.locationHint}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-bee-yellow rounded-lg focus:outline-none focus:border-bee-green"
                placeholder="z.B. hinter der Scheune, Reihe 2"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-4 py-3 bg-bee-yellow text-bee-brown font-bold rounded-lg hover:bg-bee-green hover:text-white transition disabled:opacity-60"
            >
              {submitting ? 'Verbinde...' : 'Bienenstand verbinden'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/dashboard"
              className="text-bee-brown hover:text-bee-green text-sm"
            >
              ← Zurück zum Dashboard
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default HivePair;

