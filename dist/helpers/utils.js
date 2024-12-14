"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepare_response = exports.validateMobile = exports.validateEmail = void 0;
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
};
exports.validateEmail = validateEmail;
const validateMobile = (mobile) => {
    return String(mobile)
        .toLowerCase()
        .match(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/);
};
exports.validateMobile = validateMobile;
const prepare_response = (message, data = {}) => {
    return { message, data };
};
exports.prepare_response = prepare_response;
//# sourceMappingURL=utils.js.map