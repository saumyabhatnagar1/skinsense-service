import { NextFunction, Router, Request, Response, json } from "express";
import { auth } from "../middlewares/auth";
import db from "../db/postgresql";
import { prepare_response } from "../helpers/utils";
import dayjs from "dayjs";

const router = Router();

router.get(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const rows = await db.query("select * from slots");
      return res.status(200).json({ data: rows.rows });
    } catch (e) {
      return next(e);
    }
  }
);

router.post(
  "/",
  auth,
  async (req: any, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { datetime, reason, type } = req.body;
      const dateObject = dayjs(datetime, "dd-mm-yyyy hh:mm:ss");
      const alreadyExisting = await db.query(
        "select * from slots where slot_date = $1 and is_active = $2",
        [dateObject, true]
      );
      if (alreadyExisting.rowCount > 0) {
        return res
          .status(400)
          .send(
            prepare_response(
              "The slot timing is already booked. Please select another slot"
            )
          );
      }
      const user_id = req.user.id;
      const result = await db.query(
        "insert into slots (slot_date, is_active, is_expired, reason, visited, user_id) values ($1, $2, $3, $4, $5, $6, $7) returning *",
        [dateObject, true, false, reason, false, user_id, type]
      );
      return res
        .status(200)
        .send(prepare_response("slot booked", result.rows[0]));
    } catch (e) {
      return next(e);
    }
  }
);

router.post(
  "/update-slot",
  auth,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { slot_id, status } = req.body;
      let approved;
      if (status == "approved") {
        approved = true;
      } else if (status == "rejected") {
        approved = false;
      } else {
        return res.status(400).send(prepare_response("invalid status"));
      }
      const result = await db.query(
        "update slots set approved = $1 where slot_id = $2 returning *",
        [approved, slot_id]
      );
      return res
        .status(200)
        .send(prepare_response(`slot ${status} successfully`, result.rows[0]));
    } catch (e) {
      next(e);
    }
  }
);

export default router;
