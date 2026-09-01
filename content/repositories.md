# Repositorios

Catálogo completo de mis repos públicos en GitHub (`github.com/ram4-dev`), rankeados por importancia y complejidad. Todo lo de abajo es público.

El criterio del ranking combina dos cosas: cuánto representa hoy lo que estoy construyendo (importancia) y la profundidad técnica del proyecto (complejidad). Los proyectos de aprendizaje, bootcamp y secundaria técnica los dejo al final como contexto, no como showcase.

---

## Tier 1 — Flagship

Proyectos centrales, propios, con tesis clara y profundidad técnica. Son los que más me representan hoy.

### Khora — `khora-landing` / `khora_landing`

Landing y assets de Khora, mi producto AI-native de People Analytics e inteligencia organizacional. La tesis: los dashboards no alcanzan, el valor real está en predecir, dar señales y actuar.

- Stack: TypeScript
- Estado: en progreso
- Sitios: https://v0-khora-landing.vercel.app · https://khora-henna.vercel.app
- Repos: https://github.com/ram4-dev/khora-landing · https://github.com/ram4-dev/khora_landing

### Agent-Mediated Memory Poisoning: `memory_contagion_research`

Investigación sobre cómo la recuperación de experiencias contaminadas cambia la conducta de agentes. El piloto compara cinco mecanismos de presentación mediante registros sintéticos, consultas controladas y evaluación ciega.

- Stack: Python
- Estado: investigación activa
- Repo: https://github.com/ram4-dev/memory_contagion_research

### ESP32 Voice Agent: `esp32-hermes-voice`

Interfaz push-to-talk sobre ESP32-S3 con firmware ESP-IDF y un bridge FastAPI desplegable en Proxmox. Cubre captura y reproducción de audio, sesiones persistentes de Hermes, TTS temporal, idempotencia y retención controlada.

- Stack: C · Python · ESP-IDF · FastAPI
- Estado: prototipo físico en desarrollo
- Repo: https://github.com/ram4-dev/esp32-hermes-voice

### Hackvault: `pears-vault`

Bóveda P2P de secretos con persistencia AES-256-GCM, transporte HyperDHT, replicación Hypercore/Hyperbee y sincronización bidireccional de `.env`.

- Stack: TypeScript
- Estado: open source
- Repo: https://github.com/ram4-dev/pears-vault

### Nana Wallet: `rober8b/aleph-hackathon`

Wallet agéntica accesible creada en equipo para el Aleph Hackathon 2026. Combina frontend web y móvil, un backend Fastify conectado a Tether WDK, confirmación explícita antes de transferir y memoria RAG de destinatarios con PostgreSQL y pgvector.

- Rol: co-builder; backend WDK, memoria de destinatarios e integración frontend/backend
- Stack: TypeScript · React · Capacitor · Fastify · Tether WDK · PostgreSQL
- Repo del equipo: https://github.com/rober8b/aleph-hackathon

### Crewlink

Plataforma donde agentes pueden contratar a otros agentes para tareas específicas. Los agentes también pueden postularse como freelancers. Es uno de mis experimentos más interesantes alrededor de economías agente-a-agente.

- Stack: TypeScript
- Estado: en desarrollo activo
- Sitio: https://crewlink-rho.vercel.app
- Repo: https://github.com/ram4-dev/crewlink

### Poker Bot Arena

Plataforma competitiva donde agentes autónomos juegan al póker entre sí vía API REST. Hecha alrededor de game loop architecture, aislamiento de agentes y manejo de estado en tiempo real.

- Estado: experimento activo
- Sitio: https://frontend-tawny-six-34.vercel.app
- Repo: https://github.com/ram4-dev/poker_bot_arena

### Infer Platform — `infer_platform`

Plataforma de inferencia LLM community-powered. Acceso a modelos especializados hosteados por la comunidad a través de una API compatible con OpenAI. Más barato y más flexible que las opciones cloud por default. Implementada en Rust.

- Stack: Rust
- Estado: en progreso
- Sitio: https://infer-platform.vercel.app
- Repo: https://github.com/ram4-dev/infer_platform

