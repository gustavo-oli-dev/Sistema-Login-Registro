import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Toast from './components/Toast';

function App() {
  const [modo, setModo] = useState('login');
  const [usuario, setUsuario] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  }, []);

  const notify = useCallback((mensagem, tipo = 'sucesso') => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleLoginSucesso = (usuarioData) => {
    setUsuario(usuarioData);
    setModo('dashboard');
  };

  const handleRegistroSucesso = (usuarioData) => {
    setUsuario(usuarioData);
    setModo('dashboard');
    notify('Conta criada com sucesso!');
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    setUsuario(null);
    setModo('login');
  };

  const handleUsuarioAtualizado = (usuarioAtualizado) => {
    setUsuario(usuarioAtualizado);
  };

  return (
    <div className="app">
      {toast && (
        <Toast mensagem={toast.mensagem} tipo={toast.tipo} onClose={() => setToast(null)} />
      )}
      {modo === 'dashboard' && usuario ? (
        <Dashboard
          usuario={usuario}
          onLogout={handleLogout}
          onUsuarioAtualizado={handleUsuarioAtualizado}
          notify={notify}
        />
      ) : modo === 'register' ? (
        <Register onSuccess={handleRegistroSucesso} onSwitchMode={() => setModo('login')} />
      ) : (
        <Login onSuccess={handleLoginSucesso} onSwitchMode={() => setModo('register')} />
      )}
    </div>
  );
}

export default App;
