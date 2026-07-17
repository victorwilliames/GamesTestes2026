import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";

const port = Number(process.env.PORT || 2567);
const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.send("Arena Server is running!");
});

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

gameServer.listen(port).then(() => {
  console.log(`[Arena Server] Listening on http://localhost:${port}`);
}).catch((err) => {
  console.error("Failed to start server:", err);
});
