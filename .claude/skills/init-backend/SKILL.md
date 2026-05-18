# Skill: init-backend

Scaffolding completo de un proyecto **Node.js + Express + TypeScript** aplicando Clean Architecture, SOLID y los estándares definidos en CLAUDE.md.

## Al invocar `/init-backend`

1. Preguntar al usuario:
   - **Nombre del proyecto** (usado como nombre de carpeta y en `package.json`)
   - **¿Incluir Docker + docker-compose?** (sí/no)
   - **¿Incluir GitHub Actions CI básico?** (sí/no)

2. Generar **todos** los archivos listados abajo con contenido completo y listo para usar.

3. Al final, mostrar los comandos de instalación y arranque.

---

## Estructura a generar

```
<project-name>/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── .gitkeep
│   │   ├── value-objects/
│   │   │   └── .gitkeep
│   │   ├── repositories/
│   │   │   └── .gitkeep
│   │   ├── services/
│   │   │   └── .gitkeep
│   │   └── errors/
│   │       └── app-error.ts
│   ├── application/
│   │   ├── use-cases/
│   │   │   └── .gitkeep
│   │   ├── dtos/
│   │   │   └── .gitkeep
│   │   └── ports/
│   │       └── .gitkeep
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── .gitkeep
│   │   ├── repositories/
│   │   │   └── .gitkeep
│   │   └── external/
│   │       └── .gitkeep
│   ├── presentation/
│   │   ├── controllers/
│   │   │   └── health.controller.ts
│   │   ├── routes/
│   │   │   └── index.ts
│   │   ├── middleware/
│   │   │   └── error-handler.middleware.ts
│   │   └── validators/
│   │       └── .gitkeep
│   ├── shared/
│   │   ├── types/
│   │   │   └── result.ts
│   │   ├── utils/
│   │   │   └── .gitkeep
│   │   └── constants/
│   │       └── .gitkeep
│   └── app.ts
├── tests/
│   ├── unit/
│   │   └── .gitkeep
│   └── integration/
│       └── health.integration.spec.ts
├── .vscode/
│   ├── launch.json
│   ├── settings.json
│   └── extensions.json
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── jest.config.ts
├── .eslintrc.json
├── .prettierrc
├── nodemon.json
├── .nvmrc
├── .env.example
└── .gitignore
```

---

## Contenido de cada archivo

### `src/shared/types/result.ts`
```typescript
export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E extends Error = Error> = { readonly ok: false; readonly error: E };
export type Result<T, E extends Error = Error> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E extends Error>(error: E): Err<E> => ({ ok: false, error });
```

### `src/domain/errors/app-error.ts`
```typescript
export abstract class AppError extends Error {
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
}

export class ValidationError extends AppError {
  readonly statusCode = 422;
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
}
```

### `src/presentation/middleware/error-handler.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import { AppError } from '@domain/errors/app-error';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.name,
      message: error.message,
    });
    return;
  }

  console.error('[Unhandled Error]', error);
  res.status(500).json({ error: 'InternalServerError', message: 'An unexpected error occurred' });
}
```

### `src/presentation/controllers/health.controller.ts`
```typescript
import { Request, Response } from 'express';

