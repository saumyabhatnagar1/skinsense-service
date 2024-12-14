import { Pool } from "pg";

const pool = new Pool({
  database: "dev_skinsense",
  user: "dev_saumya",
  password: "skinsense",
  host: "127.0.0.1",
  port: 5432,
});

export default pool;