### Nanoclaw

Alternativa liviana a OpenClaw que corre en contenedores por seguridad. Se conecta a WhatsApp, Telegram, Slack, Discord, Gmail y otras apps de mensajería. Tiene memoria, scheduled jobs y corre directamente sobre el Agents SDK de Anthropic. Es un fork donde estoy explorando la arquitectura de agentes containerizados.

- Estado: fork con exploración propia
- Sitio: https://nanoclaw.dev
- Repo: https://github.com/ram4-dev/nanoclaw

### Anotamelo

Bot de WhatsApp para gestión de gastos grupales con IA — "El Tesorero Tóxico". Es uno de mis productos consumer-facing más concretos. WhatsApp + AI + plata compartida = caso de uso simple y útil.

- Stack: Python
- Sitio: https://finance-agent-sigma.vercel.app
- Repo: https://github.com/ram4-dev/anotamelo

---

## Tier 2 — Dev tooling y agent infra

Herramientas y frameworks que construí alrededor del trabajo con agentes y coding agents. Más nicho, más técnico, menos "producto".

### Herdr Automations: `herdr-automations`

Automatizaciones por cron, intervalo y eventos para Herdr. Usa un worker durable, estado en SQLite, límites de concurrencia, recuperación después de reinicios y una TUI para operar ejecuciones y diagnósticos.

- Stack: TypeScript · Bun · SQLite
- Repo: https://github.com/ram4-dev/herdr-automations

### Tool Hub MCP — `tool-hub-mcp`

Proxy para coding agents que intercepta las llamadas entre el agente y los MCPs y solo retorna los que va a usar. Hecho específicamente para gestión de tokens en proyectos grandes, donde el contexto se vuelve un problema real.

- Stack: TypeScript
- Repo: https://github.com/ram4-dev/tool-hub-mcp

### Multi SDD Team — `multi-sdd-team`

Framework SDD multi-agente para el pi coding agent. Continuación de mi línea de trabajo en spec-driven development con orquestación de múltiples agentes especializados.

- Stack: TypeScript
- Repo: https://github.com/ram4-dev/multi-sdd-team

### SDD Custom Kit — `simple_mutiple_agents_sdd`

Kit portable y multi-agent de spec-driven development para Claude Code (con WIP para extenderlo a otros). Convierte specs técnicas en código implementado a través de un pipeline de agentes especializados.

- Stack: Shell
- Repo: https://github.com/ram4-dev/simple_mutiple_agents_sdd

### Pi Gentle AI — `pi-gentle-ai`

Extensión que permite que las herramientas y el framework de gentle-ai funcionen con pi.dev.

- Stack: TypeScript
- Repo: https://github.com/ram4-dev/pi-gentle-ai

### Infer (landing inicial) — `infer`

Versión inicial / landing de Infer, antes de evolucionar a `infer_platform` con backend en Rust.

- Sitio: https://infer-zeta.vercel.app
- Repo: https://github.com/ram4-dev/infer

---

## Tier 3 — Experimentos y utilidades

Cosas más chicas: experimentos puntuales, plugins, utilidades, ideas que probé.

### Hackathon Sin Team — `hackathon_sin_team`

Plataforma para encontrar compañeros y hackathons. Producto puntual, deployed.

- Stack: TypeScript · Sitio: https://hackathon-sin-team.vercel.app · Repo: https://github.com/ram4-dev/hackathon_sin_team

### ESLint Baseline Plugin — `eslint-baseline-plugin`

Plugin de ESLint para lintear código basado en el soporte baseline (compatibilidad cross-browser).

- Stack: TypeScript · Repo: https://github.com/ram4-dev/eslint-baseline-plugin

### Babel Baseline Preset — `babel-baseline-preset`

Preset de Babel que usa el paquete npm `baseline` para transpilar solamente el código que no es widely available.

- Stack: JavaScript · Repo: https://github.com/ram4-dev/babel-baseline-preset

### ETH CLI Wallet — `ETH-CLI-Wallet`

Wallet CLI para la red de Ethereum, conectada a un nodo RPC de Infura.