export function healthCheck(_req: Request, res: Response): void {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

### `src/presentation/routes/index.ts`
```typescript
import { Router } from 'express';
import { healthCheck } from '@presentation/controllers/health.controller';

export function createRouter(): Router {
  const router = Router();
  router.get('/health', healthCheck);
  return router;
}
```

### `src/app.ts`
```typescript
import 'reflect-metadata';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { createRouter } from '@presentation/routes';
import { errorHandler } from '@presentation/middleware/error-handler.middleware';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());

  app.use('/api', createRouter());
  app.use(errorHandler);

  return app;
}
```

### `.vscode/launch.json`
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug: ts-node",
      "type": "node",
      "request": "launch",
      "runtimeArgs": ["-r", "ts-node/register", "-r", "tsconfig-paths/register"],
      "args": ["src/server.ts"],
      "env": { "NODE_ENV": "development" },
      "envFile": "${workspaceFolder}/.env",
      "sourceMaps": true,
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Debug: Jest (current file)",
      "type": "node",
      "request": "launch",
      "runtimeArgs": ["-r", "ts-node/register", "-r", "tsconfig-paths/register"],
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--testPathPattern", "${relativeFile}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "disableOptimisticBPs": true,
      "sourceMaps": true,
      "cwd": "${workspaceFolder}"
    },
    {
      "name": "Debug: Jest (all tests)",
      "type": "node",
      "request": "launch",
      "runtimeArgs": ["-r", "ts-node/register", "-r", "tsconfig-paths/register"],
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--forceExit"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "disableOptimisticBPs": true,
      "sourceMaps": true,
      "cwd": "${workspaceFolder}"
    },
    {
      "name": "Debug: Attach to process",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "sourceMaps": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### `.vscode/settings.json`
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "./node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "jest.jestCommandLine": "npx jest",
  "jest.autoRun": "off",
  "files.exclude": {
    "node_modules": true,
    "dist": true
  }
}
```

### `.vscode/extensions.json`
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "orta.vscode-jest",
    "christian-kohler.path-intellisense",
    "streetsidesoftware.code-spell-checker",
    "humao.rest-client",
    "pkief.material-icon-theme"
  ]
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": false,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@domain/*": ["src/domain/*"],
      "@application/*": ["src/application/*"],
      "@infrastructure/*": ["src/infrastructure/*"],
      "@presentation/*": ["src/presentation/*"],
      "@shared/*": ["src/shared/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### `tsconfig.build.json`
```json
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "tests", "**/*.spec.ts", "jest.config.ts"]
}
```

### `jest.config.ts`
```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@presentation/(.*)$': '<rootDir>/src/presentation/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThresholds: {
    global: { lines: 80, branches: 80, functions: 80, statements: 80 },
    './src/domain/': { lines: 100, branches: 100 },
    './src/application/': { lines: 100, branches: 100 },
  },
  coverageReporters: ['text', 'lcov'],
};

export default config;
```

### `package.json`
```json
{
  "name": "<project-name>",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=22.14.0" },
  "scripts": {
    "dev": "nodemon",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=tests/integration",
    "lint": "eslint src tests --ext .ts",
    "lint:fix": "eslint src tests --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "reflect-metadata": "^0.2.2",
    "tsyringe": "^4.8.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.12",
    "@types/morgan": "^1.9.9",
    "@types/node": "^22.14.0",
    "@types/supertest": "^6.0.2",
    "@typescript-eslint/eslint-plugin": "^7.13.0",
    "@typescript-eslint/parser": "^7.13.0",
    "eslint": "^8.57.0",
    "jest": "^29.7.0",
    "nodemon": "^3.1.4",
    "prettier": "^3.3.2",
    "supertest": "^7.0.0",
    "ts-jest": "^29.1.5",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.5.2"
  }
}
```

### `nodemon.json`
```json
{
  "watch": ["src"],
  "ext": "ts",
  "ignore": ["src/**/*.spec.ts"],
  "exec": "ts-node -r tsconfig-paths/register src/server.ts",
  "env": { "NODE_ENV": "development" }
}
```

### `.eslintrc.json`
```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": { "project": "./tsconfig.json" },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/consistent-type-imports": "error",
    "no-console": ["warn", { "allow": ["error", "warn"] }]
  }
}
```

### `.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

### `.nvmrc`
```
22.14.0
```

### `.env.example`
```
NODE_ENV=development
PORT=3000
```

### `.gitignore`
```
node_modules/
dist/
.env
coverage/
*.js.map
```

---

## Comandos de instalación a mostrar al final

```bash
cd <project-name>
nvm use           # o: volta run node@22.14.0
npm install
cp .env.example .env
npm run dev       # arranca en modo desarrollo con hot-reload
npm test          # ejecuta tests
npm run typecheck # type-check sin compilar
```

**Para debuggear en VS Code**: abrir el proyecto, ir a "Run and Debug" (Ctrl+Shift+D) y seleccionar "Debug: ts-node".
