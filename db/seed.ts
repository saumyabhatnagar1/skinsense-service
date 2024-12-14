import db from "./postgresql";

(async () => {
  try {
    const res = await db.query(
      "create table users if not exists users (id serial primary key, name varchar(255), mobile varchar(255), email varchar(255), password_digest text, authentication token"
    );
  } catch (e) {
    console.log(e);
  }
})();
