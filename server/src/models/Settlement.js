import mongoose from "mongoose";
const settlementSchema = new mongoose.Schema({
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true, min: 0.01 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  note: { type: String, trim: true, maxlength: 140, default: "" }
}, { timestamps: true });
export default mongoose.model("Settlement", settlementSchema);
