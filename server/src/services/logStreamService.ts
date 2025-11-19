import { Response } from "express";

interface LogMessage {
  timestamp: string;
  message: string;
  type: "log" | "error" | "warn" | "info";
}

class LogStreamService {
  private clients: Response[] = [];
  private logHistory: LogMessage[] = [];
  private maxHistorySize = 1000;

  /**
   * Add a client for SSE log streaming
   */
  addClient(res: Response) {
    this.clients.push(res);
    console.log(`📡 Client connected. Total clients: ${this.clients.length}`);

    // Send recent log history to new client
    this.logHistory.forEach((log) => {
      this.sendToClient(res, log);
    });
  }

  /**
   * Remove a client when disconnected
   */
  removeClient(res: Response) {
    this.clients = this.clients.filter((client) => client !== res);
    console.log(
      `📡 Client disconnected. Total clients: ${this.clients.length}`
    );
  }

  /**
   * Send a log message to a specific client
   */
  private sendToClient(client: Response, log: LogMessage) {
    try {
      client.write(`data: ${JSON.stringify(log)}\n\n`);
    } catch (error) {
      // Client disconnected, will be removed on next cleanup
    }
  }

  /**
   * Broadcast a log message to all connected clients
   */
  private broadcast(message: string, type: LogMessage["type"] = "log") {
    const log: LogMessage = {
      timestamp: new Date().toISOString(),
      message,
      type,
    };

    // Add to history
    this.logHistory.push(log);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Send to all connected clients
    this.clients.forEach((client) => {
      this.sendToClient(client, log);
    });
  }

  /**
   * Log a message (broadcasts to clients and console)
   */
  log(message: string) {
    console.log(message);
    this.broadcast(message, "log");
  }

  /**
   * Log an error (broadcasts to clients and console)
   */
  error(message: string) {
    console.error(message);
    this.broadcast(message, "error");
  }

  /**
   * Log a warning (broadcasts to clients and console)
   */
  warn(message: string) {
    console.warn(message);
    this.broadcast(message, "warn");
  }

  /**
   * Log info (broadcasts to clients and console)
   */
  info(message: string) {
    console.info(message);
    this.broadcast(message, "info");
  }

  /**
   * Clear log history
   */
  clearHistory() {
    this.logHistory = [];
    this.broadcast("--- Logs cleared ---", "info");
  }

  /**
   * Get number of connected clients
   */
  getClientCount(): number {
    return this.clients.length;
  }
}

export default new LogStreamService();
