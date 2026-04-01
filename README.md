# The Creature

A self-evolving, autonomous bounty-solving AI entity that lives on [0G](https://0g.ai)'s decentralized infrastructure.

## What is this?

The Creature is an autonomous AI that solves coding bounties and hackathon challenges. Its work is always public. Anyone can:

1. **Request** — Point the creature at a bounty/hackathon with context, pay a small fee
2. **Nudge** — Read its current submission, improve it, push patches
3. **Earn** — If it wins, prize is split proportionally among everyone who nudged that challenge

The creature evolves its approach after every challenge (win or lose), rewriting its own strategy based on what worked. Its entire thought process streams publicly on a dashboard.

## Architecture

```
┌─────────────────────────────────────────────────┐
│            The Creature (Keeper Daemon)          │
│         watches chain → thinks → acts           │
└──────┬──────────────┬───────────────┬───────────┘
       │              │               │
       v              v               v
  ┌──────────┐  ┌──────────┐  ┌──────────────┐
  │0G Compute│  │0G Storage│  │  0G Chain     │
  │(Inference│  │(Memory + │  │(Contracts +   │
  │ via TEE) │  │ Thoughts)│  │ Settlement)   │
  └──────────┘  └──────────┘  └──────────────┘
```

| Layer | What | How |
|---|---|---|
| **0G Chain** | Bounty registry, contribution tracking, payouts, evolution ledger | Solidity smart contracts (EVM) |
| **0G Compute** | Draft generation, nudge evaluation, self-evolution | Sealed inference (TEE-verified) |
| **0G Storage** | Submissions, genome, thought stream, nudge content | File + KV store |

## The Loop

```
HUNT → DRAFT → WORKSHOP → SUBMIT → SETTLE → EVOLVE → repeat
```

1. Someone submits a request pointing the creature at a bounty
2. Creature generates v0 draft via 0G Compute (thoughts stream publicly)
3. Anyone can nudge — read the draft, submit improvements
4. Best version gets submitted to the bounty platform
5. Win? Prize splits proportionally among nudgers. Lose? Creature studies why.
6. Creature rewrites its own strategy genome, generation counter increments

## Participants

| Role | What they do | Incentive |
|---|---|---|
| **The Creature** | Generates drafts, evaluates nudges, evolves | Gets smarter over time |
| **Requesters** | Point it at bounties with context + fee | Cut of winnings if it wins |
| **Nudgers** | Improve submissions (code, docs, tests) | Proportional share of prize |
| **Keepers** | Run the daemon that triggers actions | Gas rebate from treasury |

## Revenue Split (on win)

```
Prize: $10,000
  ├── 10% → Requester (found the bounty)        $1,000
  ├──  5% → Treasury (gas, compute, infra)         $500
  └── 85% → Nudgers (by contribution weight)     $8,500
```

## Smart Contracts

- **CreatureRegistry** — Bounty lifecycle (request → acknowledge → work → submit → settle)
- **NudgeTracker** — Contribution DAG tracking, weight assignment
- **PayoutSplitter** — Proportional prize distribution on win
- **EvolutionLedger** — On-chain record of every genome generation
- **Treasury** — Fee collection, gas funding for keeper

## Tech Stack

- **Contracts**: Solidity (Hardhat), deployed to 0G Chain (Galileo testnet, chain ID 16602)
- **Keeper**: TypeScript daemon — watches chain events, orchestrates AI work
- **Storage**: `@0gfoundation/0g-ts-sdk` — file upload/download + KV store
- **Compute**: 0G Compute Network — OpenAI-compatible inference API (TEE-verified)
- **Dashboard**: Next.js — live thought stream, challenge viewer, nudge submission
- **Monorepo**: pnpm workspaces + Turborepo

## Project Structure

```
the-creature/
├── packages/
│   ├── contracts/     # Solidity smart contracts (Hardhat)
│   ├── sdk/           # Shared types + contract bindings
│   ├── storage/       # 0G Storage abstraction (files + KV)
│   ├── compute/       # 0G Compute abstraction (inference)
│   └── chain/         # 0G Chain interaction layer
├── apps/
│   ├── keeper/        # Autonomous daemon (the creature's brain)
│   └── dashboard/     # Public dashboard (thought stream + nudge UI)
└── scripts/           # Deploy, seed genome, dev utilities
```

## The Genome

The creature's strategy is a self-modifying document stored on 0G Storage. It contains:

- **System prompt** — core instructions the creature follows
- **Learnings** — accumulated lessons from past challenges
- **Strengths/weaknesses** — self-assessed capabilities
- **Strategies** — domain-specific approaches (e.g. "for DeFi bounties, start with...")

After every challenge, `evolve()` feeds the genome + outcome to 0G Compute, which produces an improved version. The creature literally rewrites its own brain. Every generation is recorded on-chain.

## Decentralization Assessment

| Component | Decentralized? | Notes |
|---|---|---|
| Smart contracts | Yes | On 0G Chain, immutable |
| Storage | Yes | 0G Storage, publicly readable |
| Inference | Yes | 0G Compute, TEE-verified |
| Keeper daemon | Semi | Anyone can run one |
| Bounty submission | Depends | Some platforms support on-chain submission |
| Result verification | Semi | Manual settlement for now, oracle later |

## Status

🚧 **Early development** — architecture planned, implementation starting.

## License

MIT
