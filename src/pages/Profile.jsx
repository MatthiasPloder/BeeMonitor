import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useToast } from '../components/Toast';

function Profile() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    name: user?.name || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = 'Bitte gib eine gültige E-Mail-Adresse ein';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Benutzername ist erforderlich';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // In einer echten App würde hier ein API-Call erfolgen
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      showToast('Profil erfolgreich aktualisiert!', 'success');
    } catch (err) {
      showToast('Fehler beim Aktualisieren des Profils', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const oldPassword = e.target.oldPassword.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword.length < 6) {
      showToast('Neues Passwort muss mindestens 6 Zeichen lang sein', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwörter stimmen nicht überein', 'error');
      return;
    }

    // In einer echten App würde hier ein API-Call erfolgen
    showToast('Passwort erfolgreich geändert (Demo)', 'success');
    e.target.reset();
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bee-gray via-white to-bee-yellow/30">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        <h1 className="text-3xl font-bold text-bee-brown mb-8">Mein Profil</h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-bee-brown mb-4">Profilinformationen</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                👤 Benutzername
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                  errors.username
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-bee-yellow focus:border-bee-green'
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📧 E-Mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                  errors.email
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-bee-yellow focus:border-bee-green'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📝 Name (optional)
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-bee-yellow rounded-lg focus:outline-none focus:border-bee-green"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-bee-yellow text-bee-brown font-bold rounded-lg hover:bg-bee-green hover:text-white transition disabled:opacity-60"
            >
              {loading ? 'Speichere...' : 'Profil speichern'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-bee-brown mb-4">Passwort ändern</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔒 Aktuelles Passwort
              </label>
              <input
                type="password"
                name="oldPassword"
                required
                className="w-full px-4 py-2 border-2 border-bee-yellow rounded-lg focus:outline-none focus:border-bee-green"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔒 Neues Passwort
              </label>
              <input
                type="password"
                name="newPassword"
                required
                minLength={6}
                className="w-full px-4 py-2 border-2 border-bee-yellow rounded-lg focus:outline-none focus:border-bee-green"
              />
              <p className="text-gray-500 text-xs mt-1">Mindestens 6 Zeichen</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                🔒 Passwort bestätigen
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                className="w-full px-4 py-2 border-2 border-bee-yellow rounded-lg focus:outline-none focus:border-bee-green"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-bee-yellow text-bee-brown font-bold rounded-lg hover:bg-bee-green hover:text-white transition"
            >
              Passwort ändern
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Profile;
