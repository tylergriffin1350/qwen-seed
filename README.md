# Qwen-SEED **Structured Evaluation & Engineering Design** — Your AI project incubator for Qwen Code.

```bash
npx qwen-seed
```

**Works on Mac, Windows, and Linux.**

*"The coach, not the interrogator."*

[What SEED Does](#what-seed-does) · [Commands](#commands) · [Project Types](#project-types) · [How It Works](#how-it-works) · [Architecture](#architecture) · [The PAUL Connection](#the-paul-connection) · [Install](#install)

---

## What SEED Does

You have an idea. Maybe it's an app, a workflow, a client site, a utility, or a content campaign. Before you start building, you need to answer the right questions — and the right questions depend on what type of project it is.

SEED is a typed project incubator for Qwen Code. It guides you through collaborative exploration shaped by your project type, produces a structured PLANNING.md, and graduates mature plans into buildable project directories. If you use PAUL, it can initialize a managed build from your plan without re-asking questions you already answered.

**The coach, not the interrogator.** SEED brainstorms alongside you, offers suggestions when you're stuck, and pushes toward decisions when it's time. It doesn't fire questions at you — it thinks with you.

---

## Commands

| Command | What It Does |
|---------|-------------|
| `/seed` | Start a guided ideation session (default) |
| `/seed graduate` | Move completed ideation to `apps/` with git repo and synthesized README |
| `/seed launch` | Graduate + initialize PAUL for managed build (one command) |
| `/seed status` | Show all projects in the ideation pipeline |
| `/seed add-type` | Create a custom project type for SEED's data layer |

---

## Project Types

SEED ships with 5 default types. Each type shapes the conversation differently:

| Type | Rigor | Sections | What It's For |
|------|-------|----------|---------------|
| **Application** | Deep | 10 | Software with UI, data model, API, deployment |
| **Workflow** | Standard | 8 | Qwen Code commands, hooks, CARL domains, skills |
| **Client** | Standard | 7 | Client websites — business context, conversion, content |
| **Utility** | Tight | 6 | Small tools, scripts, single-purpose — resists expansion |
| **Campaign** | Creative | 7 | Content, marketing, launches — timeline-driven |

**Rigor adapts behavior:**
- **Tight** — Move fast, resist scope creep, done in one session
- **Standard** — Balanced exploration with clear boundaries
- **Deep** — Thorough, architecture matters, don't rush
- **Creative** — Loose and generative, but always anchored to a measurable goal

Types are composable. Run `/seed add-type` to create your own — just drop files in `data/{type}/` and it works immediately. No code changes needed.

---

## How It Works

```
  /seed                          /seed graduate              /seed launch
    │                                  │                          │
    ▼                                  ▼                          ▼
 Select type ──▶ Guided ──▶ PLANNING.md ──▶ apps/{name}/ ──▶ .paul/ init
 (or discover)   ideation    (populated)     git + README      (headless)
    │                │
    ▼                ▼
 Load data/     Coach persona
 {type}/        adapts rigor
```

1. **Type first.** SEED determines your project type before anything else. Type shapes everything downstream.
2. **Guided exploration.** Conversation sections load from `data/{type}/guide.md`. Each section has prompts and suggestions.
3. **PLANNING.md output.** When you're ready, SEED populates a type-specific template.
4. **Graduate.** Moves the project to `apps/{name}/` with git init and a synthesized README.
5. **Launch.** Wraps graduation + headless PAUL init. Zero re-asking.

---

## Architecture

```
commands/qwen-seed/
├── seed.md                         Entry point (routing + persona)
├── tasks/
│   ├── ideate.md                   Type-first guided ideation
│   ├── graduate.md                 Project graduation to apps/
│   ├── launch.md                   Graduate + PAUL init wrapper
│   ├── status.md                   Pipeline visibility
│   └── add-type.md                 User-extensible type system
├── data/                           Composable per-type data
│   ├── application/
│   │   ├── guide.md
│   │   ├── config.md
│   │   └── skill-loadout.md
│   ├── workflow/                   Same structure
│   ├── client/                     Same structure
│   ├── utility/                    Same structure
│   └── campaign/                   Same structure
├── templates/
│   ├── planning-application.md
│   ├── planning-workflow.md
│   ├── planning-client.md
│   ├── planning-utility.md
│   └── planning-campaign.md
└── checklists/
    └── planning-quality.md         Quality gate for graduation
```

**The key design decision:** Type-specific content lives in `data/{type}/` files, not hardcoded in task files. Adding a new type = dropping 3 files in a new `data/` directory.

---

## The PAUL Connection — Ideation to Managed Build

This is where SEED pays off. The entire ideation flow is designed so that the PLANNING.md it produces contains everything [PAUL](https://github.com/tylergriffin1350/qwen-paul) needs to set up a structured build — without asking you anything twice.

### How SEED Solves It

`/seed launch` runs the full graduation flow and then initializes PAUL with **headless context**:

1. SEED produces a rich PLANNING.md during ideation (type-aware, quality-gated)
2. `/seed launch` graduates the project to `apps/{name}/` with git
3. PAUL reads the PLANNING.md and derives its entire project structure from it
4. PAUL proposes milestones, phases, and tech stack — you review and approve
5. You're immediately ready to run `/paul:plan` for Phase 1

**No re-asking.** PAUL doesn't ask "What's this project?" or "What's the tech stack?" — those answers are already in the PLANNING.md.

### Without PAUL

Don't use PAUL? `/seed graduate` works standalone — you get a clean `apps/{name}/` directory with git and a synthesized README. Build however you want. PAUL is additive, not required.

---

## Install

```bash
npx qwen-seed
```

The installer prompts you to choose:

1. **Global** (recommended) — Available in all Qwen Code projects
2. **Local** — Available in current project only

### What Gets Installed

```
~/.qwen/commands/qwen-seed/
├── seed.md              Entry point (routing + persona)
├── tasks/               5 task files
├── data/                15 type-specific data files (5 types × 3 files)
├── templates/           5 PLANNING.md output templates
└── checklists/          Planning quality gate
```

No hooks, no MCP servers, no workspace data. SEED is pure markdown — zero runtime dependencies.

---

## Ecosystem

SEED works standalone but integrates with the broader Qwen ecosystem:

| Tool | How SEED Uses It |
|------|-----------------|
| **qwen-paul** | `/seed launch` initializes PAUL with headless context from PLANNING.md — zero-friction handoff from ideation to managed build |
| **carl-qwen** | Type-specific CARL domains load automatically during build |
| **qwen-skillsmith** | SEED follows Skillsmith format — compliant entry point + tasks |
| **qwen-aegis** | Recommended post-build audit for application-type projects |
| **qwen-base** | Graduate updates workspace-level project tracking |

All integrations are additive. SEED works without any of them installed.

---

## Quick Workflow

```
# 1. Start ideation session
/seed

# 2. Shape your idea with type-specific guidance
# (guided conversation → PLANNING.md)

# 3. Graduate to buildable project
/seed graduate

# OR graduate + PAUL in one step:
/seed launch
```

---

## License

MIT License.

---

## Author

**Chris Kahler** — [Chris AI Systems](https://github.com/ChristopherKahler)
Adapted for Qwen Code by [tylergriffin1350](https://github.com/tylergriffin1350)

---

**Qwen Code is powerful. SEED makes it strategic.**
