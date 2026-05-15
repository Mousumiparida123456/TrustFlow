import { pool } from "@workspace/db";

const queries = [
  `CREATE TABLE IF NOT EXISTS "tf_users" (
    "id" serial PRIMARY KEY,
    "username" text NOT NULL UNIQUE,
    "email" text NOT NULL UNIQUE,
    "password_hash" text NOT NULL,
    "trust_score" integer NOT NULL DEFAULT 15,
    "risk_level" text NOT NULL DEFAULT 'low',
    "is_active" boolean NOT NULL DEFAULT true,
    "login_attempts" integer NOT NULL DEFAULT 0,
    "flagged_transactions" integer NOT NULL DEFAULT 0,
    "location" text NOT NULL DEFAULT 'Unknown',
    "device" text NOT NULL DEFAULT 'Unknown',
    "device_fingerprint" text,
    "last_login" timestamp,
    "created_at" timestamp NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS "tf_sessions" (
    "id" serial PRIMARY KEY,
    "user_id" integer NOT NULL,
    "session_token" text NOT NULL UNIQUE,
    "trust_score" integer NOT NULL DEFAULT 15,
    "risk_level" text NOT NULL DEFAULT 'low',
    "ip_address" text NOT NULL DEFAULT '127.0.0.1',
    "location" text NOT NULL DEFAULT 'Unknown',
    "device" text NOT NULL DEFAULT 'Unknown',
    "device_fingerprint" text,
    "is_active" boolean NOT NULL DEFAULT true,
    "is_suspicious" boolean NOT NULL DEFAULT false,
    "otp_code" text,
    "otp_expiry" timestamp,
    "login_time" timestamp NOT NULL DEFAULT now(),
    "last_activity" timestamp NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS "tf_behavior_events" (
    "id" serial PRIMARY KEY,
    "session_id" integer NOT NULL,
    "user_id" integer NOT NULL,
    "event_type" text NOT NULL,
    "typing_speed" real,
    "keystroke_interval" real,
    "mouse_velocity" real,
    "click_count" integer,
    "scroll_speed" real,
    "page_x" real,
    "page_y" real,
    "timestamp" timestamp NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS "tf_transactions" (
    "id" serial PRIMARY KEY,
    "user_id" integer NOT NULL,
    "session_id" integer,
    "amount" real NOT NULL,
    "beneficiary" text NOT NULL,
    "transaction_type" text NOT NULL,
    "status" text NOT NULL DEFAULT 'completed',
    "risk_score" integer NOT NULL DEFAULT 0,
    "description" text,
    "timestamp" timestamp NOT NULL DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS "tf_alerts" (
    "id" serial PRIMARY KEY,
    "user_id" integer NOT NULL,
    "session_id" integer,
    "alert_type" text NOT NULL,
    "severity" text NOT NULL,
    "description" text NOT NULL,
    "is_resolved" boolean NOT NULL DEFAULT false,
    "metadata" jsonb DEFAULT '{}',
    "timestamp" timestamp NOT NULL DEFAULT now()
  );`
];

async function run() {
  console.log("Creating tables manually...");
  for (const query of queries) {
    console.log("Running query:", query.split("\n")[0] + "...");
    await pool.query(query);
  }
  console.log("Tables created successfully!");
  process.exit(0);
}

run().catch(err => {
  console.error("Error creating tables:", err);
  process.exit(1);
});
