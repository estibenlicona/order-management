# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Skills Disponibles

Este workspace es un entorno de scaffolding. Usa estos comandos para generar proyectos:

| Comando | Descripción |
|---|---|
| `/init-backend` | Scaffolding completo de proyecto Express + TypeScript |
| `/init-frontend` | Scaffolding de proyecto React+TS o Vanilla+TS con Vite |
| `/setup-env` | Configuración de Node v22.14.0 y VS Code para debugging |

Una vez generado un proyecto con `/init-backend`, los comandos estándar son:

```bash
nvm use                  # activa Node v22.14.0 desde .nvmrc
npm run dev              # servidor con hot-reload (nodemon + ts-node)
npm test                 # Jest (unit + integration)
npm run test:coverage    # Jest con reporte de cobertura
npm run test:watch       # Jest en modo watch
npm run lint             # ESLint sobre src/ y tests/
npm run typecheck        # tsc --noEmit (sin emitir archivos)
npm run build            # compilación de producción (tsconfig.build.json)
```

Para un test individual:
```bash
npx jest --testPathPattern="nombre-del-archivo.spec.ts" --runInBand
```

## Runtime & Toolchain

- **Node.js**: v22.14.0 — fijar con `.nvmrc` (`22.14.0`) en cada proyecto
- **TypeScript**: ≥ 5.4, siempre con opciones de rigor máximo (ver abajo)
- **Package manager**: `npm` — lock file comprometido en git
- **Backend bundler**: `tsc` para compilación, `ts-node` + `nodemon` para desarrollo
- **Frontend bundler**: Vite

## TypeScript — Configuración Obligatoria

Todo `tsconfig.json` de aplicación debe incluir:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": false
  }
}
```

**Prohibido `any`** — usar `unknown` con type guards explícitos. Un `any` es deuda técnica inmediata.

## Arquitectura — Clean Architecture

```
Domain  ←  Application  ←  Infrastructure
                ↑
          Presentation
```

### Regla de Dependencia (inviolable)
- Las capas internas no conocen las externas
- `domain/` no importa nada de `application/`, `infrastructure/`, ni `presentation/`
- `application/` no importa de `infrastructure/` ni `presentation/`
- Las interfaces (ports) viven en `domain/` o `application/`; las implementaciones en `infrastructure/`

### Estructura de carpetas estándar (backend)
```
src/
  domain/
    entities/          ← agregados y entidades (inmutables, sin deps externas)
    value-objects/     ← VOs con validación en constructor
    repositories/      ← interfaces (IOrderRepository, etc.)
    services/          ← domain services (orquestan entidades, sin I/O)
    errors/            ← clases de error tipadas + tipo Result<T, E>
  application/
    use-cases/         ← un archivo = un caso de uso
    dtos/              ← request/response DTOs (zod schemas)
    ports/             ← interfaces de servicios externos (IEmailService, etc.)
  infrastructure/
    database/          ← ORM config, migrations
    repositories/      ← implementaciones concretas de IXxxRepository
    external/          ← adapters de terceros (Stripe, SendGrid, etc.)
  presentation/
    controllers/       ← delegan a use-cases, no contienen lógica
    routes/            ← definición de rutas Express
    middleware/        ← auth, validation, error handler global
    validators/        ← zod schemas de request HTTP
  shared/
    types/             ← tipos compartidos entre capas
    utils/             ← funciones puras sin side-effects
    constants/         ← SCREAMING_SNAKE_CASE
```

## Principios SOLID

| Principio | Regla de aplicación |
|---|---|
| **SRP** | Una clase = una responsabilidad. Controllers no tienen lógica. Use cases no acceden a DB directamente. |
| **OCP** | Nuevos comportamientos via Strategy/Adapter, no modificando clases existentes. |
| **LSP** | Toda clase concreta cumple el contrato de su interfaz. Tests deben pasar con cualquier implementación. |
| **ISP** | Interfaces pequeñas y focalizadas. `IUserRepository` no mezcla operaciones de `IOrderRepository`. |
| **DIP** | Las clases dependen de abstracciones (interfaces), nunca de implementaciones concretas. DI via constructor siempre. |

## Patrones de Diseño — Cuándo Usarlos

| Patrón | Cuándo |
|---|---|
| **Repository** | Siempre para acceso a datos. Nunca queries directas en use-cases. |
| **Factory** | Creación de entidades con invariantes complejos o dependencias. |
| **Strategy** | Algoritmos o comportamientos intercambiables (ej: distintos métodos de pago). |
| **Adapter** | Integración con cualquier servicio externo. El dominio no conoce la API real. |
| **Decorator** | Cross-cutting concerns (logging, caching, retry) sin modificar la clase original. |
| **Observer/EventEmitter** | Desacoplamiento de side-effects (ej: enviar email tras crear orden). |

## Manejo de Errores

**En domain y application**: usar Result pattern, no `throw`.

```typescript
type Result<T, E extends Error = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// Uso
const result = orderService.create(dto);
if (!result.ok) return result; // propaga sin lanzar
```

**En infrastructure y presentation**: `throw` solo con errores tipados que hereden de una clase base del dominio.

**Middleware global de Express**: único lugar donde los errores se transforman en HTTP responses.

## Testing

| Tipo | Alcance | Herramienta | Ubicación |
|---|---|---|---|
| Unit | Por clase; mocks de dependencias | Jest + ts-jest | `*.spec.ts` junto al source |
| Integration | Por ruta o caso de uso | Jest + Supertest | `tests/integration/` |
| E2E | Flujos completos | Playwright (frontend) | `tests/e2e/` |

**Cobertura mínima**: 80% líneas globales; 100% ramas en `domain/` y `application/`.

**Prohibido**: mockear la base de datos en tests de integración. Usar BD real o in-memory (SQLite, pg-mem).

**Estructura de test (AAA)**:
```typescript
describe('CreateOrderUseCase', () => {
  it('should return error when customer does not exist', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Convenciones de Nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Clases, Interfaces, Tipos, Enums | PascalCase | `OrderRepository`, `IPaymentService` |
| Variables, funciones, métodos, props | camelCase | `createOrder`, `orderId` |
| Constantes globales | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Archivos y carpetas | kebab-case | `create-order.use-case.ts` |
| Interfaces | Prefijo `I` | `IOrderRepository` |
| DTOs | Sufijo `Dto` | `CreateOrderDto` |
| Errores | Sufijo `Error` | `OrderNotFoundError` |

**Barrel exports**: cada módulo expone un `index.ts`. No se hacen imports de rutas profundas entre capas.

## Reglas de Código

- **Sin `any`** — siempre `unknown` + type guard
- **Sin lógica de negocio en controllers** — solo delegar al use case y mapear response
- **Sin imports circulares** — si aparecen, es señal de mal diseño de capas
- **Sin docstrings multi-línea** — un comentario de una línea solo si el WHY no es obvio
- **Async/await siempre** — nunca `.then()/.catch()` encadenados
- **Inmutabilidad en domain** — `readonly` en todas las propiedades de entidades y VOs
- **Validación en la frontera** — zod en validators de presentation; nunca validar en domain lo que ya validó presentation

## Herramientas de Calidad

- **Linter**: ESLint con `@typescript-eslint` — `no-explicit-any`, `explicit-function-return-type`, `no-floating-promises`
- **Formatter**: Prettier — ejecutar en pre-commit
- **Pre-commit hook**: lint + format + type-check (sin `--no-verify`)

