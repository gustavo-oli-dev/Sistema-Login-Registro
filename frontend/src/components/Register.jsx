import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import { API_URL } from '../config/api';

function Register({ onSuccess, onSwitchMode }) {
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', confirmarSenha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const senhaFields = ['senha', 'confirmarSenha'];
    setFormData(prev => ({
      ...prev,
      [name]: senhaFields.includes(name) ? value.replace(/\s/g, '') : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');

    if (formData.senha.length < 4) {
      setErro('A senha deve ter pelo menos 4 caracteres');
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    setCarregando(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
      });
      localStorage.setItem('token', 'logged-in');
      onSuccess(response.data.usuario);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao registrar');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card-top">
          <h1>Criar conta</h1>
          <p>Preencha os dados abaixo para se registrar</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome de usuário</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Seu nome"
              required
            />
          </div>

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

          <div className="form-divider"><span>Segurança</span></div>

          <div className="form-row">
            <div className="form-group">
              <label>Senha</label>
              <div className="password-input-wrapper">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Mín. 4 caracteres"
                  minLength={4}
                  required
                />
                <button
                  type="button"
                  className={`password-toggle-btn ${!mostrarSenha ? 'oculta' : ''}`}
                  onClick={() => setMostrarSenha(v => !v)}
                  title={mostrarSenha ? 'Ocultar' : 'Mostrar'}
                >
                  <span className="eye-icon" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirmar senha</label>
              <div className="password-input-wrapper">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  placeholder="Repita a senha"
                  required
                />
              </div>
            </div>
          </div>

          {erro && <div className="erro">{erro}</div>}

          <div className="btn-row">
            <button type="button" onClick={onSwitchMode} className="btn-secondary">
              Já tenho conta
            </button>
            <button type="submit" className="btn-primary" disabled={carregando}>
              {carregando ? 'Criando...' : 'Criar conta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
