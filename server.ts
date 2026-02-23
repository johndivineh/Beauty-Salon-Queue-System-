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
    },
    allowEIO3: true,
    transports: ['websocket', 'polling']
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
  const broadcastState = (senderId?: string) => {
    const payload = {
      styles,
      inventory,
      queue,
      braiders,
      serviceLogs,
      auditLogs
    };
    io.emit("state_update", payload);
    console.log(`Broadcasted state update to all clients${senderId ? ` (triggered by ${senderId})` : ''}`);
  };

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    
    // Send initial state to the new client
    socket.emit("state_update", {
      styles,
      inventory,
      queue,
      braiders,
      serviceLogs,
      auditLogs
    });

    socket.on("update_styles", (newStyles: Style[]) => {
      console.log(`Received styles update from ${socket.id}`);
      styles = newStyles;
      broadcastState(socket.id);
    });

    socket.on("update_inventory", (newInventory: InventoryItem[]) => {
      console.log(`Received inventory update from ${socket.id}`);
      inventory = newInventory;
      broadcastState(socket.id);
    });

    socket.on("update_queue", (newQueue: QueueEntry[]) => {
      console.log(`Received queue update from ${socket.id}`);
      queue = newQueue;
      broadcastState(socket.id);
    });

    socket.on("update_braiders", (newBraiders: Braider[]) => {
      console.log(`Received braiders update from ${socket.id}`);
      braiders = newBraiders;
      broadcastState(socket.id);
    });

    socket.on("update_service_logs", (newLogs: ServiceLog[]) => {
      console.log(`Received service logs update from ${socket.id}`);
      serviceLogs = newLogs;
      broadcastState(socket.id);
    });

    socket.on("update_audit_logs", (newLogs: AuditLogEntry[]) => {
      console.log(`Received audit logs update from ${socket.id}`);
      auditLogs = newLogs;
      broadcastState(socket.id);
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
