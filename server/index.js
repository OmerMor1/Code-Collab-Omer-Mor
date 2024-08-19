import express from "express";
import connectDB from "./dbConnection.js";
import codeBlockRoute from "./routes/codeBlock.route.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import usersSocket from "./sockets/usersSocket.js";
import complierRoute from "./routes/compiler.route.js";

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(cors());
app.use(express.json());

connectDB();
app.use("/api/codeblocks", codeBlockRoute);
app.use("/api/compiler", complierRoute);

io.on("connection", (socket) => {
  usersSocket(io, socket);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
