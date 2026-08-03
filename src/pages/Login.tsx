import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import { AVATARS } from '../types';
import * as motion from 'motion/react-client';

export function Login() {
  const { loginWithGoogle, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const [isGuestForm, setIsGuestForm] = useState(false);
  
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [age, setAge] = useState(7);
  const [color, setColor] = useState('Azul');

  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg('');
      await loginWithGoogle();
      navigate('/');
    } catch (error: any) {
      console.error(error);
      setErrorMsg('Error al iniciar sesión con Google. Si estás en GitHub Pages, debes agregar este dominio a la lista de "Dominios autorizados" en la consola de Firebase Authentication. Detalles: ' + error.message);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      setErrorMsg('');
      await loginAsGuest(name, avatar, age, color);
      navigate('/');
    } catch (error: any) {
      console.error(error);
      setErrorMsg('Error al crear invitado: ' + error.message);
    }
  };

  return (
    <PageContainer className="items-center justify-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Card className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-cyan-600 mb-2">¡Únete a la Fiesta!</h1>
            <p className="text-slate-500 font-medium">Crea tu pase VIP submarino</p>
          </div>

          {errorMsg && (<div className="mb-6 p-4 bg-red-100 border-2 border-red-400 text-red-700 rounded-xl font-bold text-sm">{errorMsg}</div>)}{!isGuestForm ? (
            <div className="space-y-4">
              <Button onClick={handleGoogleLogin} variant="secondary" className="w-full text-lg h-14">
                🚀 Entrar con Google
              </Button>
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 font-bold">O</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
              <Button onClick={() => setIsGuestForm(true)} variant="accent" className="w-full text-lg h-14">
                🎟️ Crear Pase de Invitado
              </Button>
            </div>
          ) : (
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tu Nombre</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-bold text-lg"
                  placeholder="Ej. Bob"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Elige tu Avatar</label>
                <div className="grid grid-cols-5 gap-2">
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
                <Button type="submit" variant="primary" className="w-full h-14 text-lg">
                  ¡A Jugar! 🎉
                </Button>
                <Button type="button" variant="ghost" className="w-full text-slate-500 hover:text-slate-700" onClick={() => setIsGuestForm(false)}>
                  Volver
                </Button>
              </div>
            </form>
          )}
        </Card>
      </motion.div>
    </PageContainer>
  );
}
