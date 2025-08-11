require("dotenv").config();
import morgan from "morgan";
import express, { Request, Response } from "express";
import postgres from "./db/postgresql";
import userRouter from "./routes/users";
import slotsRouter from "./routes/slot_booking";
import ErrorHandler from "./middlewares/Errorhandler";
import cors from "cors";

const app = express();
const port: number | string = process.env.PORT || 3000;

const corsOptions = {
  origin: "*",
};

app.use(express.json());
app.use(morgan("dev"));
app.use("/user", userRouter);
app.use("/slots", slotsRouter);
app.use(ErrorHandler);
app.use(cors(corsOptions));

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
