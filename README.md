# Quiz N2B1

Aplicativo React Native (Expo) para criar, organizar e jogar quizzes personalizados mesmo sem conexão. O projeto prioriza uma experiência guiada para cadastrar temas, montar perguntas com alternativas e acompanhar o desempenho ao final de cada rodada.

## Funcionalidades principais
- Cadastro, edição e exclusão de temas com nome, descrição e cor (``ThemesScreen``).
- Gestão de perguntas por tema com quatro alternativas e exatamente uma correta (``QuestionFormScreen``).
- Seleção de perguntas aleatórias por tema e controle da quantidade antes de iniciar a partida (``QuizSetupScreen``).
- Modo de jogo com feedback visual imediato de acertos/erros e indicador de progresso (``QuizPlayScreen``).
- Resumo com percentual de acertos e lista das respostas corretas e escolhidas (``QuizSummaryScreen``).
- Métricas rápidas na tela inicial sobre temas e perguntas cadastradas.

## Tecnologias e bibliotecas
- Expo 54 + React Native 0.81.
- React 19 com React Navigation (stack nativo).
- Expo SQLite para persistência local com migrações automatizadas.
- TypeScript e componentes reutilizáveis tipados.

## Pré-requisitos
- Node.js 18 LTS ou mais recente e npm 9+.
- Expo CLI opcionalmente instalado globalmente (``npm install -g expo``).
- Aplicativo Expo Go no dispositivo físico ou emulador configurado.

## Como executar localmente
1. Instale as dependências: ``npm install``.
2. Inicie o projeto com ``npm run start``.
3. Use ``npm run android`` ou ``npm run ios`` para abrir diretamente no emulador correspondente, ou leia o QR Code exibido no Expo Go.
4. Para testar no navegador utilize ``npm run web`` (limitado aos recursos suportados pelo Expo Web).

O banco ``quiz.db`` é criado automaticamente na primeira execução; basta manter o app aberto até concluir as migrações.

## Estrutura de pastas
```
App.tsx
src/
  components/       # Botões, cartões, campos de texto e layout reutilizável
  database/         # Conexão SQLite, migrações e repositórios por domínio
  hooks/            # Hooks utilitários (efeitos assíncronos, montagem)
  navigation/       # Stack navigator e tipagens de rotas
  screens/          # Telas de fluxo (home, temas, perguntas, quiz)
  theme/            # Paleta, espaçamentos, tipografia
  types/            # Tipos compartilhados entre camadas
```

## Banco de dados e migrações
- O arquivo ``src/database/migrations.ts`` centraliza a criação das tabelas de temas, perguntas e alternativas.
- A função ``initializeDatabase`` (``App.tsx``) garante que as migrações rodem antes de liberar a interface.
- Repositórios em ``src/database/repositories`` encapsulam as operações CRUD, mantendo a UI desacoplada.

## Scripts disponíveis
- ``npm run start``: abre o Expo Dev Server.
- ``npm run android`` / ``npm run ios``: inicia o app no emulador correspondente.
- ``npm run web``: servir a versão web (experimental).
