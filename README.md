# Sistema de Login & Registro

Aplicação fullstack de autenticação com painel administrativo.

## Stack

- **Backend:** Python · Flask · Werkzeug (hash de senhas)
- **Frontend:** React 18 · Axios · Chart.js

## Como rodar localmente

### 1. Instalar dependências do backend (uma vez)

```bash
cd api
pip install flask flask-cors werkzeug
```

### 2. Instalar dependências do frontend (uma vez)

```bash
cd frontend
npm install
```

### 3. Iniciar

**Opção A — um clique:**
Dê duplo clique no arquivo `start.bat` na raiz do projeto.

**Opção B — manual (dois terminais):**

```bash
# Terminal 1 - Backend
cd api
python index.py
```

```bash
# Terminal 2 - Frontend
cd frontend
npm start
```

| Serviço  | URL                   |
|----------|-----------------------|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:5000 |

## Credenciais padrão

| Campo | Valor           |
|-------|-----------------|
| Email | admin@gmail.com |
| Senha | 1234            |

> O banco de dados é **em memória** — os dados são resetados ao reiniciar o backend.

## Funcionalidades

- Registro de usuário com confirmação de senha
- Login com validação
- Dashboard com estatísticas e gráficos
- Edição de perfil (nome, email, senha)
- Painel admin: listar usuários, alterar cargo (admin/usuário), deletar usuário
- Notificações toast em vez de `alert()`

## Estrutura

```
sistema-login-register/
├── api/
│   ├── index.py          # API Flask
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   └── Toast.jsx
│       └── config/api.js
└── start.bat             # Inicia tudo com duplo clique
```

## Deploy

O projeto está configurado para deploy no **Vercel** (frontend) + **Render** (backend).
Consulte `DEPLOY.md` para instruções detalhadas.
