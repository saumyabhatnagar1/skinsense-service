import { Router, NextFunction, Request, Response } from "express";
import { auth } from "../middlewares/auth";
import db from "../db/postgresql";
import { prepare_response } from "../helpers/utils";

const router = Router();

router.get("/", auth, async (req: any, res: Response, next: NextFunction) => {
  try {
    const user_id = req.user.id;
    const notifications = await db.query(
      "SELECT * FROM notifications WHERE user_id = $1",
      [user_id]
    );
    res
      .status(200)
      .send(prepare_response("notifications fetched", { data: notifications }));
  } catch (e) {
    next(e);
  }
});

router.post(
  "/create-notification",
  auth,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { title, body } = req.body;
      const user_id = req.user.id;
      const response = await db.query(
        `insert into notifications (title, body, user_id, created) values ($1, $2, $3, $4) returning *`,
        [title, body, user_id, new Date()]
      );
      if (response.rowCount == 1) {
        return res
          .status(200)
          .send(prepare_response("notification created", response.rows[0]));
      }
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/mark-as-read",
  auth,
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const { notification_id } = req.body;
      const user_id = req.user.id;
      const response = await db.query(
        `update notifications set is_read = true where id = $1 and user_id = $2`,
        [notification_id, user_id]
      );
      if (response.rowCount == 1) {
        return res
          .status(200)
          .send(
            prepare_response("notification marked as read", response.rows[0])
          );
      }
    } catch (e) {
      next(e);
    }
  }
);

export const create_notification = async (
  title: string,
  body: string,
  user_id: number
) => {
  const response = await db.query(
    `insert into notifications (title, body, user_id, created) values ($1, $2, $3, $4) returning *`,
    [title, body, user_id, new Date()]
  );
  return response.rows[0];
};

export default router;
