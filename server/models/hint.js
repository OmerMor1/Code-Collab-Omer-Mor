import mongoose from "mongoose";

const HintSchema = new mongoose.Schema({
  text: { type: String, required: true },
  codeBlock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CodeBlock",
    required: true,
  },
});

const Hint = mongoose.model("Hint", HintSchema);
export default Hint;
