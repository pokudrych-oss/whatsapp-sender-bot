import { Client, LocalAuth } from "whatsapp-web.js";
import { prisma } from "./db.js";
import qrcode from "qrcode";
import { EventEmitter } from "events";
import path from "path";
import fs from "fs";

export const whatsappEvents = new EventEmitter();

class WhatsAppManager {
  private clients: Map<string, Client> = new Map();
  private qrs: Map<string, string> = new Map();

  async init() {
    // On startup, we can auto-start clients that were previously marked as CONNECTED.
    const activeAccounts = await prisma.account.findMany({
      where: {
        status: { in: ["CONNECTED", "CONNECTING"] }
      }
    });

    console.log(`[WhatsApp] Auto-connecting ${activeAccounts.length} accounts...`);
    for (const acc of activeAccounts) {
      this.connect(acc.phone).catch((err) => {
        console.error(`[WhatsApp] Failed to auto-connect ${acc.phone}:`, err);
      });
    }
  }

  getClient(phone: string): Client | undefined {
    return this.clients.get(phone);
  }

  getQr(phone: string): string | undefined {
    return this.qrs.get(phone);
  }

  async connect(phone: string): Promise<Client> {
    if (this.clients.has(phone)) {
      console.log(`[WhatsApp] Client already exists for ${phone}`);
      return this.clients.get(phone)!;
    }

    console.log(`[WhatsApp] Connecting client for ${phone}...`);
    await prisma.account.updateMany({
      where: { phone },
      data: { status: "CONNECTING" }
    });
    whatsappEvents.emit("status", { phone, status: "CONNECTING" });

    const chromePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

    const client = new Client({
      authStrategy: new LocalAuth({
        clientId: phone,
        dataPath: path.resolve("./sessions")
      }),
      puppeteer: {
        headless: true,
        executablePath: chromePath,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--single-process",
          "--disable-gpu"
        ]
      }
    });

    this.clients.set(phone, client);

    client.on("qr", async (qrString) => {
      console.log(`[WhatsApp] QR code generated for ${phone}`);
      try {
        const qrDataUrl = await qrcode.toDataURL(qrString);
        this.qrs.set(phone, qrDataUrl);
        whatsappEvents.emit("qr", { phone, qr: qrDataUrl });
      } catch (err) {
        console.error("[WhatsApp] Error generating QR Data URL:", err);
      }
    });

    client.on("ready", async () => {
      console.log(`[WhatsApp] Client is ready for ${phone}`);
      this.qrs.delete(phone);
      
      const whatsappInfo = client.info;
      const connectedName = whatsappInfo?.pushname || "WhatsApp Account";

      await prisma.account.updateMany({
        where: { phone },
        data: { status: "CONNECTED", name: connectedName }
      });

      whatsappEvents.emit("status", { phone, status: "CONNECTED" });
      whatsappEvents.emit("ready", { phone });
    });

    client.on("auth_failure", async (msg) => {
      console.error(`[WhatsApp] Auth failure for ${phone}:`, msg);
      this.qrs.delete(phone);
      await this.destroyClient(phone);
      await prisma.account.updateMany({
        where: { phone },
        data: { status: "DISCONNECTED" }
      });
      whatsappEvents.emit("status", { phone, status: "DISCONNECTED" });
    });

    client.on("disconnected", async (reason) => {
      console.log(`[WhatsApp] Client disconnected for ${phone}:`, reason);
      this.qrs.delete(phone);
      await this.destroyClient(phone);
      await prisma.account.updateMany({
        where: { phone },
        data: { status: "DISCONNECTED" }
      });
      whatsappEvents.emit("status", { phone, status: "DISCONNECTED" });
    });

    client.initialize().catch(async (err) => {
      console.error(`[WhatsApp] Initialization error for ${phone}:`, err);
      this.qrs.delete(phone);
      await this.destroyClient(phone);
      await prisma.account.updateMany({
        where: { phone },
        data: { status: "DISCONNECTED" }
      });
      whatsappEvents.emit("status", { phone, status: "DISCONNECTED" });
    });

    return client;
  }

  async disconnect(phone: string): Promise<void> {
    console.log(`[WhatsApp] Disconnecting client for ${phone}...`);
    this.qrs.delete(phone);
    await this.destroyClient(phone);
    await prisma.account.updateMany({
      where: { phone },
      data: { status: "DISCONNECTED" }
    });
    whatsappEvents.emit("status", { phone, status: "DISCONNECTED" });
  }

  async deleteAccount(phone: string): Promise<void> {
    console.log(`[WhatsApp] Deleting account and sessions for ${phone}...`);
    await this.disconnect(phone);
    
    // Remove LocalAuth session dir
    const sessionDir = path.resolve("./sessions", `session-${phone}`);
    if (fs.existsSync(sessionDir)) {
      try {
        fs.rmSync(sessionDir, { recursive: true, force: true });
        console.log(`[WhatsApp] Removed session folder for ${phone}`);
      } catch (err) {
        console.error(`[WhatsApp] Failed to delete session folder for ${phone}:`, err);
      }
    }
  }

  private async destroyClient(phone: string) {
    const client = this.clients.get(phone);
    if (client) {
      this.clients.delete(phone);
      try {
        await client.destroy();
      } catch (e) {
        console.error(`[WhatsApp] Error destroying client ${phone}:`, e);
      }
    }
  }
}

export const wsManager = new WhatsAppManager();
export default wsManager;
