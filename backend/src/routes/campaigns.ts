import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// GET all campaigns
router.get("/", async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" }
    });

    const mapped = campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      phone: JSON.parse(c.phones || "[]"),
      message: c.message,
      group: c.groupName,
      groupId: c.groupId,
      nextAction: c.nextAction,
      nextActionTime: c.nextActionTime,
      sent: c.sent,
      pending: c.pending,
      failed: c.failed,
      isPaused: c.isPaused,
      minInterval: c.minInterval,
      maxInterval: c.maxInterval,
      sendFrom: c.sendFrom,
      sendTo: c.sendTo,
      status: c.status
    }));

    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST create campaign
router.post("/", async (req, res) => {
  const {
    name,
    phones, // Array of sender phone numbers
    message,
    groupId, // Target subgroup ID
    minInterval,
    maxInterval,
    sendFrom,
    sendTo
  } = req.body;

  if (!name || !phones || !Array.isArray(phones) || !message || !groupId) {
    return res.status(400).json({ error: "Missing required fields (name, phones, message, groupId)" });
  }

  try {
    // 1. Verify subgroup exists and load contacts
    const subGroup = await prisma.subGroup.findUnique({
      where: { id: groupId },
      include: { contacts: true }
    });

    if (!subGroup) {
      return res.status(404).json({ error: "Subgroup not found" });
    }

    const contacts = subGroup.contacts;
    if (contacts.length === 0) {
      return res.status(400).json({ error: "Subgroup contains no contacts" });
    }

    // 2. Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        name,
        phones: JSON.stringify(phones),
        message,
        groupName: subGroup.name,
        groupId,
        minInterval: parseInt(minInterval) || 600,
        maxInterval: parseInt(maxInterval) || 1200,
        sendFrom: sendFrom || "08:00",
        sendTo: sendTo || "20:00",
        sent: 0,
        pending: contacts.length,
        failed: 0,
        isPaused: true,
        status: "DRAFT"
      }
    });

    // 3. Create Campaign Recipient entries
    const recipientData = contacts.map((c) => ({
      campaignId: campaign.id,
      contactId: c.id,
      status: "PENDING"
    }));

    await prisma.campaignRecipient.createMany({
      data: recipientData
    });

    res.status(201).json({
      id: campaign.id,
      name: campaign.name,
      phone: phones,
      message: campaign.message,
      group: campaign.groupName,
      groupId: campaign.groupId,
      nextAction: campaign.nextAction,
      nextActionTime: campaign.nextActionTime,
      sent: campaign.sent,
      pending: campaign.pending,
      failed: campaign.failed,
      isPaused: campaign.isPaused,
      status: campaign.status
    });
  } catch (err: any) {
    console.error("Error creating campaign:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST start campaign
router.post("/:id/start", async (req, res) => {
  const { id } = req.params;
  try {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.pending <= 0) {
      return res.status(400).json({ error: "No pending contacts to send to" });
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        isPaused: false,
        status: "RUNNING",
        nextAction: new Date() // Trigger immediately
      }
    });

    res.json({ message: "Campaign started", status: updated.status, isPaused: updated.isPaused });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST pause campaign
router.post("/:id/pause", async (req, res) => {
  const { id } = req.params;
  try {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        isPaused: true,
        status: "PAUSED"
      }
    });

    res.json({ message: "Campaign paused", status: updated.status, isPaused: updated.isPaused });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE campaign
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.campaign.delete({ where: { id } });
    res.json({ message: "Campaign deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
