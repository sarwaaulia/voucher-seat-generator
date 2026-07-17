import "dotenv/config";
import express from "express"
import cors from "cors";

import voucherRoutes from "./routes/voucher.route";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandler";

const app = express()
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({origin: CORS_ORIGIN}));
app.use(express.json());

app.use("/api", voucherRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

app.listen(PORT, () => {
    console.log(`Backend is running on port: ${PORT}`);
    console.log(`CORS allowed on origin: ${CORS_ORIGIN}`)
})