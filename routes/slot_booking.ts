import { NextFunction, Router, Request, Response, json } from "express";
import { auth } from "../middlewares/auth";
import db from "../db/postgresql";
import { prepare_response } from "../helpers/utils";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { create_notification } from "../routes/notifications";

dayjs.extend(customParseFormat);

const router = Router();

router.get(
  "/",
  auth,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { is_approved } = req.query;
      const values = [];
      const conditions = [];

      if (is_approved) {
        values.push(is_approved);
        conditions.push(`approved = $${values.length}`);
      }
      let query = "select * from slots join users on users.id = slots.user_id";
      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }
      const rows = await db.query(query, values);
      return res.status(200).json({ data: rows.rows });
    } catch (e) {
      return next(e);
    }
  }
);

router.post(
  "/book-slot",
  auth,
  async (req: any, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { datetime, reason, type } = req.body.data;
      const parsed = dayjs(datetime, "DD-MM-YYYY hh:mm A", true);
      const jsDate = parsed.toDate();
      const alreadyExisting = await db.query(
        "select * from slots where slot_date = $1 and is_active = $2",
        [jsDate, true]
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
        "insert into slots (slot_date, is_active, is_expired, reason, visited, user_id, type) values ($1, $2, $3, $4, $5, $6, $7) returning *",
        [jsDate, true, false, reason, false, user_id, type]
      );
      await create_notification(
        "Slot Booked",
        "Your slot has been booked successfully",
        user_id
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
      const { slot_id, status, new_time } = req.body;
      const values = [];
      const conditions = [];

      const slot = await db.query("select * from slots where slot_id = $1", [
        slot_id,
      ]);
      if (slot.rowCount == 0) {
        return res.status(400).send(prepare_response("slot not found"));
      }
      const user_id = slot.rows[0].user_id;

      if (status == "approved") {
        values.push(true);
        conditions.push(`approved = $${values.length}`);
      } else if (status == "rejected") {
        values.push(false);
        conditions.push(`approved = $${values.length}`);
      } else if (status == "shifted") {
        const new_slot = dayjs(new_time, "hh:mm A");

        if (!new_slot.isValid()) {
          return res
            .status(400)
            .send(prepare_response("invalid datetime format"));
        }
        values.push(new_slot.toDate());
        conditions.push(`slot_date = $${values.length}`);
      } else {
        return res.status(400).send(prepare_response("invalid status"));
      }
      values.push(slot_id);
      const whereCondition = `slot_id = $${values.length}`;

      let query = `update slots set ${conditions.join(
        ", "
      )} where ${whereCondition}`;
      const result = await db.query(query, values);
      if (status == "rejected") {
        await create_notification(
          "Slot Rejected",
          "Your slot has been rejected",
          user_id
        );
      } else if (status == "approved") {
        await create_notification(
          "Slot Approved",
          "Your slot has been approved",
          user_id
        );
      } else if (status == "shifted") {
        await create_notification(
          "Slot Shifted",
          "Your slot has been shifted to a new time: " + new_time,
          user_id
        );
      }
      return res
        .status(200)
        .send(prepare_response(`slot ${status} successfully`, result.rows[0]));
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/mark-unavailable",
  auth,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { datetime } = req.body;
      const parsed = dayjs(datetime, "YYYY-MM-DD hh:mm A");
      if (!parsed.isValid()) {
        return res
          .status(400)
          .send(prepare_response("invalid datetime format"));
      }
      const result = await db.query(
        "insert into unavailable_slots (unavailable_slot) values ($1) returning *",
        [parsed.toDate()]
      );
      if (result.rowCount == 1) {
        return res
          .status(200)
          .send(prepare_response("unavailable slot marked", result.rows[0]));
      } else {
        return res
          .status(400)
          .send(prepare_response("failed to mark unavailable slot"));
      }
    } catch (e) {
      next(e);
    }
  }
);

export default router;
