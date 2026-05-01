#!/usr/bin/env node
/**
 * Nex Gateway v1.0 — Persistent Graph Execution Server
 *
 * HTTP gateway for accepting, executing, and returning Nex graphs.
 * Model: OpenClaw gateway pattern
 *
 * Listen: http://localhost:18789
 * Protocol: JSON graph input → JSON result output
 */

import { NexInterpreter, NexGraph } from "./nex-runtime.js";
import http from "http";
import { URL } from "url";

interface GatewayRequest {
  id: string;
  action: "execute" | "validate" | "status";
  graph?: NexGraph;
  timestamp: number;
}

interface GatewayResponse {
  id: string;
  status: "success" | "error";
  result?: Record<string, unknown>;
  error?: string;
  timestamp: number;
  executionMs?: number;
}

interface GatewaySession {
  id: string;
  connected: boolean;
  executions: number;
  lastExecution: number;
}

class NexGateway {
  private port: number;
  private sessions: Map<string, GatewaySession> = new Map();
  private executionCount: number = 0;
  private startTime: number = Date.now();

  constructor(port: number = 18789) {
    this.port = port;
  }

  public start() {
    const server = http.createServer(async (req, res) => {
      // Enable CORS
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
      }

      const url = new URL(req.url || "/", `http://localhost:${this.port}`);

      // Health check
      if (url.pathname === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
        return;
      }

      // Status endpoint
      if (url.pathname === "/status") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            gateway: "Nex v1.0",
            uptime: Date.now() - this.startTime,
            executions: this.executionCount,
            sessions: this.sessions.size,
            timestamp: Date.now(),
          })
        );
        return;
      }

      // Execute endpoint
      if (url.pathname === "/execute" && req.method === "POST") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", async () => {
          try {
            const data = JSON.parse(body);
            const graph: NexGraph = data.graph;

            if (!graph) {
              res.writeHead(400, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  status: "error",
                  error: "Missing graph in request body",
                })
              );
              return;
            }

            const startTime = Date.now();
            const interpreter = new NexInterpreter(graph);
            const result = await interpreter.execute();
            const executionMs = Date.now() - startTime;

            this.executionCount++;

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                status: "success",
                result,
                executionMs,
                timestamp: Date.now(),
              })
            );
          } catch (error) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                status: "error",
                error: String(error),
              })
            );
          }
        });
        return;
      }

      // 404
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
    });

    server.listen(this.port, () => {
      console.log(
        "═══════════════════════════════════════════════════════════════"
      );
      console.log("  Nex Gateway v1.0 — Graph Execution Server");
      console.log(
        "═══════════════════════════════════════════════════════════════\n"
      );
      console.log(`🚀 Gateway running on http://localhost:${this.port}`);
      console.log(`⏰ Started: ${new Date().toISOString()}`);
      console.log("\n📚 API Endpoints:");
      console.log("  GET  /health — Health check");
      console.log("  GET  /status — Gateway status");
      console.log("  POST /execute — Execute a graph\n");
      console.log("═══════════════════════════════════════════════════════════════\n");
      console.log("📖 Example request:");
      console.log('  curl -X POST http://localhost:18789/execute \\');
      console.log('    -H "Content-Type: application/json" \\');
      console.log("    -d '{\"graph\": {...}}'\n");
    });

    return server;
  }
}

async function main() {
  const port = process.env.NEX_PORT ? parseInt(process.env.NEX_PORT) : 18789;
  const gateway = new NexGateway(port);
  gateway.start();

  console.log("💾 Gateway is now listening...");
  console.log("   Press Ctrl+C to stop\n");
}

main().catch(console.error);
