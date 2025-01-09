
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

// Routes
import AuthRoute from './routes/AuthRoute.js';
import UserRoute from './routes/UserRoute.js';
import PostRoute from './routes/PostRoute.js';
import ChatRoute from './routes/ChatRoute.js';
import MessageRoute from './routes/MessageRoute.js';

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(express.json());
app.use(cors());

// Serve images inside the public folder
app.use(express.static('public'));
// Handle __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/public", express.static(path.join(__dirname, "public")));

// Database Connection
const PORT = process.env.PORT || 5000;
const CONNECTION = process.env.MONGODB_CONNECTION;

mongoose
  .connect(CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    const server = app.listen(PORT, () => console.log(`Listening at Port ${PORT}`));

    // Socket.IO Integration
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:3000", // Frontend URL
      },
    });

    let activeUsers = [];

    io.on("connection", (socket) => {
      console.log("New connection established:", socket.id);

      // Add new user
      socket.on("new-user-add", (newUserId) => {
        if (!activeUsers.some((user) => user.userId === newUserId)) {
          activeUsers.push({ userId: newUserId, socketId: socket.id });
          console.log("New User Connected", activeUsers);
        }
        io.emit("get-users", activeUsers);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
        console.log("User Disconnected", activeUsers);
        io.emit("get-users", activeUsers);
      });

      // Send message to a specific user
      socket.on("send-message", (data) => {
        const { receiverId } = data;
        const user = activeUsers.find((user) => user.userId === receiverId);
        console.log("Sending from socket to:", receiverId);
        console.log("Data:", data);
        if (user) {
          io.to(user.socketId).emit("receive-message", data);
        }
      });
    });
  })
  .catch((error) => console.log(`${error} did not connect`));

// Routes
app.use('/auth', AuthRoute);
app.use('/user', UserRoute);
app.use('/posts', PostRoute);
app.use('/chat', ChatRoute);
app.use('/message', MessageRoute);


