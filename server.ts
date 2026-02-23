import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { Branch, QueueEntry, Style, InventoryItem, Braider, ServiceLog, AuditLogEntry, QueueStatus } from "./types";
import { INITIAL_STYLES, INITIAL_INVENTORY, INITIAL_BRAIDERS, INITIAL_QUEUE } from "./constants";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // Server-side state
  let styles: Style[] = [...INITIAL_STYLES];
  let inventory: InventoryItem[] = [...INITIAL_INVENTORY];
  let queue: QueueEntry[] = [...INITIAL_QUEUE];
  let braiders: Braider[] = [...INITIAL_BRAIDERS];
  let serviceLogs: ServiceLog[] = [];
  let auditLogs: AuditLogEntry[] = [];

  // Helper to broadcast state
  const broadcastState = () => {
    io.emit("state_update", {
      styles,
      inventory,
      queue,
      braiders,
      serviceLogs,
      auditLogs
    });
  };

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    // Send initial state
    socket.emit("state_update", {
      styles,
      inventory,
      queue,
      braiders,
      serviceLogs,
      auditLogs
    });

    socket.on("update_styles", (newStyles: Style[]) => {
      styles = newStyles;
      broadcastState();
    });

    socket.on("update_inventory", (newInventory: InventoryItem[]) => {
      inventory = newInventory;
      broadcastState();
    });

    socket.on("update_queue", (newQueue: QueueEntry[]) => {
      queue = newQueue;
      broadcastState();
    });

    socket.on("update_braiders", (newBraiders: Braider[]) => {
      braiders = newBraiders;
      broadcastState();
    });

    socket.on("update_service_logs", (newLogs: ServiceLog[]) => {
      serviceLogs = newLogs;
      broadcastState();
    });

    socket.on("update_audit_logs", (newLogs: AuditLogEntry[]) => {
      auditLogs = newLogs;
      broadcastState();
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
