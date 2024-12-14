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
const router = (0, express_1.Router)();
/**
 * Gets all users
 */
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rows = yield postgresql_1.default.query("select * from users;");
        console.log(rows.rows[0]);
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
        console.log({ user });
        if (user.rowCount > 0) {
            return res.status(400).json((0, utils_1.prepare_response)("user already exists"));
        }
        //generating user token
        const token = jsonwebtoken_1.default.sign({
            _id: 1,
        }, "JQT_SECRET", { expiresIn: "7 days" });
        const password_digest = yield bcryptjs_1.default.hash(password, 8);
        const result = yield postgresql_1.default.query("insert into users (name, password_digest, mobile, authentication_token) values ($1, $2, $3, $4) returning *", [name, password_digest, mobile, token]);
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
    console.log(userData);
    if (userData.rowCount == 0) {
        //   return next({ statusCode: 400, message: "User does not exists" });
    }
    const isMatch = yield bcryptjs_1.default.compare(password, userData.rows[0].password_digest);
    // if (!isMatch) return next({ statusCode: 400, message: "invalid password" });
    const user_id = userData.rows[0].id;
    //generating user token
    const token = jsonwebtoken_1.default.sign({
        _id: user_id,
    }, "JQT_SECRET", { expiresIn: "7 days" });
    try {
        const update = yield postgresql_1.default.query("update users set authentication_token = $1 where id = $2", [token, user_id]);
    }
    catch (e) {
        console.log(e);
    }
    // console.log(token, update.rows[0]);
    return res.sendStatus(200).json((0, utils_1.prepare_response)("logged in", token));
}));
exports.default = router;
//# sourceMappingURL=users.js.map