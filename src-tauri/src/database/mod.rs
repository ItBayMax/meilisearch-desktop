pub mod dao;
pub mod schema;

use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;

use crate::error::AppResult;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(db_path: PathBuf) -> AppResult<Self> {
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let conn = Connection::open(&db_path).map_err(|e| {
            crate::error::AppError::Database(format!(
                "Failed to open database at {:?}: {}",
                db_path, e
            ))
        })?;

        conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")
            .map_err(|e| crate::error::AppError::Database(e.to_string()))?;

        let db = Self {
            conn: Mutex::new(conn),
        };

        db.init_schema()?;
        Ok(db)
    }

    fn init_schema(&self) -> AppResult<()> {
        let conn = self.conn.lock().unwrap();
        schema::create_tables(&conn)?;
        schema::apply_migrations(&conn)?;
        Ok(())
    }
}
