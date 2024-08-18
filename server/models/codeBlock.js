import mongoose from "mongoose";

const CodeBlockSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  solution: { type: String, required: true },
  short_id: { type: Number, required: true },
});

const CodeBlock = mongoose.model("CodeBlock", CodeBlockSchema);
export default CodeBlock;
