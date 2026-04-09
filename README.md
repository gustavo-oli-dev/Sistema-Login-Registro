# Sistema de Login & Registro

Aplicacao full stack com autenticacao, painel administrativo e CRUD de usuarios.

## Acessar projeto

[Abrir aplicacao](https://sistemalogin-hot0.onrender.com)

## Estrutura

- `backend/` — API Flask (porta `5000`)
- `frontend/` — interface React (porta `3000`)

## Funcionalidades

### Backend
- Registro de novos usuarios
- Login com validacao
- CRUD completo de usuarios
- API REST
- Senhas com hash

### Frontend
- Tela de login
- Tela de cadastro
- Dashboard do usuario
- Graficos com Chart.js
- Tabela de usuarios cadastrados
- Edicao de perfil
- Exclusao de usuarios por administrador

## Como executar localmente

### Opcao rapida (Windows)
Clique 2x no arquivo `start.bat` — abre o backend, o frontend e o navegador automaticamente.

### Manual

```bash
# Terminal 1 — Backend
cd backend
venv\Scripts\activate
python app.py

# Terminal 2 — Frontend
cd frontend
npm install
npm start
```

Acesse em `http://localhost:3000`

## Endpoints da API

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Login |
| GET | `/api/usuarios` | Listar usuarios |
| GET | `/api/estatisticas` | Estatisticas |
| PUT | `/api/usuarios/<id>` | Atualizar usuario |
| DELETE | `/api/usuarios/<id>` | Deletar usuario |
| GET | `/api/health` | Status da API |
