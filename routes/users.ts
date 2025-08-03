import { Router, Request, Response, json, NextFunction } from "express";
import db from "../db/postgresql";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prepare_response, validateMobile } from "../helpers/utils";
import { auth } from "../middlewares/auth";
import axios from "axios";

const router = Router();

/**
 * Gets all users
 */
router.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const rows = await db.query("select * from users;");
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

      if (user.rowCount > 0) {
        return res
          .status(400)
          .json(
            prepare_response("user with this mobile number already exists")
          );
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

router.post(
  "/send-otp",
  auth,
  async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const mobileNumber = request.body.mobile_number;
      const otp = Math.floor(100000 + Math.random() * 900000);

      const userData = await db.query(
        "select id from users where mobile = $1",
        [mobileNumber]
      );
      if (userData.rowCount == 0) {
        return response
          .status(400)
          .json(prepare_response("no user associated with this mobile number"));
      }
      const userId = userData.rows[0].id;
      const sendOtpResponse = await send_otp_helper(mobileNumber, otp);
      if (!sendOtpResponse) {
        return response.status(400).json(prepare_response("error sending OTP"));
      }
      await db.query("update users set otp = $1 where id = $2", [otp, userId]);

      return response
        .status(200)
        .send(prepare_response("OTP successfully sent"));
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/update-additional-details",
  auth,
  async (req: any, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { age, gender, address } = req.body;
      const user_id = req.user.id;
      await db.query(
        "update slots set age = $1, address = $2, gender = $3 where user_id = $4",
        [age, address, gender, user_id]
      );
      return res
        .status(200)
        .send(prepare_response("user details updated successfully"));
    } catch (e) {
      return next(e);
    }
  }
);

const send_otp_helper = async (
  mobileNumber: string,
  otp: number
): Promise<boolean> => {
  try {
    await axios.get("https://www.fast2sms.com/dev/bulkV2", {
      params: {
        authorization: process.env.FAST_2_SUM_KEY,
        variable_values: `Your OTP for logging into SkinSense is ${otp}`,
        route: "otp",
        numbers: mobileNumber,
      },
    });
    return true;
  } catch {
    return false;
  }
};

export default router;
