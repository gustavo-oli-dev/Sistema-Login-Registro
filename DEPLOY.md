### Opção 1: Usar o script de inicialização
Clique 2x no arquivo `start.bat` (Windows) ou execute:
```bash
./start.bat
```

### Opção 2: Iniciar manualmente
```bash
# Terminal 1 (Backend)
cd backend
python app.py

# Terminal 2 (Frontend)
cd frontend
npm start
```

A aplicação será aberta em: **http://localhost:3000**

## Estrutura do projeto

```
sistema-login-register/
├── backend/          # API Flask (porta 5000)
├── frontend/         # React (porta 3000)
├── docs/             # Documentação
├── .gitignore        # Arquivos a ignorar no Git
├── README.md         # Informações do projeto
├── start.bat         # Script para iniciar tudo
└── DEPLOY.md         # Este arquivo
```

---

**Pronto!** Seu projeto está configurado para fazer push em qualquer repositório GitHub.
