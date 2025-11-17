Passo a passo para rodar o projeto

Abrir o projeto

No VS Code, abra a pasta do projeto
(a raiz, tipo: Projeto-Fullstack-Daily-Diet-master).

Instalar dependências do backend

No terminal do VS Code:

cd daily-diet/backend
npm install


Instalar dependências do frontend

cd ../frontend
npm install


Gerar o client do Prisma (no backend)

cd ../backend
npx prisma generate

Voltar para a raiz do projeto e subir tudo

cd ../..   # volta pra raiz do projeto
npm run dev
