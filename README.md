# Aplicação Web FullStack: Sistema de Cardápio Digital e Gestão de Pedidos

Sistema completo desenvolvido para restaurantes, com duas interfaces distintas:

## 👥 Interface do Cliente
- **🔐 Login automático** por número da mesa
- **📱 Cardápio interativo** com carrossel de produtos
- **♿ Sistema de acessibilidade** com gestos e comando de voz
- **🛒 Carrinho de compras** integrado
- **📤 Envio de pedidos** direto para a cozinha

## ⚙️ Interface do Administrador
- **🔑 Login** com usuário e senha
- **📊 CRUD completo** do cardápio
- **🖼️ Upload de imagens** dos produtos
- **📋 Visualização de todos os pedidos**
- **🔄 Atualização de status** dos pedidos
- **📱 Interface responsiva**

---

## 🛠️ Tecnologias Utilizadas

### Backend (Node.js + Express)
- **Node.js + Express** → Servidor API
- **MongoDB + Mongoose** → Banco de dados
- **JWT** → Autenticação por tokens
- **Multer** → Upload de imagens
- **CORS** → Comunicação front/backend
- **Dotenv** → Variáveis de ambiente

### Frontend (HTML + CSS + JS Puro)
- **HTML/CSS/JavaScript Vanilla** → Interface
- **API Fetch** → Comunicação com backend
- **Hammer.js** → Sistema de gestos touch
- **Web Speech API** → Acessibilidade por voz
- **LocalStorage** → Armazenamento local

---

## 🚀 Instalação e Execução

### Configuração do Backend
```bash
# Inicializar projeto
npm init -y

# Instalar dependências
npm install express mongoose cors dotenv jsonwebtoken multer

# Instalar dependência de desenvolvimento
npm install --save-dev nodemon
```

### Scripts do package.json
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Executar a aplicação
```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Modo produção
npm start
```

---

## 🏗️ Arquitetura do Backend

### Config/
- `db.js` → Conexão com o banco de dados

### Controllers/ (Regras de negócio)
- `authController.js` → Login, cadastro, logout
- `menuController.js` → Adicionar/editar/remover itens do cardápio
- `orderController.js` → Criar pedidos, status dos pedidos

### Middleware/
- `authMiddleware.js` → Verifica se usuário está logado

### Models/ (Estrutura dos dados)
- `User.js` → Dados do usuário
- `MenuItem.js` → Itens do cardápio
- `Order.js` → Pedidos dos clientes

### Routes/ (Rotas da API)
- `authRoutes.js` → Rotas de login/cadastro (admin ou mesa)
- `menuRoutes.js` → Rotas do cardápio (GET: livre | POST/PUT/DELETE: admin)
- `orderRoutes.js` → Rotas de pedidos (POST: livre | GET/PUT/DELETE: admin)

### Arquivo Principal
- `server.js` → Servidor Express na porta 5000
- Configura CORS para todas as origens
- Inclui rota `/health` para verificação
- Usa variável de ambiente para porta
- Conecta rotas da API

---

## 🎨 Arquitetura do Frontend

### CSS/ (Estilos)
- `style.css` → Estilos gerais
- `login.css` → Tela de login
- `menu.css` → Cardápio
- `admin.css` → Painel administrativo
- `modal.css` → Janelas pop-up

### JS/ (Funcionalidades)
- `auth.js` → Login (admin ou mesa) e redirecionamento
- `api.js` → Comunicação com backend e envio automático de token
- `menu.js` → Interface do cliente, carrinho e temas
- `admin.js` → Painel admin: gerencia cardápio e pedidos
- `modal.js` → Pop-ups personalizados com design consistente
- `gestures.js` → Sistema de acessibilidade por gestos (Hammer.js) e Leitor de voz (Web Speech API)

### Pages/ (Telas)
- `login.html` → Tela de login
- `menu.html` → Cardápio para clientes
- `admin.html` → Painel do administrador

### Arquivo Principal
- `index.html` → Página inicial

---

## ♿ Sistema de Acessibilidade (Gestos)
- **Swipe vertical** → Alterna entre cardápio/pedido
- **Swipe horizontal** → Navega entre itens
- **Toque duplo** → Adiciona/remove itens
- **Toque triplo** → Envia pedido (com confirmação)
- **Leitor de voz** para feedback
- **Suporte iOS/Android** com gestos diferenciados

---
