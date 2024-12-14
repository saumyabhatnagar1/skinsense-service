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
const postgresql_1 = __importDefault(require("./postgresql"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield postgresql_1.default.query("create table users if not exists users (id serial primary key, name varchar(255), mobile varchar(255), email varchar(255), password_digest text, authentication token");
    }
    catch (e) {
        console.log(e);
    }
}))();
//# sourceMappingURL=seed.js.map