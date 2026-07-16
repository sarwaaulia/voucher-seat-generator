import "dotenv/config";
import { app } from "./app";
import http from "http"

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`backend listening on port ${PORT}`)
})