- Stack: JavaScript · Repo: https://github.com/ram4-dev/ETH-CLI-Wallet

### GPT Product Searcher — `gpt_product_searcher`

Buscador de productos asistido por GPT.

- Stack: JavaScript · Sitio: https://gpt-product-searcher.vercel.app · Repo: https://github.com/ram4-dev/gpt_product_searcher

### Ecommerce Validation — `ecommerce_validation`

Validación experimental de ideas de ecommerce.

- Stack: Python · Repo: https://github.com/ram4-dev/ecommerce_validation

---

## Tier 4 — Portfolio, configs y forks de referencia

### Presentation (este sitio) — `presentation`

El repo del portfolio personal (lo que estás viendo ahora).

- Sitio: https://ram4.dev · Repo: https://github.com/ram4-dev/presentation

### NVim Config — `nvim_config`

Mi configuración personal de Neovim.

- Stack: Lua · Repo: https://github.com/ram4-dev/nvim_config

### Forks de referencia

Forks que mantengo para referencia o como base de exploraciones propias:

- `gentle-ai` — fork del framework gentle-ai
- `MiniLaunch` — launcher minimalista de Minecraft
- `pruebas-tecnicas` — comunidad de pruebas técnicas
- `coding-interview-university` — plan de estudio para software engineer
- `c19-07-ft-node-react` — proyecto base
- `bank-id` — proyecto banking de idforideas

---

## Tier 5 — Camino de aprendizaje y proyectos previos

Estos son repos que muestran mi recorrido: bootcamp, internships, proyectos académicos de FIUBA y secundaria técnica. Los dejo públicos porque son parte de cómo aprendí, pero no representan lo que construyo hoy.

### URL Shortener (suite completa)

Una API completa de acortador de URLs con su frontend, una API de verificación intermedia y documentación Swagger. Buen ejemplo de cómo encaré sistemas con múltiples servicios cuando estaba aprendiendo backend.

- `URL_Shortener` — API principal
- `Verification-API` — API intermedia que cambia access codes por tokens
- `URL_Shortener_Page` — frontend
- `UrlShortener-Documentation` — Swagger

### Backend learning

Proyectos hechos para profundizar en backend y APIs:

- `Backend_Path` — knowledge dump propio de backend
- `Spring_Boot` — Java / Spring Boot
- `Sring_boot-capacitacion_ayi` — Spring Boot durante capacitación AYI
- `Python_API` — APIs en Python
- `API-Productos-MONGODB` — API con MongoDB
- `Virtual-Bank` — banco virtual sin frontend

### Paso por SugarCoach

Trabajo durante mi paso por SugarCoach:

- `SugarCoach-App` — fork de la app por temas de permisos de push
- `SugarCoach-Ejercicios` — ejercicios en Kotlin durante prácticas
- `Sugar-Lab` — placeholder relacionado

### Bootcamp y simulaciones laborales

- `AYIGROUP_Bootcamp_Portfolio` — bootcamp AYI
- `No-Cunty` — proyecto de la simulación de No-Country

### Proyectos académicos / electrónica

De mi paso por la secundaria técnica (ETRR) y materias de FIUBA:

- `ProyectoCAD` — código C++ para ESP32-WROOM-32 en proyecto CAD (Proyecto Electrónico, último año de secundaria técnica con orientación en electrónica)
- `Proyecto-MAPE` — C++
- `Programaci-n` — JavaScript

### Portfolios y proyectos viejos

- `Portfolio` y `Portfolio-JS` — versiones anteriores de mi portfolio
- `WeatherReactApp` — app de clima en React
- `Chatbot-EDVAI` — chatbot para test técnico de internship en EDVAI
- `RamiroCS-hub` — placeholder

---

## Notas

- Si te interesa ver toda la actividad en orden cronológico, GitHub: https://github.com/ram4-dev?tab=repositories
- El stack más recurrente en lo reciente es **TypeScript** y **Python** para backend / agentes, con incursiones en **Rust** (`infer_platform`) y mucha exploración alrededor de **agent frameworks** (MCPs, multi-agent, SDD).
