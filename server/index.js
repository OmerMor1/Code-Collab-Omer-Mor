import express from "express";
import connectDB from "./dbConnection.js";
import codeBlockRoute from "./routes/codeBlock.route.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

connectDB();
app.use("/api/codeblocks", codeBlockRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
