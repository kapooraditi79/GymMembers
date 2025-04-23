const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "kapooraditi79",
  database: "gymsysdb",
});

module.exports = pool;
