"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postgresql_1 = __importDefault(require("../db/postgresql"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../helpers/utils");
const auth_1 = require("../middlewares/auth");
const axios_1 = __importDefault(require("axios"));
const router = (0, express_1.Router)();
/**
 * Gets all users
 */
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rows = yield postgresql_1.default.query("select * from users;");
        return res.status(200).json({ data: rows });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: JSON.stringify(err) });
    }
}));
router.post("/signup", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const mobile = req.body.mobile;
    const password = req.body.password;
    const name = req.body.name;
    if (!(0, utils_1.validateMobile)(mobile)) {
        return res.status(400).json((0, utils_1.prepare_response)("invalid mobile number"));
    }
    if (password.length < 8) {
        return res
            .status(400)
            .json((0, utils_1.prepare_response)("password cannot be less than 8 chars"));
    }
    try {
        const user = yield postgresql_1.default.query("select id from users where mobile = $1", [
            mobile,
        ]);
        if (user.rowCount > 0) {
            return res
                .status(400)
                .json((0, utils_1.prepare_response)("user with this mobile number already exists"));
        }
        //generating user token
        const password_digest = yield bcryptjs_1.default.hash(password, 8);
        const result = yield postgresql_1.default.query("insert into users (name, password_digest, mobile, authentication_token) values ($1, $2, $3) returning *", [name, password_digest, mobile]);
        return res
            .status(200)
            .send((0, utils_1.prepare_response)("user registered", result.rows[0]));
    }
    catch (err) {
        return next(err);
    }
}));
router.post("/login", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const mobile = req.body.mobile;
    const password = req.body.password;
    const userData = yield postgresql_1.default.query("select id, password_digest from users where mobile =  $1", [mobile]);
    if (userData.rowCount == 0) {
        return next({ statusCode: 400, message: "User does not exists" });
    }
    const isMatch = yield bcryptjs_1.default.compare(password, userData.rows[0].password_digest);
    if (!isMatch)
        return next({ statusCode: 400, message: "invalid password" });
    const user_id = userData.rows[0].id;
    //generating user token
    let token = jsonwebtoken_1.default.sign({
        _id: user_id,
    }, process.env.JWT_SECRET, { expiresIn: "7 days" });
    try {
        const update = yield postgresql_1.default.query("update users set authentication_token = $1 where id = $2", [token, user_id]);
    }
    catch (e) {
        next(e);
    }
    res.status(200).json((0, utils_1.prepare_response)("logged in", token));
}));
router.post("/send-otp", auth_1.auth, (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mobileNumber = request.body.mobile_number;
        const otp = Math.floor(100000 + Math.random() * 900000);
        const userData = yield postgresql_1.default.query("select id from users where mobile = $1", [mobileNumber]);
        if (userData.rowCount == 0) {
            return response
                .status(400)
                .json((0, utils_1.prepare_response)("no user associated with this mobile number"));
        }
        const userId = userData.rows[0].id;
        const sendOtpResponse = yield send_otp_helper(mobileNumber, otp);
        if (!sendOtpResponse) {
            return response.status(400).json((0, utils_1.prepare_response)("error sending OTP"));
        }
        yield postgresql_1.default.query("update users set otp = $1 where id = $2", [otp, userId]);
        return response
            .status(200)
            .send((0, utils_1.prepare_response)("OTP successfully sent"));
    }
    catch (e) {
        next(e);
    }
}));
const send_otp_helper = (mobileNumber, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield axios_1.default.get("https://www.fast2sms.com/dev/bulkV2", {
            params: {
                authorization: process.env.FAST_2_SUM_KEY,
                variable_values: `Your OTP for logging into SkinSense is ${otp}`,
                route: "otp",
                numbers: mobileNumber,
            },
        });
        return true;
    }
    catch (_a) {
        return false;
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map