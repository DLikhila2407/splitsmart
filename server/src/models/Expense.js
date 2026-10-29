import mongoose from "mongoose";
const splitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 0 }
}, { _id: false });
const expenseSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  description: { type: String, required: true, trim: true, maxlength: 140 },
  amount: { type: Number, required: true, min: 0.01 },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  splits: { type: [splitSchema], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
export default mongoose.model("Expense", expenseSchema);
