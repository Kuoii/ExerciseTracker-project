const Database = require("better-sqlite3");
const db = new Database("exercises.db");

db.prepare(
    "CREATE TABLE IF NOT EXISTS users (user_id TEXT PRIMARY KEY, username TEXT NOT NULL)"
).run();
db.prepare(
    "CREATE TABLE IF NOT EXISTS exercises (id INTEGER PRIMARY KEY, user_id TEXT, description TEXT NOT NULL, duration INTEGER NOT NULL, date DATE, FOREIGN KEY(user_id) REFERENCES users(user_id))"
).run();
