# 🚀 Como Publicar o PigeonMaster AI — Passo a Passo

> Guia definitivo. Siga na ordem, sem pular etapas.

---

## PARTE 1 — Criar o banco de dados grátis (5 minutos)

O app precisa de um banco PostgreSQL. O Neon é grátis e simples:

1. Acesse **https://neon.tech** e clique em **Sign Up** (pode entrar com GitHub)
2. Clique em **Create Project** → dê o nome `pigeonmaster` → **Create**
3. Na tela do projeto, copie a **Connection String** (começa com `postgresql://...`)
   - Ela se parece com:
     `postgresql://usuario:senha@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`
4. **Guarde essa string** — você vai usá-la 2 vezes abaixo.

### Criar as tabelas no banco

No seu computador, dentro da pasta do projeto, rode UMA VEZ no terminal:

```bash
npm install
```

Depois (cole a SUA string no lugar):

```bash
# Windows (PowerShell):
$env:DATABASE_URL="postgresql://SUA_STRING_AQUI"; npx drizzle-kit push

# Mac/Linux:
DATABASE_URL="postgresql://SUA_STRING_AQUI" npx drizzle-kit push
```

Deve aparecer `[✓] Changes applied`. Pronto, banco criado!

---

## PARTE 2 — Limpar e subir o código para o GitHub

⚠️ **MUITO IMPORTANTE**: as pastas `node_modules` e `.next` NÃO podem ir
para o GitHub (o arquivo `.gitignore` deste projeto já cuida disso, mas se
você já subiu antes SEM ele, precisa limpar).

### Se o repositório nutripombos JÁ existe com lixo dentro:

O jeito mais fácil é recomeçar limpo:

1. No GitHub, vá no repositório → **Settings** → role até o final → **Delete this repository**
2. Crie um novo: **https://github.com/new** → nome `nutripombos` → **Create repository**

### Subir o código limpo:

Na pasta do projeto, no terminal:

```bash
git init
git add .
git commit -m "PigeonMaster AI"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/nutripombos.git
git push -u origin main
```

✅ Confira no GitHub: deve ter `src/`, `public/`, `package.json`, `netlify.toml` —
e **NÃO** deve ter `node_modules` nem `.next`.

---

## PARTE 3 — Publicar (escolha UMA plataforma)

### ⭐ Opção A: VERCEL (recomendada — é a empresa do Next.js, zero configuração)

1. Acesse **https://vercel.com** → **Sign Up** com o GitHub
2. Clique em **Add New → Project**
3. Escolha o repositório **nutripombos** → **Import**
4. Antes de clicar em Deploy, abra **Environment Variables** e adicione:
   - Name: `DATABASE_URL`
   - Value: `postgresql://...sua string do Neon...`
5. Clique em **Deploy** e aguarde ~2 minutos
6. 🎉 Pronto! Seu app estará em `https://nutripombos.vercel.app`

### Opção B: NETLIFY (se preferir continuar nela)

1. Acesse **https://app.netlify.com**
2. **Add new site → Import an existing project → GitHub**
3. Escolha o repositório **nutripombos**
4. NÃO mude nada nos campos de build (o `netlify.toml` já configura tudo)
5. Clique em **Add environment variables** e adicione:
   - Key: `DATABASE_URL`
   - Value: `postgresql://...sua string do Neon...`
6. **Deploy site**

> ❌ NUNCA use o "arrastar pasta" (drag & drop) da Netlify — não funciona
> para este tipo de aplicativo.

---

## PARTE 4 — Levar seus dados junto (opcional)

Se você já cadastrou pombos/provas na versão de testes:

1. Na versão antiga, abra **💾 Backup** → **Baixar Backup**
2. Na versão publicada, abra **💾 Backup** → **Selecionar arquivo de backup**
3. Todos os dados são restaurados!

---

## ❓ Problemas comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Build failed / exit code 1 | `node_modules` ou `.next` no GitHub | Recomeçar repositório limpo (Parte 2) |
| Página abre mas dá erro nas listas | `DATABASE_URL` não configurada | Adicionar variável na plataforma e fazer redeploy |
| "relation does not exist" | Tabelas não criadas | Rodar o `npx drizzle-kit push` (Parte 1) |
| Node version error | Node antigo | O `.nvmrc` já resolve — confira se ele subiu para o GitHub |
