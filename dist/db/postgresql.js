"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    database: "dev_skinsense",
    user: "dev_saumya",
    password: "skinsense",
    host: "127.0.0.1",
    port: 5432,
});
exports.default = pool;
//# sourceMappingURL=postgresql.js.map