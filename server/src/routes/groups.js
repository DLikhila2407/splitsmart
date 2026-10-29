import { Router } from "express";
import auth from "../middleware/auth.js";
import Group from "../models/Group.js";
import User from "../models/User.js";
import Expense from "../models/Expense.js";
import Settlement from "../models/Settlement.js";
import { calculateBalances, suggestSettlements } from "../utils/balances.js";
const router = Router();
router.use(auth);

router.get("/", async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.userId }).populate("members", "name email").sort({ updatedAt: -1 });
    res.json({ groups });
  } catch (e) { next(e); }
});

router.post("/", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) return res.status(400).json({ message: "Group name is required." });
    const group = await Group.create({ name, createdBy: req.userId, members: [req.userId] });
    res.status(201).json({ group: await group.populate("members", "name email") });
  } catch (e) { next(e); }
});

router.post("/:id/members", async (req, res, next) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, members: req.userId });
    if (!group) return res.status(404).json({ message: "Group not found." });
    const email = String(req.body.email || "").trim().toLowerCase();
    const member = await User.findOne({ email }).select("_id name email");
    if (!member) return res.status(404).json({ message: "No account found for that email. Ask them to register first." });
    if (!group.members.some(id => String(id) === String(member._id))) group.members.push(member._id);
    await group.save();
    res.json({ group: await group.populate("members", "name email") });
  } catch (e) { next(e); }
});

router.get("/:id/summary", async (req, res, next) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, members: req.userId }).populate("members", "name email");
    if (!group) return res.status(404).json({ message: "Group not found." });
    const [expenses, settlements] = await Promise.all([
      Expense.find({ group: group._id }).populate("paidBy", "name email").populate("splits.user", "name email").sort({ createdAt: -1 }),
      Settlement.find({ group: group._id }).populate("from to", "name email").sort({ createdAt: -1 })
    ]);
    const balances = calculateBalances(group.members, expenses, settlements);
    res.json({ group, expenses, settlements, balances, suggestions: suggestSettlements(balances) });
  } catch (e) { next(e); }
});
export default router;
