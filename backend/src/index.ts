import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRouter";
import messageSocket from "./socket/messageSocket";

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

messageSocket(io);

app.use(express.static("public"));

app.use((req: any, res: any) => {
  res.sendFile("./public/index.html", { root: "." }, (error: any) => {
    if (error) {
      console.error("Error sending index.html:", error);
      res.status(500).send("Error loading index.html");
    }
  });
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
