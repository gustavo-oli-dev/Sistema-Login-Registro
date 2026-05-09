import React, { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import './Dashboard.css';
import { API_URL } from '../config/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const CHART_OPTIONS = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
};

function Dashboard({ usuario, onLogout, onUsuarioAtualizado, notify }) {
  const [usuarios, setUsuarios] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [erroPerfil, setErroPerfil] = useState('');
  const [perfilForm, setPerfilForm] = useState({ nome: usuario.nome, email: usuario.email, senha: '' });
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState(null);
  const [cargoSelecionado, setCargoSelecionado] = useState('usuario');
  const [salvandoCargo, setSalvandoCargo] = useState(false);
  const [confirmarDelecao, setConfirmarDelecao] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      const [usuariosRes, estRes] = await Promise.all([
        axios.get(`${API_URL}/usuarios`),
        axios.get(`${API_URL}/estatisticas`),
      ]);
      setUsuarios(usuariosRes.data);
      setEstatisticas(estRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  useEffect(() => {
    setPerfilForm({ nome: usuario.nome, email: usuario.email, senha: '' });
  }, [usuario]);

  const resetarPerfil = useCallback(() => {
    setPerfilForm({ nome: usuario.nome, email: usuario.email, senha: '' });
    setErroPerfil('');
    setMostrarSenha(false);
  }, [usuario]);

  const handlePerfilChange = (e) => {
    const { name, value } = e.target;
    setPerfilForm(prev => ({
      ...prev,
      [name]: name === 'senha' ? value.replace(/\s/g, '') : value,
    }));
  };

  const handleAtualizarPerfil = async (e) => {
    e.preventDefault();
    setErroPerfil('');

    if (perfilForm.senha && perfilForm.senha.length < 4) {
      setErroPerfil('A senha deve ter pelo menos 4 caracteres');
      return;
    }

    setSalvandoPerfil(true);
    try {
      const payload = { nome: perfilForm.nome, email: perfilForm.email };
      if (perfilForm.senha) payload.senha = perfilForm.senha;

      const response = await axios.put(`${API_URL}/usuarios/${usuario.id}`, payload);
      const usuarioAtualizado = { ...usuario, ...response.data.usuario };
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
      onUsuarioAtualizado(usuarioAtualizado);
      setEditandoPerfil(false);
      notify('Perfil atualizado com sucesso!');
      carregarDados();
    } catch (err) {
      setErroPerfil(err.response?.data?.erro || 'Erro ao atualizar perfil');
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const abrirEdicaoUsuario = (user) => {
    setUsuarioEmEdicao(user);
    setCargoSelecionado(user.is_admin ? 'admin' : 'usuario');
    setConfirmarDelecao(false);
  };

  const fecharModal = () => {
    setUsuarioEmEdicao(null);
    setConfirmarDelecao(false);
  };

  const handleAtualizarCargo = async () => {
    if (!usuarioEmEdicao) return;
    setSalvandoCargo(true);
    try {
      const response = await axios.put(
        `${API_URL}/usuarios/${usuarioEmEdicao.id}`,
        { is_admin: cargoSelecionado === 'admin' },
      );
      const atualizado = response.data.usuario;
      setUsuarios(prev => prev.map(u => u.id === atualizado.id ? { ...u, ...atualizado } : u));
      setUsuarioEmEdicao(prev => prev ? { ...prev, ...atualizado } : prev);
      notify('Cargo atualizado com sucesso!');
    } catch (err) {
      notify(err.response?.data?.erro || 'Erro ao atualizar cargo', 'erro');
    } finally {
      setSalvandoCargo(false);
    }
  };

  const handleDeletarUsuario = async () => {
    if (!usuarioEmEdicao) return;
    try {
      await axios.delete(`${API_URL}/usuarios/${usuarioEmEdicao.id}`);
      setUsuarios(prev => prev.filter(u => u.id !== usuarioEmEdicao.id));
      fecharModal();
      notify('Usuário deletado com sucesso!');
    } catch (err) {
      notify(err.response?.data?.erro || 'Erro ao deletar usuário', 'erro');
    }
  };

  if (carregando) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>Carregando...</p>
      </div>
    );
  }

  const chartData = estatisticas ? {
    labels: estatisticas.usuarios_por_dia.map(d => d.dia),
    datasets: [{
      label: 'Cadastros',
      data: estatisticas.usuarios_por_dia.map(d => d.quantidade),
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.08)',
      tension: 0.4,
      fill: true,
    }],
  } : null;

  const barChartData = estatisticas ? {
    labels: ['Total de usuários', 'Novos (semana)'],
    datasets: [{
      label: 'Estatísticas',
      data: [estatisticas.total_usuarios, estatisticas.novos_usuarios_semana],
      backgroundColor: ['rgba(79, 70, 229, 0.7)', 'rgba(124, 58, 237, 0.7)'],
      borderColor: ['#4f46e5', '#7c3aed'],
      borderWidth: 2,
      borderRadius: 8,
    }],
  } : null;

  return (
    <div className="dashboard">
      {/* Modal gerenciar usuário */}
      {usuarioEmEdicao && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Gerenciar usuário</h3>
              <button type="button" className="modal-close" onClick={fecharModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-user-info">
                <p className="modal-user-name">{usuarioEmEdicao.nome}</p>
                <p className="modal-user-email">{usuarioEmEdicao.email}</p>
                <span className={`badge ${usuarioEmEdicao.is_admin ? 'badge-admin' : 'badge-user'}`}>
                  {usuarioEmEdicao.is_admin ? 'Admin' : 'Usuário'}
                </span>
              </div>

              <div className="modal-section">
                <p className="modal-label">Cargo</p>
                <div className="role-buttons">
                  <button
                    type="button"
                    className={`role-btn ${cargoSelecionado === 'usuario' ? 'active' : ''}`}
                    onClick={() => setCargoSelecionado('usuario')}
                  >
                    Usuário
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${cargoSelecionado === 'admin' ? 'active' : ''}`}
                    onClick={() => setCargoSelecionado('admin')}
                  >
                    Admin
                  </button>
                </div>
                <button
                  type="button"
                  className="btn-save-role"
                  onClick={handleAtualizarCargo}
                  disabled={
                    salvandoCargo ||
                    cargoSelecionado === (usuarioEmEdicao.is_admin ? 'admin' : 'usuario')
                  }
                >
                  {salvandoCargo ? 'Salvando...' : 'Salvar cargo'}
                </button>
              </div>

              <div className="modal-section modal-section-danger">
                {confirmarDelecao ? (
                  <div className="confirm-delete">
                    <p>Tem certeza? Essa ação não pode ser desfeita.</p>
                    <div className="confirm-delete-btns">
                      <button type="button" className="btn-danger" onClick={handleDeletarUsuario}>
                        Confirmar exclusão
                      </button>
                      <button type="button" className="btn-cancel" onClick={() => setConfirmarDelecao(false)}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-danger-outline"
                    onClick={() => setConfirmarDelecao(true)}
                  >
                    Deletar usuário
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="header-title">Dashboard</h1>
          <span className="header-user">
            Olá, <strong>{usuario.nome}</strong>
            {usuario.is_admin && <span className="header-badge">Admin</span>}
          </span>
        </div>
        <button type="button" onClick={onLogout} className="btn-logout">Sair</button>
      </header>

      <main className="dashboard-main">
        {editandoPerfil ? (
          /* Sub-página editar perfil */
          <div className="perfil-edit-page">
            <div className="page-header">
              <div>
                <h2>Editar Perfil</h2>
                <p>Atualize suas informações pessoais</p>
              </div>
              <button
                type="button"
                className="btn-back"
                onClick={() => { setEditandoPerfil(false); resetarPerfil(); }}
              >
                Voltar
              </button>
            </div>
            <div className="edit-card">
              <form onSubmit={handleAtualizarPerfil}>
                <div className="edit-form-group">
                  <label>Nome de usuário</label>
                  <input
                    type="text"
                    name="nome"
                    value={perfilForm.nome}
                    onChange={handlePerfilChange}
                    required
                  />
                </div>
                <div className="edit-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={perfilForm.email}
                    onChange={handlePerfilChange}
                    required
                  />
                </div>
                <div className="edit-form-group">
                  <label>
                    Nova senha
                    <span className="label-hint"> (deixe em branco para manter)</span>
                  </label>
                  <div className="edit-password-wrapper">
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      name="senha"
                      value={perfilForm.senha}
                      onChange={handlePerfilChange}
                      placeholder="••••••••"
                      minLength={perfilForm.senha ? 4 : undefined}
                    />
                    <button
                      type="button"
                      className={`edit-password-toggle ${!mostrarSenha ? 'oculta' : ''}`}
                      onClick={() => setMostrarSenha(v => !v)}
                    >
                      <span className="edit-eye-icon" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {erroPerfil && <div className="form-erro">{erroPerfil}</div>}
                <div className="edit-actions">
                  <button type="submit" className="btn-save" disabled={salvandoPerfil}>
                    {salvandoPerfil ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => { setEditandoPerfil(false); resetarPerfil(); }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* Cards de estatísticas */}
            {estatisticas && (
              <div className="stats-grid">
                <div className="stat-card">
                  <p className="stat-label">Total de usuários</p>
                  <p className="stat-value">{estatisticas.total_usuarios}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">Administradores</p>
                  <p className="stat-value">{estatisticas.total_admins}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">Novos esta semana</p>
                  <p className="stat-value">{estatisticas.novos_usuarios_semana}</p>
                </div>
              </div>
            )}

            {/* Perfil */}
            <div className="content-card">
              <div className="card-header">
                <h2>Meu Perfil</h2>
                <button type="button" onClick={() => setEditandoPerfil(true)} className="btn-edit">
                  Editar
                </button>
              </div>
              <div className="perfil-info">
                <div className="info-row">
                  <span className="info-label">Nome</span>
                  <span className="info-value">{usuario.nome}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{usuario.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Cargo</span>
                  <span className={`badge ${usuario.is_admin ? 'badge-admin' : 'badge-user'}`}>
                    {usuario.is_admin ? 'Administrador' : 'Usuário'}
                  </span>
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="content-card">
              <div className="card-header">
                <h2>Estatísticas</h2>
                <span className="card-hint">dados reais do sistema</span>
              </div>
              <div className="charts-grid">
                {chartData && (
                  <div className="chart-wrap">
                    <h3>Cadastros por dia</h3>
                    <Line data={chartData} options={CHART_OPTIONS} />
                  </div>
                )}
                {barChartData && (
                  <div className="chart-wrap">
                    <h3>Resumo geral</h3>
                    <Bar data={barChartData} options={CHART_OPTIONS} />
                  </div>
                )}
              </div>
            </div>

            {/* Tabela de usuários (admin only) */}
            {usuario.is_admin && (
              <div className="content-card">
                <div className="card-header">
                  <h2>Usuários cadastrados</h2>
                  <span className="card-hint">{usuarios.length} no total</span>
                </div>
                <div className="table-wrap">
                  <table className="usuarios-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Cadastro</th>
                        <th>Cargo</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map(user => (
                        <tr key={user.id}>
                          <td className="td-id">{user.id}</td>
                          <td>{user.nome}</td>
                          <td>{user.email}</td>
                          <td>{new Date(user.data_criacao).toLocaleDateString('pt-BR')}</td>
                          <td>
                            <span className={`badge ${user.is_admin ? 'badge-admin' : 'badge-user'}`}>
                              {user.is_admin ? 'Admin' : 'Usuário'}
                            </span>
                          </td>
                          <td>
                            {user.id !== usuario.id && (
                              <button
                                type="button"
                                className="btn-table-edit"
                                onClick={() => abrirEdicaoUsuario(user)}
                                disabled={user.id === 0 && usuario.id !== 0}
                              >
                                Editar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
