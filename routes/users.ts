import { Router, Request, Response, json, NextFunction } from "express";
import db from "../db/postgresql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prepare_response, validateMobile } from "../helpers/utils";

const router = Router();

/**
 * Gets all users
 */
router.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const rows = await db.query("select * from users;");
    console.log(rows.rows[0]);
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: JSON.stringify(err) });
  }
});

router.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const mobile = req.body.mobile;
    const password: string = req.body.password;
    const name = req.body.name;

    if (!validateMobile(mobile)) {
      return res.status(400).json(prepare_response("invalid mobile number"));
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json(prepare_response("password cannot be less than 8 chars"));
    }

    try {
      const user = await db.query("select id from users where mobile = $1", [
        mobile,
      ]);
      console.log({ user });
      if (user.rowCount > 0) {
        return res.status(400).json(prepare_response("user already exists"));
      }

      //generating user token

      const password_digest = await bcrypt.hash(password, 8);
      const result = await db.query(
        "insert into users (name, password_digest, mobile, authentication_token) values ($1, $2, $3) returning *",
        [name, password_digest, mobile]
      );
      return res
        .status(200)
        .send(prepare_response("user registered", result.rows[0]));
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const mobile = req.body.mobile;
    const password = req.body.password;

    const userData = await db.query(
      "select id, password_digest from users where mobile =  $1",
      [mobile]
    );

    if (userData.rowCount == 0) {
      return next({ statusCode: 400, message: "User does not exists" });
    }
    const isMatch = await bcrypt.compare(
      password,
      userData.rows[0].password_digest
    );
    if (!isMatch) return next({ statusCode: 400, message: "invalid password" });
    const user_id = userData.rows[0].id;
    //generating user token
    let token: string = jwt.sign(
      {
        _id: user_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7 days" }
    );
    token = token.split(".")[0];
    try {
      const update = await db.query(
        "update users set authentication_token = $1 where id = $2",
        [token, user_id]
      );
    } catch (e) {
      next(e);
    }

    res.status(200).json(prepare_response("logged in", token));
  }
);

export default router;
