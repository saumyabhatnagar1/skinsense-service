"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("./routes/users"));
const Errorhandler_1 = __importDefault(require("./middlewares/Errorhandler"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use("/user", users_1.default);
app.use(Errorhandler_1.default);
app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map