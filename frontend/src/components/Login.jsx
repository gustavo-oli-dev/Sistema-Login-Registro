import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import { API_URL } from '../config/api';

function Login({ onSuccess, onSwitchMode }) {
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'senha' ? value.replace(/\s/g, '') : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData);
      const usuario = response.data.usuario;
      localStorage.setItem('token', 'logged-in');
      onSuccess(usuario);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao fazer login');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-top">
          <h1>Bem-vindo de volta</h1>
          <p>Entre com sua conta para continuar</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <div className="password-input-wrapper">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Sua senha"
                required
              />
              <button
                type="button"
                className={`password-toggle-btn ${!mostrarSenha ? 'oculta' : ''}`}
                onClick={() => setMostrarSenha(v => !v)}
                title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <span className="eye-icon" aria-hidden="true" />
              </button>
            </div>
          </div>
          {erro && <div className="erro">{erro}</div>}
          <button type="submit" className="btn-primary" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="auth-switch">
          Não tem conta?
          <button type="button" onClick={onSwitchMode} className="link-btn">
            Registre-se
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
