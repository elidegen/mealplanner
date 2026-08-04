import { Router } from "express";
import type { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { isMember } from "../services/permissions";

export const tagsRouter = Router();

tagsRouter.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const homeId = Number(req.query.homeId);
  if (!homeId) return res.status(400).json({ error: "homeId is required" });
  if (!(await isMember(req.authData!.userId, homeId))) {
    return res.status(403).json({ error: "No access to this home" });
  }
  const tags = await prisma.tag.findMany({ where: { homeId } });
  res.json(tags);
});
