import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import db from "../db/postgresql";
import { prepare_response } from "../helpers/utils";

export const auth = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).send(prepare_response("unauthorized"));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user_id = decoded._id;

    const user_data = await db.query(
      "select * from users where authentication_token = $1 and id = $2",
      [token, user_id]
    );
    if (user_data.rowCount == 0) {
      return res.status(401).send(prepare_response("unauthorized"));
    }
    req.token = req;
    req.user = user_data.rows[0];
    next();
  } catch (e) {
    res.status(401).send(prepare_response("unauthorized"));
  }
};
