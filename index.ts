require("dotenv").config();
import morgan from "morgan";
import express, { Request, Response } from "express";
import postgres from "./db/postgresql";
import userRouter from "./routes/users";
import ErrorHandler from "./middlewares/Errorhandler";

const app = express();
const port: number | string = process.env.PORT || 3000;

app.use(express.json());
app.use(morgan("dev"));
app.use("/user", userRouter);
app.use(ErrorHandler);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
