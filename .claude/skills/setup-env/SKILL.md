# Skill: setup-env

Configura el entorno de desarrollo completo: **Node.js v22.14.0**, TypeScript global, VS Code con debugging y extensiones recomendadas.

## Al invocar `/setup-env`

Generar instrucciones paso a paso adaptadas a la plataforma del usuario (Windows/macOS/Linux) más todos los archivos de configuración listos para copiar.

---

## Paso 1 — Instalar Node.js v22.14.0

### Windows (recomendado: Volta)
```powershell
# Instalar Volta (gestor de versiones cross-platform)
winget install Volta.Volta

# Reiniciar terminal, luego:
volta install node@22.14.0
volta pin node@22.14.0   # fija la versión en el proyecto actual
```

### Windows (alternativa: nvm-windows)
```powershell
# Descargar nvm-windows desde: https://github.com/coreybutler/nvm-windows/releases
nvm install 22.14.0
nvm use 22.14.0
```

### macOS / Linux / WSL
```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc  # o ~/.zshrc

nvm install 22.14.0
nvm use 22.14.0
nvm alias default 22.14.0
```

### Verificar instalación
```bash
node --version   # debe mostrar v22.14.0
npm --version    # debe mostrar 10.x.x
```

---

## Paso 2 — TypeScript y herramientas globales

```bash
npm install -g typescript@latest ts-node@latest tsconfig-paths@latest
tsc --version    # debe mostrar 5.4.x o superior
```

---

## Paso 3 — Archivo `.nvmrc`

Crear en la raíz de cada proyecto:

```
22.14.0
```

Desde ese momento, `nvm use` (sin argumentos) activa la versión correcta.

---

## Paso 4 — VS Code: extensiones recomendadas

Crear `.vscode/extensions.json` en el proyecto:

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
    "pkief.material-icon-theme",
    "usernamehw.errorlens",
    "wix.vscode-import-cost"
  ]
}
```

VS Code mostrará una notificación para instalarlas todas de una vez.

---

## Paso 5 — VS Code: configuración del workspace

Crear `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },
  "editor.rulers": [100],
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "typescript.tsdk": "./node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "typescript.suggest.autoImports": true,
  "jest.jestCommandLine": "npx jest",
  "jest.autoRun": "off",
  "eslint.validate": ["typescript", "typescriptreact"],
  "files.exclude": {
    "node_modules": true,
    "dist": true,
    "coverage": true
  },
  "files.eol": "\n",
  "search.exclude": {
    "node_modules": true,
    "dist": true,
    "coverage": true,
    "*.lock": true
  }
}
```

---

## Paso 6 — VS Code: configuración de debugging

Crear `.vscode/launch.json` (backend Express + TypeScript):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug: ts-node (server)",
      "type": "node",
      "request": "launch",
      "runtimeArgs": [
        "-r", "ts-node/register",
        "-r", "tsconfig-paths/register"
      ],
      "args": ["src/server.ts"],
      "env": { "NODE_ENV": "development" },
      "envFile": "${workspaceFolder}/.env",
      "sourceMaps": true,
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**", "node_modules/**"]
    },
    {
      "name": "Debug: Jest (archivo actual)",
      "type": "node",
      "request": "launch",
      "runtimeArgs": [
        "-r", "ts-node/register",
        "-r", "tsconfig-paths/register"
      ],
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "--testPathPattern", "${relativeFile}",
        "--no-coverage"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "disableOptimisticBPs": true,
      "sourceMaps": true,
      "cwd": "${workspaceFolder}",
      "skipFiles": ["<node_internals>/**", "node_modules/**"]
    },
    {
      "name": "Debug: Jest (todos los tests)",
      "type": "node",
      "request": "launch",
      "runtimeArgs": [
        "-r", "ts-node/register",
        "-r", "tsconfig-paths/register"
      ],
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--forceExit"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "disableOptimisticBPs": true,
      "sourceMaps": true,
      "cwd": "${workspaceFolder}",
      "skipFiles": ["<node_internals>/**", "node_modules/**"]
    },
    {
      "name": "Debug: Attach (proceso corriendo)",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "sourceMaps": true,
      "skipFiles": ["<node_internals>/**", "node_modules/**"],
      "restart": true
    }
  ]
}
```

### Cómo usar el debugger

| Acción | Método |
|---|---|
| Iniciar con debugger | F5 → seleccionar configuración |
| Poner breakpoint | Clic en el margen izquierdo del editor (línea roja) |
| Step over | F10 |
| Step into | F11 |
| Step out | Shift+F11 |
| Continuar | F5 |
| Ver variables | Panel "Variables" en el sidebar izquierdo |
| Consola de debug | Panel "Debug Console" |
| Attach a proceso running | `node --inspect src/server.ts` → F5 → "Attach" |

---

## Paso 7 — Verificación completa

```bash
node --version      # v22.14.0
npm --version       # 10.x.x
tsc --version       # 5.x.x
ts-node --version   # v10.x.x

# En el proyecto:
npm run typecheck   # 0 errores
npm run lint        # 0 warnings
npm test            # todos los tests pasan
```

---

## Resumen de archivos generados

| Archivo | Propósito |
|---|---|
| `.nvmrc` | Fija Node 22.14.0 para el proyecto |
| `.vscode/settings.json` | Formato, TypeScript SDK, Jest |
| `.vscode/launch.json` | 4 configs de debug (server, jest file, jest all, attach) |
| `.vscode/extensions.json` | Extensiones recomendadas del equipo |
