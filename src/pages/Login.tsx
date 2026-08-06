import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { AVATARS } from '../types';
import * as motion from 'motion/react-client';

export function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [age, setAge] = useState(7);
  const [color, setColor] = useState('Azul');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !pin) return;
    try {
      setLoading(true);
      setErrorMsg('');
      await login(username, pin);
      navigate('/');
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !pin) return;
    try {
      setLoading(true);
      setErrorMsg('');
      await register(username, pin, avatar, age, color);
      navigate('/');
    } catch (error: any) {
      setErrorMsg(error.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer className="items-center justify-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Card className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-cyan-600 mb-2">¡Únete a la Fiesta!</h1>
            <p className="text-slate-500 font-medium">
              {isRegistering ? 'Crea tu pase VIP submarino' : 'Ingresa con tu pase VIP'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl font-bold text-sm">
              {errorMsg}
            </div>
          )}

          {!isRegistering ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Nombre de Usuario</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-bold text-lg"
                  placeholder="Ej. Capitán Marino"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Contraseña secreta</label>
                <input 
                  type="password" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-bold text-lg"
                  placeholder="Escribe tu contraseña..."
                  required
                />
              </div>
              
              <div className="pt-4 space-y-3">
                <Button type="submit" variant="primary" className="w-full h-14 text-lg" disabled={loading}>
                  {loading ? 'Entrando...' : '¡A Jugar! 🎉'}
                </Button>
                <div className="text-center pt-2">
                  <span className="text-slate-500">¿No tienes pase? </span>
                  <button type="button" onClick={() => setIsRegistering(true)} className="text-cyan-600 font-bold hover:underline">
                    Crear uno nuevo
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tu Nombre</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-bold text-lg"
                  placeholder="Ej. Bob"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Crea una contraseña secreta</label>
                <input 
                  type="password" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-bold text-lg"
                  placeholder="Para que nadie más use tu pase..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Elige tu Avatar</label>
                <div className="flex flex-wrap justify-center gap-2">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvatar(a)}
                      className={`text-3xl p-2 rounded-xl border-2 transition-all hover:scale-110 ${avatar === a ? 'border-pink-500 bg-pink-50 scale-110' : 'border-transparent bg-slate-50'}`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Edad</label>
                  <input 
                    type="number" 
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    min="1" max="99"
                    className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-pink-400 outline-none font-bold text-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Color Favorito</label>
                  <select 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-pink-400 outline-none font-bold text-lg bg-white"
                  >
                    <option>Azul</option>
                    <option>Rosa</option>
                    <option>Amarillo</option>
                    <option>Verde</option>
                    <option>Morado</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button type="submit" variant="accent" className="w-full h-14 text-lg" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear Pase'}
                </Button>
                <div className="text-center pt-2">
                  <span className="text-slate-500">¿Ya tienes pase? </span>
                  <button type="button" onClick={() => setIsRegistering(false)} className="text-cyan-600 font-bold hover:underline">
                    Ingresar
                  </button>
                </div>
              </div>
            </form>
          )}
        </Card>
      </motion.div>
    </PageContainer>
  );
}
