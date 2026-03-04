import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { login, register } from '../api';
import { useToast } from '../components/Toast';

function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    
    // Validation
    const newErrors = {};
    if (!formData.email || !validateEmail(formData.email)) {
      newErrors.email = 'Bitte gib eine gültige E-Mail-Adresse ein';
    }
    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (!isLogin && !validatePassword(formData.password)) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }
    if (!isLogin && !formData.username.trim()) {
      newErrors.username = 'Benutzername ist erforderlich';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);

    try {
      // Demo-Login (wenn Backend nicht verfügbar)
      if (isLogin && formData.email === 'bee@monitor.app') {
        const mockUser = { 
          username: 'Alex', 
          email: formData.email,
          name: 'Alex'
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', 'demo-token');
        showToast('Erfolgreich angemeldet!', 'success');
        navigate('/dashboard');
        return;
      }

      // Echter Login/Register mit Backend
      if (isLogin) {
        await login(formData.email, formData.password);
        showToast('Erfolgreich angemeldet!', 'success');
      } else {
        await register(formData.username, formData.email, formData.password);
        showToast('Registrierung erfolgreich!', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.message || 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!formData.email || !validateEmail(formData.email)) {
      showToast('Bitte gib eine gültige E-Mail-Adresse ein', 'error');
      return;
    }
    // In einer echten App würde hier ein API-Call erfolgen
    showToast(`Passwort-Reset-Link wurde an ${formData.email} gesendet (Demo)`, 'success');
    setShowPasswordReset(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-bee-gray via-white to-bee-yellow/30">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-bold text-bee-brown mb-6 text-center">
            {isLogin ? 'Anmelden' : 'Registrieren'}
          </h2>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {showPasswordReset ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <p className="text-gray-600 mb-4">
                Gib deine E-Mail-Adresse ein, um einen Passwort-Reset-Link zu erhalten.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📧 E-Mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
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
              <button
                type="submit"
                className="w-full py-3 bg-bee-yellow text-bee-brown font-bold rounded-lg hover:bg-bee-green hover:text-white transition"
              >
                Reset-Link senden
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordReset(false)}
                className="w-full py-2 text-bee-brown hover:text-bee-green transition"
              >
                ← Zurück zum Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    👤 Benutzername
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
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
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📧 E-Mail
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
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
                  🔒 Passwort
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none ${
                    errors.password
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-bee-yellow focus:border-bee-green'
                  }`}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-bee-yellow text-bee-brown font-bold rounded-lg hover:bg-bee-green hover:text-white transition disabled:opacity-60"
              >
                {loading ? 'Lädt...' : isLogin ? 'Anmelden' : 'Registrieren'}
              </button>
            </form>
          )}
          <div className="mt-6 text-center space-y-2">
            {isLogin && !showPasswordReset && (
              <button
                onClick={() => setShowPasswordReset(true)}
                className="block w-full text-bee-brown hover:text-bee-green transition text-sm"
              >
                Passwort vergessen?
              </button>
            )}
            {!showPasswordReset && (
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-bee-brown hover:text-bee-green transition"
              >
                {isLogin ? 'Noch kein Konto? Registrieren' : 'Bereits registriert? Anmelden'}
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Login;

