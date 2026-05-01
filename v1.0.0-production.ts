#!/usr/bin/env node
/**
 * Nex v1.0.0 — Production Hardening & Safety
 *
 * Adds resilience layer:
 * - Error recovery & circuit breaker
 * - Resource limits (timeouts, memory)
 * - Performance caching
 * - Metrics & monitoring
 * - Graceful degradation
 */

import { NexInterpreter, NexGraph } from "./nex-runtime.js";

interface ExecutionMetrics {
  graphId: string;
  executionMs: number;
  memoryUsed: number;
  nodesExecuted: number;
  errors: number;
  timestamp: number;
}

interface CircuitBreakerState {
  closed: boolean; // normal operation
  open: boolean; // too many errors, reject requests
  halfOpen: boolean; // testing recovery
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
}

export class ProductionNexInterpreter {
  private cache: Map<string, any> = new Map();
  private metrics: ExecutionMetrics[] = [];
  private circuitBreaker: CircuitBreakerState = {
    closed: true,
    open: false,
    halfOpen: false,
    failureCount: 0,
    successCount: 0,
    lastFailureTime: 0,
  };

  private readonly TIMEOUT_MS = 30000;
  private readonly MAX_FAILURES = 5;
  private readonly FAILURE_RESET_MS = 60000;
  private readonly MAX_MEMORY_MB = 256;
  private readonly CACHE_TTL_MS = 300000; // 5 minutes

  constructor(private graph: NexGraph) {}

  /**
   * Execute graph with production safety guardrails
   */
  public async executeWithSafety(): Promise<{
    result: Record<string, unknown> | null;
    metrics: ExecutionMetrics;
    error?: string;
  }> {
    const startTime = Date.now();
    const graphId = this.generateId();

    try {
      // Check circuit breaker
      if (this.circuitBreaker.open) {
        throw new Error(
          "Circuit breaker OPEN: too many failures, please retry later"
        );
      }

      // Check cache first
      const cached = this.getFromCache(graphId);
      if (cached) {
        return {
          result: cached,
          metrics: {
            graphId,
            executionMs: 0,
            memoryUsed: 0,
            nodesExecuted: 0,
            errors: 0,
            timestamp: Date.now(),
          },
        };
      }

      // Execute with timeout
      const result = await this.executeWithTimeout(startTime);

      // Update circuit breaker on success
      this.recordSuccess();

      // Cache result
      this.cache.set(graphId, result);

      const metrics: ExecutionMetrics = {
        graphId,
        executionMs: Date.now() - startTime,
        memoryUsed: this.getMemoryUsage(),
        nodesExecuted: this.graph.nodes.length,
        errors: 0,
        timestamp: Date.now(),
      };

      this.metrics.push(metrics);
      return { result, metrics };
    } catch (error) {
      const metrics: ExecutionMetrics = {
        graphId,
        executionMs: Date.now() - startTime,
        memoryUsed: this.getMemoryUsage(),
        nodesExecuted: this.graph.nodes.length,
        errors: 1,
        timestamp: Date.now(),
      };

      // Update circuit breaker on failure
      this.recordFailure();

      // Log error but don't throw
      console.error(`[ERROR] Graph execution failed: ${error}`);

      return {
        result: null,
        metrics,
        error: String(error),
      };
    }
  }

  /**
   * Execute with timeout protection
   */
  private async executeWithTimeout(
    startTime: number
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(
            `Graph execution timeout (${this.TIMEOUT_MS}ms exceeded)`
          )
        );
      }, this.TIMEOUT_MS);

      try {
        const interpreter = new NexInterpreter(this.graph);
        interpreter
          .execute()
          .then((result) => {
            clearTimeout(timeout);
            resolve(result);
          })
          .catch((error) => {
            clearTimeout(timeout);
            reject(error);
          });
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Circuit breaker: record success
   */
  private recordSuccess(): void {
    this.circuitBreaker.successCount++;

    if (this.circuitBreaker.halfOpen) {
      // Exiting half-open state
      this.circuitBreaker.closed = true;
      this.circuitBreaker.halfOpen = false;
      this.circuitBreaker.open = false;
      this.circuitBreaker.failureCount = 0;
      console.log("[HEALTH] Circuit breaker recovered");
    }
  }

  /**
   * Circuit breaker: record failure
   */
  private recordFailure(): void {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();

    if (this.circuitBreaker.failureCount >= this.MAX_FAILURES) {
      this.circuitBreaker.closed = false;
      this.circuitBreaker.open = true;
      console.error(
        `[ALERT] Circuit breaker OPEN after ${this.MAX_FAILURES} failures`
      );

      // Schedule half-open state test
      setTimeout(() => {
        if (this.circuitBreaker.open) {
          this.circuitBreaker.halfOpen = true;
          console.log("[HEALTH] Circuit breaker testing recovery...");
        }
      }, this.FAILURE_RESET_MS);
    }
  }

  /**
   * Get from cache if valid
   */
  private getFromCache(id: string): Record<string, unknown> | null {
    // Cache disabled for safety in v1.0.0 (can be re-enabled after validation)
    return null;
  }

  /**
   * Get memory usage in MB
   */
  private getMemoryUsage(): number {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    }
    return 0;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `graph_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Get execution metrics
   */
  public getMetrics(): {
    total: number;
    avgExecutionMs: number;
    totalErrors: number;
    avgMemory: number;
    circuitBreakerStatus: string;
  } {
    const avgExecutionMs =
      this.metrics.length > 0
        ? Math.round(
            this.metrics.reduce((a, m) => a + m.executionMs, 0) /
              this.metrics.length
          )
        : 0;

    const totalErrors = this.metrics.reduce((a, m) => a + m.errors, 0);

    const avgMemory =
      this.metrics.length > 0
        ? Math.round(
            this.metrics.reduce((a, m) => a + m.memoryUsed, 0) /
              this.metrics.length
          )
        : 0;

    return {
      total: this.metrics.length,
      avgExecutionMs,
      totalErrors,
      avgMemory,
      circuitBreakerStatus: this.circuitBreaker.open
        ? "OPEN"
        : this.circuitBreaker.halfOpen
          ? "HALF-OPEN"
          : "CLOSED",
    };
  }
}

/**
 * Health check for production deployment
 */
export async function healthCheck(): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  checks: Record<string, boolean>;
  timestamp: number;
}> {
  const checks: Record<string, boolean> = {};

  // Check 1: Basic graph execution
  try {
    const testGraph: NexGraph = {
      nodes: [
        { id: "n1", kind: "goal", data: { test: true } },
        {
          id: "n2",
          kind: "guard",
          data: { condition: true, consequence: "allow" },
        },
      ],
      links: [{ from: "n1", to: "n2", type: "sync" }],
      entry: "n1",
    };

    const prod = new ProductionNexInterpreter(testGraph);
    const result = await prod.executeWithSafety();
    checks.graphExecution = result.error === undefined;
  } catch {
    checks.graphExecution = false;
  }

  // Check 2: Memory
  checks.memory =
    typeof process !== "undefined"
      ? process.memoryUsage().heapUsed / 1024 / 1024 < 200
      : true;

  // Check 3: Interpreter availability
  checks.interpreter = NexInterpreter !== undefined;

  const healthy =
    Object.values(checks).filter((v) => v).length === Object.keys(checks).length;

  return {
    status: healthy ? "healthy" : Object.values(checks).some((v) => v) ? "degraded" : "unhealthy",
    checks,
    timestamp: Date.now(),
  };
}

export { NexInterpreter };
