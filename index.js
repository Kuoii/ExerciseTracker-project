const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const sqlite = require("better-sqlite3");
const db = new sqlite("exercises.db");
const bodyParser = require("body-parser");
const crypto = require("crypto");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/users", (req, res) => {
    const query = db.prepare("SELECT username, user_id as _id FROM users");
    const users = query.all();
    res.send(users);
});
app.post("/api/users", (req, res) => {
    const { username } = req.body;
    const id = crypto.randomBytes(12).toString("hex");
    const queryValues = { id, username };
    const query = db.prepare(
        "INSERT INTO users (user_id, username) VALUES (@id, @username) RETURNING username, user_id as _id"
    );
    const postedQuery = query.get(queryValues);
    res.json(postedQuery);
});

app.get("/api/users/:_id/logs/:limit?", (req, res) => {
    const usernameQuery = db.prepare(
        "SELECT username FROM users WHERE user_id = @_id"
    );
    const query = db.prepare(
        "SELECT description, duration, date FROM exercises WHERE user_id = @_id" // LIMIT @limit"
    );
    const exercises = query.all(req.params);
    const count = exercises.length;

    res.json({
        ...usernameQuery.get(req.params),
        count: count,
        _id: req.params._id,
        log: exercises,
    });
});
app.get("/api/users/:_id/logs/:from/:to/:limit?", (req, res) => {
    const usernameQuery = db.prepare(
        "SELECT username FROM users WHERE user_id = @_id"
    );
    const query = db.prepare(
        "SELECT description, duration, date FROM exercises WHERE user_id = @_id AND date BETWEEN @from AND @to LIMIT @limit"
    );
    const exercises = query.all(req.params);
    const count = exercises.length;

    console.log(req.params.from, req.params.to);
    res.json({
        ...usernameQuery.get(req.params),
        count: count,
        _id: req.params._id,
        log: exercises,
    });
});
app.post("/api/users/:_id/exercises", (req, res) => {
    console.log(req.body);
    const { description, duration, date } = req.body;
    const _id = req.params._id;
    const queryValues = {
        _id,
        description,
        duration,
        date: date || new Date().toISOString().split("T")[0],
    };
    const query = db.prepare(
        "INSERT INTO exercises (user_id, description, duration, date) VALUES (@_id, @description, @duration, @date) RETURNING description, duration, date, user_id as _id"
    );
    const usernameQuery = db.prepare(
        "SELECT username FROM users WHERE user_id = @_id"
    );
    const postedQuery = query.get(queryValues);
    const resObject = {
        username: usernameQuery.get(req.params).username,
        ...postedQuery,
    };
    console.log(usernameQuery.get(req.params));
    res.json(resObject);
});

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
});
