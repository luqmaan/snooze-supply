const express = require("express");
const next = require("next");
var bodyParser = require("body-parser");
require("dotenv").config();

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const DEBUG = false;
let PGP_OPTIONS = {};
if (DEBUG) {
  const monitor = require("pg-monitor");
  PGP_OPTIONS = {
    query(e) {
      monitor.query(e);
    },
    error(err, e) {
      monitor.error(err, e);
    }
  };
}
const pgp = require('pg-promise')(PGP_OPTIONS);

const db = pgp({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

app.prepare().then(() => {
  const server = express();

  server.use(bodyParser.json());

  server.post(`/waitlist`, async (req, res) => {
    try {
      const { email, phone, plan } = req.body;

      await db.one(
        `INSERT INTO waitlist(
           email,
           phone,
           plan
         )
         VALUES(
           \${email},
           \${phone},
           \${plan}
         )
         RETURNING *;
       `,
        {
          email,
          phone,
          plan
        }
      );
      res.send({
        success: true
      });
    } catch (err) {
      console.error(err);
      res.send({ error: err.message });
    }
  });

  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
