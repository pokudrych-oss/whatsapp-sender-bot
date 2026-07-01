import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// GET all templates
router.get("/", async (req, res) => {
  try {
    const templates = await prisma.template.findMany();
    const mapped = templates.map((t) => ({
      id: t.id,
      name: t.name,
      body: t.body,
      variables: JSON.parse(t.variables || "[]")
    }));
    res.json(mapped);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST create template
router.post("/", async (req, res) => {
  const { name, body, variables } = req.body;
  if (!name || !body) {
    return res.status(400).json({ error: "Name and body are required" });
  }

  try {
    const template = await prisma.template.create({
      data: {
        name,
        body,
        variables: Array.isArray(variables) ? JSON.stringify(variables) : "[]"
      }
    });

    res.status(201).json({
      id: template.id,
      name: template.name,
      body: template.body,
      variables: JSON.parse(template.variables)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update template
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, body, variables } = req.body;

  try {
    const updated = await prisma.template.update({
      where: { id },
      data: {
        name,
        body,
        variables: Array.isArray(variables) ? JSON.stringify(variables) : undefined
      }
    });

    res.json({
      id: updated.id,
      name: updated.name,
      body: updated.body,
      variables: JSON.parse(updated.variables)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE template
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.template.delete({ where: { id } });
    res.json({ message: "Template deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
