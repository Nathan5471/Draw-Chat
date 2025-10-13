import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRouter";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    credentials: true,
  },
});

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
