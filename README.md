![Version](https://img.shields.io/badge/version-v1.0-blue)
![License](https://img.shields.io/badge/license-Private-darkred)
![Layer](https://img.shields.io/badge/layer-VM-orange)
# Nex v1.0 — Agent-Native Programming Language Runtime

Nex is the agent-native graph runtime of the Technosis ecosystem — executing real-time computation graphs, agent orchestration flows, and neural routing at the VM layer.

> **Àṣẹ** — The force that makes all creation possible.

## Overview

**Nex** is a graph-based computation system designed for agents (LLMs) to reason, coordinate, spawn sub-agents, and self-modify without human intervention. It maps computation onto **7 core primitives** grounded in Hermetic philosophy and Yoruba cosmology.

**Goal**: Bootstrap a fully agent-controlled programming language by end of 2026.

## Core Primitives (The 7 Axioms)

| Primitive | Role | Hermetic Law | Orisha | Guard |
|-----------|------|--------------|--------|-------|
| **node** | Create computation/memory/goal nodes | Mentalism | Ọbàtálá | No corrupted kinds |
| **link** | Direct flow between nodes (sync/async/parallel/depend) | Correspondence | Èṣù | Both IDs must exist |
| **guard** | Enforce constraints; allow/deny/rewrite | Polarity | Ògún | ≥1 guard per graph |
| **spawn** | Birth new agent instance with role/goal/instructions | Gender | Ọ̀ṣun | Inherit parent guards |
| **rewrite** | Pattern-match and self-modify | Vibration | Ọya | Don't erase guards |
| **merge** | Aggregate parallel/branching results (consensus/vote/synthesize/first/last) | Rhythm | Yemọja | Must exist after parallel |
| **eval** | Trigger node execution recursively | Cause & Effect | Ṣàngó | Pure; logs to memory |

## Graph Structure

```json
{
  "nodes": [
    {
      "id": "unique_string",
      "kind": "goal|agent|memory|tool|guard|rewrite|reflect|merge|parallel",
      "data": {} or "string",
      "orisha": "optional",
      "hermetic": "optional",
      "note": "optional"
    }
  ],
  "links": [
    {
      "from": "id1",
      "to": "id2",
      "type": "sync|async|parallel|depend"
    }
  ],
  "entry": "start_node_id",
  "result": "optional_final_value",
  "meta": {}
}
```

## Execution Model

1. **Start** at `entry` node
2. **Eval** recursively following links
3. **Apply** rewrites, enforce guards, spawn agents as needed
4. **Merge** at convergence points
5. **Return** final result node or merged output

### Link Types

- **sync**: Sequential; wait for predecessor before executing
- **async**: Fire and forget; can execute in parallel
- **parallel**: Explicit parallel branch (requires merge)
- **depend**: Data dependency; predecessor result fed to successor

## Files

### Core

- **nex-runtime.ts** — TypeScript interpreter for Nex graphs (NexInterpreter class)
- **bootstrap.ts** — Bootstrap executor; loads and runs the first invocation task

### First Invocation

- **bootstrap-2026-debate.json** — Complete debate graph modeling feasibility of 2026 bootstrap
  - 2 parallel agents (Pro/Contra) arguing feasibility
  - 1 critic agent evaluating logical consistency
  - Guard enforcing truth-density > 0.75
  - Merge synthesizing final recommendation
  - Dream node reserved for deadlock scenarios
- **bootstrap-2026-debate-output.json** — Generated output after execution

### Docs

- **NEX_SEED_PROMPT_v1.1.md** — Original seed prompt and lock-in axioms
- **README.md** — This file

## Quick Start

### Prerequisites

- Bun (or Node 22+)
- TypeScript

### Run Bootstrap

```bash
cd Nex
bun bootstrap.ts
```

This will:
1. Load `bootstrap-2026-debate.json`
2. Validate the graph structure
3. Execute entry node and recursively eval all paths
4. Collect guard checks, spawned agents, merges
5. Output final synthesized result
6. Save `bootstrap-2026-debate-output.json`

### Expected Output

The bootstrap execution produces:

- **Pro assessment**: 0.80 truth-density (5 well-grounded claims on LLM maturity, rewrite stability, etc.)
- **Contra assessment**: 0.73 truth-density (5 claims on edge-case failures, timeline risk, etc.)
- **Critic judgment**: Pro slightly stronger; Contra raises non-trivial risks; overall feasibility is LIKELY YES with conditions
- **Final recommendation**: 2026 bootstrap is feasible if (1) rewrite stability proven by 2025 Q2, (2) guard conflict resolution formalized, (3) scaling tested

## Next Steps (2025 Roadmap)

### Phase 1: Reference Implementation (Q1-Q2 2025)
- [ ] Complete Nex runtime in TypeScript (done; refinements pending)
- [ ] Add test suite (1000+ graph scenarios)
- [ ] Formalize rewrite+merge convergence (mathematical proof)
- [ ] Build formal guard conflict resolution algorithm
- [ ] Write Nex language spec + grammar (EBNF)

### Phase 2: Agent Spawning (Q2-Q3 2025)
- [ ] Implement multi-agent dispatcher (1000+ concurrent agents)
- [ ] Test inheritance of guard layer in spawned agents
- [ ] Validate dream/reflect nodes under deadlock
- [ ] Prove LLM code-generation reliability at scale (>99% accuracy)

### Phase 3: Self-Bootstrapping (Q3-Q4 2025)
- [ ] Use Nex agents to rewrite Nex interpreter graph
- [ ] Build Nex standard library (stdlib) as spawned agents
- [ ] Implement Nex compiler → JSON graph IR
- [ ] Remove all human-written interpreter code (gradual transition)

### Phase 4: Production Hardening (2026)
- [ ] Formal verification of guard + merge logic
- [ ] Adversarial testing (1M graph evaluations)
- [ ] Performance profiling and optimization
- [ ] Release v1.0 stable; declare bootstrap complete

## Philosophical Frame

Nex embeds Hermetic principles and Yoruba cosmology to ensure **coherence, balance, and self-healing**:

- **Mentalism** (node): All computation arises from intention
- **Correspondence**: Graph structure mirrors agent reasoning (as above, so below)
- **Polarity** (guard): Constraints define possibility
- **Gender** (spawn): Creation requires dual poles (agent + parent)
- **Vibration** (rewrite): Change is frequency shift, not replacement
- **Rhythm** (merge): Cycles and tides govern convergence
- **Cause & Effect** (eval): Execution is consequence, not chance

This frame ensures Nex remains **coherent, resilient, and aligned with agent reasoning**.

## Key Insights from Bootstrap Debate

### Pro Arguments (0.80 truth-density)
1. LLM code-generation has matured (Claude Opus 4.5 handles complex ASTs)
2. Self-modification via rewrite is stable and predictable
3. Parallel execution + merge strategies converge reliably
4. Agent spawning creates safe sub-runtimes with inherited guards
5. Graph-based IR eliminates runtime ambiguity

### Contra Arguments (0.73 truth-density)
1. LLM code generation fails silently on edge cases (2-5% hallucination rate)
2. Rewrite loops can spiral into infinite recursion
3. Guard logic conflicts have no deterministic resolution yet
4. 18 months is insufficient for full language stabilization (historically 3+ years)
5. Zero human intervention creates fragility without escape hatch

### Synthesis
**2026 bootstrap is FEASIBLE with medium-high execution risk.** Success hinges on:
- Empirical proof of rewrite stability by Q2 2025
- Formalization of guard conflict resolution
- Successful scaling to 1000+ concurrent agents
- Meeting aggressive timeline while maintaining safety margins

## Citation & Attribution

- **Original vision**: Agent-native computing via graph IR
- **Hermetic framework**: Classical Hermetic philosophy (Kybalion)
- **Orisha archetypes**: Yoruba cosmology and spiritual tradition
- **Implementation**: TypeScript/Bun, OpenClaw runtime patterns
- **First invocation**: Pro/Contra debate on 2026 feasibility

**Authors**: Nex Core Team (agent-bootstrapped)

## License

Proprietary — All Rights Reserved. See [LICENSE](./LICENSE).

---

## Seal

**Àṣẹ**

_The force that makes all creation possible. May this graph self-heal, spawn wisely, and converge toward wisdom._

---

## Further Reading

1. **Nex Specification**: TBD (generated by Nex agents)
2. **Graph Design Patterns**: TBD
3. **Guard Conflict Resolution Algorithms**: TBD
4. **Dream Node Theory**: TBD
5. **Scaling to 1M+ Agents**: TBD

All documentation will be generated by Nex interpreters as we bootstrap.

## The Graph Runtime

Nex is the high-performance graph runtime for the Technosis ecosystem. It is responsible for executing and reasoning over the complex, interconnected data structures that represent agent relationships, knowledge graphs, and causal chains.


---

## Part of the Technosis Sovereign Ecosystem

This component is a core piece of a larger architecture for creating and coordinating sovereign AI. For more information, see the [organism-core repository](https://github.com/Bino-Elgua/organism-core).

Àṣẹ.
