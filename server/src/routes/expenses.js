import { Router } from "express";
import auth from "../middleware/auth.js";
import Group from "../models/Group.js";
import Expense from "../models/Expense.js";
const router = Router();
router.use(auth);

router.post("/", async (req, res, next) => {
  try {
    const { groupId, description, amount, paidBy, splitType = "equal", customSplits } = req.body;
    const group = await Group.findOne({ _id: groupId, members: req.userId });
    if (!group) return res.status(404).json({ message: "Group not found." });
    const value = Math.round(Number(amount) * 100) / 100;
    const label = String(description || "").trim();
    if (!label || !Number.isFinite(value) || value <= 0) return res.status(400).json({ message: "Enter a description and a positive amount." });
    const payerId = String(paidBy || req.userId);
    if (!group.members.some(m => String(m) === payerId)) return res.status(400).json({ message: "Payer must be a group member." });
    let splits;
    if (splitType === "custom") {
      if (!Array.isArray(customSplits) || customSplits.length !== group.members.length) return res.status(400).json({ message: "Provide a custom share for every group member." });
      splits = customSplits.map(s => ({ user: s.user, amount: Math.round(Number(s.amount) * 100) / 100 }));
      const sum = splits.reduce((a, s) => a + s.amount, 0);
      if (splits.some(s => !group.members.some(m => String(m) === String(s.user)) || !Number.isFinite(s.amount) || s.amount < 0) || Math.abs(sum - value) > 0.01)
        return res.status(400).json({ message: "Custom shares must be valid and add up to the expense total." });
    } else {
      const cents = Math.round(value * 100), base = Math.floor(cents / group.members.length);
      let remainder = cents - base * group.members.length;
      splits = group.members.map(user => {
        const share = base + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
        return { user, amount: share / 100 };
      });
    }
    const expense = await Expense.create({ group: group._id, description: label, amount: value, paidBy: payerId, splits, createdBy: req.userId });
    res.status(201).json({ expense: await expense.populate("paidBy splits.user", "name email") });
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found." });
    const group = await Group.findOne({ _id: expense.group, members: req.userId });
    if (!group) return res.status(403).json({ message: "You cannot access this expense." });
    if (String(expense.createdBy) !== String(req.userId) && String(group.createdBy) !== String(req.userId))
      return res.status(403).json({ message: "Only the creator or group owner can delete this expense." });
    await expense.deleteOne();
    res.json({ message: "Expense deleted." });
  } catch (e) { next(e); }
});
export default router;
