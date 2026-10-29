import { Router } from "express";
import auth from "../middleware/auth.js";
import Group from "../models/Group.js";
import Settlement from "../models/Settlement.js";
const router = Router();
router.use(auth);
router.post("/", async (req, res, next) => {
  try {
    const { groupId, from, to, amount, note = "" } = req.body;
    const group = await Group.findOne({ _id: groupId, members: req.userId });
    if (!group) return res.status(404).json({ message: "Group not found." });
    const value = Math.round(Number(amount) * 100) / 100;
    if (!from || !to || String(from) === String(to) || !Number.isFinite(value) || value <= 0)
      return res.status(400).json({ message: "Choose two different members and a positive amount." });
    if (![from, to].every(id => group.members.some(m => String(m) === String(id))))
      return res.status(400).json({ message: "Both people must be group members." });
    const settlement = await Settlement.create({ group: group._id, from, to, amount: value, note: String(note).slice(0, 140), createdBy: req.userId });
    res.status(201).json({ settlement: await settlement.populate("from to", "name email") });
  } catch (e) { next(e); }
});
export default router;
