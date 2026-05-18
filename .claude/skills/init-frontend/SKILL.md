# Skill: init-frontend

Scaffolding completo de un proyecto frontend con **Vite + TypeScript** en dos variantes: **React + TypeScript** o **Vanilla + TypeScript**. Aplica los estándares definidos en CLAUDE.md.

## Al invocar `/init-frontend`

1. Preguntar al usuario:
   - **¿React + TypeScript o Vanilla + TypeScript?**
   - **Nombre del proyecto**
   - **¿Incluir Zustand para estado global?** (solo si eligió React)
   - **¿Incluir React Query para fetching?** (solo si eligió React)

2. Generar la estructura y archivos correspondientes a la elección.

---

## VARIANTE A: React + TypeScript

### Estructura

```
<project-name>/
├── src/
│   ├── components/
│   │   ├── ui/                    ← átomos reutilizables (Button, Input, Modal, etc.)
│   │   │   └── button/
│   │   │       ├── button.tsx
│   │   │       ├── button.spec.tsx
│   │   │       └── index.ts
│   │   └── features/              ← componentes de dominio (compuestos de ui/)
│   │       └── .gitkeep
│   ├── pages/                     ← un archivo por ruta
│   │   └── home/
│   │       └── home.page.tsx
│   ├── hooks/                     ← custom hooks (lógica de negocio, sin JSX)
│   │   └── .gitkeep
│   ├── services/                  ← llamadas HTTP tipadas (sin lógica de UI)
│   │   └── api.client.ts
│   ├── stores/                    ← Zustand stores (si se eligió)
│   │   └── .gitkeep
│   ├── types/                     ← tipos globales y DTOs de respuesta
│   │   └── api.types.ts
│   ├── utils/                     ← funciones puras sin side-effects
│   │   └── .gitkeep
│   ├── assets/
│   │   └── .gitkeep
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   └── setup.ts
├── .vscode/
│   ├── launch.json
│   ├── settings.json
│   └── extensions.json
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── .eslintrc.json
├── .prettierrc
├── .nvmrc
├── index.html
└── .gitignore
```

### Archivos clave — React

#### `src/services/api.client.ts`
```typescript
const BASE_URL = import.meta.env.VITE_API_URL as string;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${path}`);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
```

#### `src/components/ui/button/button.tsx`
```tsx
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      disabled={disabled ?? isLoading}
      className={`rounded font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
```

#### `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@services': resolve(__dirname, 'src/services'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
});
```

#### `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: { lines: 80, branches: 80 },
    },
  },
  resolve: {
    alias: {
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@services': resolve(__dirname, 'src/services'),
    },
  },
});
```

#### `tests/setup.ts`
```typescript
import '@testing-library/jest-dom';
```

#### `package.json` (React)
```json
{
  "name": "<project-name>",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=22.14.0" },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.13.0",
    "@typescript-eslint/parser": "^7.13.0",
    "@vitejs/plugin-react": "^4.3.1",
    "@vitest/coverage-v8": "^1.6.0",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.7",
    "jsdom": "^24.1.0",
    "prettier": "^3.3.2",
    "typescript": "^5.5.2",
    "vite": "^5.3.1",
    "vitest": "^1.6.0"
  }
}
```

---

## VARIANTE B: Vanilla + TypeScript

### Estructura

```
<project-name>/
├── src/
│   ├── modules/                   ← módulos autocontenidos con ciclo de vida
│   │   └── example/
│   │       ├── example.module.ts
│   │       └── example.module.spec.ts
│   ├── services/                  ← HTTP, storage, autenticación
│   │   └── api.client.ts
│   ├── events/                    ← event bus tipado
│   │   └── event-bus.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── .gitkeep
│   └── main.ts
├── tests/
│   └── .gitkeep
├── .vscode/
│   ├── launch.json
│   ├── settings.json
│   └── extensions.json
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── .eslintrc.json
├── .prettierrc
├── .nvmrc
├── index.html
└── .gitignore
```

### Archivos clave — Vanilla

#### `src/events/event-bus.ts`
```typescript
type Handler<T> = (payload: T) => void;

class EventBus {
  private readonly handlers = new Map<string, Handler<unknown>[]>();

  on<T>(event: string, handler: Handler<T>): void {
    const existing = this.handlers.get(event) ?? [];
    this.handlers.set(event, [...existing, handler as Handler<unknown>]);
  }

  off<T>(event: string, handler: Handler<T>): void {
    const existing = this.handlers.get(event) ?? [];
    this.handlers.set(event, existing.filter((h) => h !== (handler as Handler<unknown>)));
  }

  emit<T>(event: string, payload: T): void {
    const existing = this.handlers.get(event) ?? [];
    existing.forEach((h) => h(payload));
  }
}

export const eventBus = new EventBus();
```

#### `src/modules/example/example.module.ts`
```typescript
import { eventBus } from '@events/event-bus';

export interface ExampleModule {
  init: () => void;
  destroy: () => void;
}

export function createExampleModule(): ExampleModule {
  function handleSomeEvent(payload: unknown): void {
    console.warn('ExampleModule received:', payload);
  }

  return {
    init(): void {
      eventBus.on('some-event', handleSomeEvent);
    },
    destroy(): void {
      eventBus.off('some-event', handleSomeEvent);
    },
  };
}
```

#### `vite.config.ts` (Vanilla)
```typescript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@modules': resolve(__dirname, 'src/modules'),
      '@services': resolve(__dirname, 'src/services'),
      '@events': resolve(__dirname, 'src/events'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },
});
```

---

## Archivos comunes (ambas variantes)

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": false,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@pages/*": ["src/pages/*"],
      "@hooks/*": ["src/hooks/*"],
      "@services/*": ["src/services/*"],
      "@stores/*": ["src/stores/*"],
      "@modules/*": ["src/modules/*"],
      "@events/*": ["src/events/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"]
    }
  },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### `.nvmrc`
```
22.14.0
```

### `.gitignore`
```
node_modules/
dist/
.env
coverage/
```

---

## Comandos de instalación a mostrar al final

```bash
cd <project-name>
nvm use
npm install
npm run dev      # arranca Vite dev server
npm test         # ejecuta Vitest
npm run build    # build de producción
```
