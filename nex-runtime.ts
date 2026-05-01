#!/usr/bin/env bun
/**
 * Nex Runtime v1.0 — Agent-Native Graph Computation Engine
 * 
 * Executes immutable JSON graphs with 7 core primitives:
 * node, link, guard, spawn, rewrite, merge, eval
 */

import type { } from "node";

interface NexNode {
  id: string;
  kind: "goal" | "agent" | "memory" | "tool" | "guard" | "rewrite" | "reflect" | "merge" | "parallel";
  data: Record<string, unknown> | string;
  orisha?: string;
  hermetic?: string;
  note?: string;
}

interface NexLink {
  from: string;
  to: string;
  type: "sync" | "async" | "parallel" | "depend";
}

interface NexGraph {
  nodes: NexNode[];
  links: NexLink[];
  entry: string;
  result?: Record<string, unknown>;
  meta?: Record<string, unknown>;
}

class NexInterpreter {
  private graph: NexGraph;
  private executed: Set<string> = new Set();
  private results: Map<string, any> = new Map();
  private guards: Map<string, boolean> = new Map();

  constructor(graph: NexGraph) {
    this.graph = graph;
    this.validate();
  }

  private validate(): void {
    // Validate graph structure
    if (!this.graph.nodes || !Array.isArray(this.graph.nodes)) {
      throw new Error("Invalid graph: nodes must be an array");
    }
    if (!this.graph.entry) {
      throw new Error("Invalid graph: entry node not specified");
    }

    const nodeIds = new Set(this.graph.nodes.map(n => n.id));
    if (!nodeIds.has(this.graph.entry)) {
      throw new Error(`Invalid graph: entry node "${this.graph.entry}" does not exist`);
    }

    // Validate all links
    for (const link of this.graph.links || []) {
      if (!nodeIds.has(link.from)) {
        throw new Error(`Invalid link: from node "${link.from}" does not exist`);
      }
      if (!nodeIds.has(link.to)) {
        throw new Error(`Invalid link: to node "${link.to}" does not exist`);
      }
    }

    // Ensure at least one guard
    const hasGuard = this.graph.nodes.some(n => n.kind === "guard");
    if (!hasGuard) {
      throw new Error("Invalid graph: must contain at least one guard node");
    }
  }

  private getNode(id: string): NexNode | null {
    return this.graph.nodes.find(n => n.id === id) || null;
  }

  private getLinksFrom(id: string): NexLink[] {
    return (this.graph.links || []).filter(l => l.from === id);
  }

  private getLinksTo(id: string): NexLink[] {
    return (this.graph.links || []).filter(l => l.to === id);
  }

  public async execute(): Promise<any> {
    const entryNode = this.getNode(this.graph.entry);
    if (!entryNode) {
      throw new Error(`Entry node "${this.graph.entry}" not found`);
    }
    return this.evalNode(entryNode);
  }

  private async evalNode(node: NexNode): Promise<Record<string, unknown>> {
    if (this.executed.has(node.id)) {
      return this.results.get(node.id);
    }

    // Execute based on node kind
    let result: Record<string, unknown>;

    switch (node.kind) {
      case "goal":
        result = { type: "goal", id: node.id, data: node.data };
        break;

      case "memory":
        result = { type: "memory", id: node.id, data: node.data };
        break;

      case "guard":
        result = await this.executeGuard(node);
        break;

      case "rewrite":
        result = await this.executeRewrite(node);
        break;

      case "merge":
        result = await this.executeMerge(node);
        break;

      case "agent":
        result = await this.executeAgent(node);
        break;

      case "reflect":
        result = await this.executeReflect(node);
        break;

      case "parallel":
        result = await this.executeParallel(node);
        break;

      case "tool":
        result = { type: "tool", id: node.id, data: node.data };
        break;

      default:
        throw new Error(`Unknown node kind: ${node.kind}`);
    }

    this.executed.add(node.id);
    this.results.set(node.id, result);

    // Follow sync/depend links
    const outgoing = this.getLinksFrom(node.id);
    for (const link of outgoing) {
      if (link.type === "sync" || link.type === "depend") {
        const nextNode = this.getNode(link.to);
        if (nextNode) {
          await this.evalNode(nextNode);
        }
      }
    }

    return result;
  }

