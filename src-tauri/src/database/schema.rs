use rusqlite::Connection;

use crate::error::AppResult;

const SCHEMA_VERSION: i32 = 1;

pub fn create_tables(conn: &Connection) -> AppResult<()> {
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS projects (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            url         TEXT    NOT NULL,
            api_key     TEXT,
            description TEXT,
            is_active   INTEGER NOT NULL DEFAULT 1,
            created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
            updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS app_settings (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        ",
    )?;

    // Initialize schema version if not present
    let count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM schema_version",
        [],
        |row| row.get(0),
    )?;

    if count == 0 {
        conn.execute(
            "INSERT INTO schema_version (version) VALUES (?1)",
            [SCHEMA_VERSION],
        )?;
    }

    Ok(())
}

pub fn apply_migrations(conn: &Connection) -> AppResult<()> {
    let current_version: i32 = conn.query_row(
        "SELECT version FROM schema_version LIMIT 1",
        [],
        |row| row.get(0),
    )?;

    if current_version < SCHEMA_VERSION {
        // Future migrations go here
        // if current_version < 2 { ... }

        conn.execute(
            "UPDATE schema_version SET version = ?1",
            [SCHEMA_VERSION],
        )?;
    }

    Ok(())
}
