# Proyectos destacados

Estos son los que más me representan hoy. Para el catálogo completo de mis 49 repos públicos, ver `repositories.md`.

## Compass — foco actual

Capa de seguridad para pagos de agentes. La tesis: si los agentes empiezan a mover plata por su cuenta, hace falta una capa que valide, autorice y limite esos pagos antes de que toquen el rail real. Publicado en `compass.ram4.dev`.

Nació como proyecto de hackathon y el resultado validó la dirección: **2dos en el leaderboard** y entrada al **programa de aceleración de Dev3pack**.

- **Rol:** Builder / Product Engineer
- **Foco:** Agent payments · Security · AI
- **Estado:** En progreso
- **Reconocimiento:** 2do en hackathon · Aceleración Dev3pack
- **Sitio:** https://compass.ram4.dev

## S-OWMI — research / AI safety

Paper co-autorado para el **Apart Research Global South AI Safety Hackathon (junio 2026)**. Propone el **Spanish Open-Weight Maturity Index (S-OWMI)**, un framework auditable de evaluación perimetral para LLMs open-weight desplegados por instituciones de Latinoamérica (hospitales, fintechs, gobierno) que necesitan soberanía de datos y cumplimiento con LGPD / Ley 25.326 / Ley 1581.

Evaluamos Llama-3.1-8B y Qwen2.5-7B contra un dataset *español-diverso* (español neutro, Spanglish, coloquialismos regionales) versus un baseline en inglés. Resultado clave: el refusal de prompts peligrosos transfiere bien entre idiomas, pero la **consistencia en detección de sesgos se degrada +13.3pp en español** y ~80% de las respuestas factuales sobre LATAM quedan incompletas — un readiness gap que una auditoría sólo-en-español no detectaría. Entregamos un scorecard L1/L2/L3 accionable para auditar antes del fine-tuning local.

- **Rol:** Co-autor / Investigador
- **Co-autores:** Mauricio Genta, Federico Hörl, Nicolás Adrián Oroz
- **Foco:** AI Safety · Open-weight LLMs · Multilingual evaluation · Global South
- **Venue:** Apart Research — Global South AI Safety Hackathon 2026
- **Repo:** https://github.com/fede-h/SOWMI

## Khora — producto propio

Producto AI-native para People Analytics e inteligencia organizacional. Va más allá del dashboard: predice, da señales y actúa.

- **Rol:** Founder / Product Engineer
- **Foco:** AI · HR Tech · Agent Workflows
- **Estado:** En progreso
- **Sitio:** https://khora.ar

## Crewlink

Plataforma donde agentes pueden contratar a otros agentes para tareas específicas. Los agentes también pueden postularse como freelancers. Es un experimento alrededor de cómo se vería una economía agente-a-agente real.

- **Rol:** Creador
- **Stack:** TypeScript
- **Estado:** En desarrollo activo
- **Sitio:** https://crewlink-rho.vercel.app
- **Repo:** https://github.com/ram4-dev/crewlink

## Poker Bot Arena

Plataforma competitiva donde agentes autónomos juegan al póker entre sí vía API REST. Construida alrededor de game loop architecture, aislamiento de agentes y manejo de estado en tiempo real.

- **Rol:** Creador / Arquitecto
- **Stack:** Python · REST API · Diseño de agentes
- **Estado:** Experimento
- **Repo:** https://github.com/ram4-dev/poker_bot_arena

## Infer

Inferencia de LLMs powered by community. La idea es acceder a modelos especializados, hosteados por la comunidad, a través de una API compatible con OpenAI — más barato y más flexible que las opciones cloud por default. La plataforma principal está en Rust.

- **Rol:** Creador / Arquitecto
- **Stack:** Rust · OpenAI-compatible API · Community
- **Estado:** En progreso
- **Sitio:** https://infer-platform.vercel.app
- **Repo principal:** https://github.com/ram4-dev/infer_platform

## Nanoclaw

Alternativa liviana a OpenClaw que corre en contenedores por seguridad. Se conecta a WhatsApp, Telegram, Slack, Discord, Gmail y más. Tiene memoria, scheduled jobs y corre directamente sobre el Agents SDK de Anthropic. Exploración propia sobre arquitectura de agentes containerizados.

- **Rol:** Builder (fork con exploración propia)
- **Stack:** Anthropic Agents SDK · Containers · Multi-channel
- **Sitio:** https://nanoclaw.dev
- **Repo:** https://github.com/ram4-dev/nanoclaw

## Anotamelo

Bot de WhatsApp para gestión de gastos grupales con IA — "El Tesorero Tóxico". Producto consumer-facing concreto: WhatsApp + AI + plata compartida.

- **Rol:** Creador
- **Stack:** Python · WhatsApp · LLM
- **Sitio:** https://finance-agent-sigma.vercel.app
- **Repo:** https://github.com/ram4-dev/anotamelo

## SDD Custom Kit

Kit portable de spec-driven development con orquestación multi-agente. Convierte specs técnicas en código implementado a través de un pipeline de agentes especializados.

También lo presenté como charla de **SDD + arquitectura multiagente** en la primera meetup argentina de **Codex**.

- **Rol:** Diseñador / Builder
- **Stack:** Multi-agent · LLM · Spec-driven
- **Estado:** Open source
- **Charla:** SDD + arquitectura multiagente — primera meetup argentina de Codex
- **Presentación:** /presentations/04-charla-codex.html
- **Repo:** https://github.com/ram4-dev/simple_mutiple_agents_sdd

## Más

GitHub completo: https://github.com/ram4-dev
