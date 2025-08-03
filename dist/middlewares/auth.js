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
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const postgresql_1 = __importDefault(require("../db/postgresql"));
const utils_1 = require("../helpers/utils");
const auth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).send((0, utils_1.prepare_response)("unauthorized"));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user_id = decoded._id;
        const user_data = yield postgresql_1.default.query("select * from users where authentication_token = $1 and id = $2", [token, user_id]);
        if (user_data.rowCount == 0) {
            return res.status(401).send((0, utils_1.prepare_response)("unauthorized"));
        }
        req.token = req;
        req.user = user_data.rows[0];
        next();
    }
    catch (e) {
        res.status(401).send((0, utils_1.prepare_response)("unauthorized"));
    }
});
exports.auth = auth;
//# sourceMappingURL=auth.js.map