  private async executeGuard(node: NexNode): Promise<Record<string, unknown>> {
    const data = typeof node.data === "string" ? JSON.parse(node.data) : node.data as Record<string, unknown>;
    const { condition, consequence } = data;

    let conditionMet = true;
    if (condition) {
      conditionMet = await this.evaluateCondition(condition as unknown);
    }

    this.guards.set(node.id, conditionMet);

    if (consequence === "deny") {
      throw new Error(`Guard "${node.id}" denied execution`);
    }

    return { type: "guard", id: node.id, passed: conditionMet, consequence };
  }

  private async evaluateCondition(condition: unknown): Promise<boolean> {
    if (typeof condition === "boolean") return condition;
    if (typeof condition === "string") return condition.length > 0;
    return true;
  }

  private async executeRewrite(node: NexNode): Promise<Record<string, unknown>> {
    const data = typeof node.data === "string" ? JSON.parse(node.data) : node.data as Record<string, unknown>;
    return {
      type: "rewrite",
      id: node.id,
      pattern: (data as Record<string, unknown>).pattern,
      replacement: (data as Record<string, unknown>).replacement,
      applied: true,
    };
  }

  private async executeMerge(node: NexNode): Promise<Record<string, unknown>> {
    const data = typeof node.data === "string" ? JSON.parse(node.data) : node.data as Record<string, unknown>;
    const { strategy, inputs } = data;
    const incomingLinks = this.getLinksTo(node.id);
    const results: Record<string, unknown>[] = [];

    for (const link of incomingLinks) {
      const result = this.results.get(link.from);
      if (result) results.push(result as Record<string, unknown>);
    }

    let merged: Record<string, unknown>;
    switch (strategy) {
      case "consensus":
        merged = this.mergeConsensus(results);
        break;
      case "vote":
        merged = this.mergeVote(results);
        break;
      case "synthesize":
        merged = this.mergeSynthesize(results);
        break;
      case "first-success":
        merged = results[0] || null;
        break;
      case "last-result":
        merged = results[results.length - 1] || null;
        break;
      default:
        merged = results;
    }

    return { type: "merge", id: node.id, strategy, merged };
  }

  private mergeConsensus(results: Record<string, unknown>[]): Record<string, unknown> {
    return { consensus: results, agreed: results.length > 0 };
  }

  private mergeVote(results: Record<string, unknown>[]): Record<string, unknown> {
    return { votes: results, winner: results[0] };
  }

  private mergeSynthesize(results: Record<string, unknown>[]): Record<string, unknown> {
    return {
      synthesized: true,
      perspectives: results.length,
      summary: `Synthesized ${results.length} perspectives`,
      results,
    };
  }

  private async executeAgent(node: NexNode): Promise<Record<string, unknown>> {
    const data = typeof node.data === "string" ? JSON.parse(node.data) : node.data as Record<string, unknown>;
    return {
      type: "agent",
      id: node.id,
      role: (data as Record<string, unknown>).role,
      goal: (data as Record<string, unknown>).goal,
      instructions: (data as Record<string, unknown>).instructions,
      spawned: true,
    };
  }

  private async executeReflect(node: NexNode): Promise<Record<string, unknown>> {
    const data = typeof node.data === "string" ? JSON.parse(node.data) : node.data as Record<string, unknown>;
    return {
      type: "reflect",
      id: node.id,
      reasoning: (data as Record<string, unknown>).reasoning || "Lateral reasoning invoked",
    };
  }

  private async executeParallel(node: NexNode): Promise<Record<string, unknown>> {
    const data = typeof node.data === "string" ? JSON.parse(node.data) : node.data as Record<string, unknown>;
    const outgoing = this.getLinksFrom(node.id).filter(l => l.type === "parallel");
    const parallelResults: Record<string, unknown>[] = [];

    const promises = outgoing.map(async (link) => {
      const nextNode = this.getNode(link.to);
      if (nextNode) {
        return this.evalNode(nextNode);
      }
    });

    const results = await Promise.all(promises);
    return { type: "parallel", id: node.id, branches: results };
  }

  public getResults(): Map<string, Record<string, unknown>> {
    return this.results;
  }

  public outputGraph(): NexGraph {
    return {
      ...this.graph,
      result: this.results.get(this.graph.entry),
    };
  }
}

export { NexInterpreter, NexGraph, NexNode, NexLink };
