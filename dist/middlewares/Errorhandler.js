"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorHandler = (err, req, res, next) => {
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || "Something went wrong";
    return res.status(errStatus).json({
        success: false,
        status: errStatus,
        message: errMsg,
        stack: (err === null || err === void 0 ? void 0 : err.stack) || {},
    });
};
exports.default = ErrorHandler;
//# sourceMappingURL=Errorhandler.js.map