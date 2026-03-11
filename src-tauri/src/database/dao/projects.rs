use rusqlite::{params, Connection};

use crate::error::{AppError, AppResult};
use crate::models::project::Project;

pub fn get_all(conn: &Connection, include_inactive: bool) -> AppResult<Vec<Project>> {
    let sql = if include_inactive {
        "SELECT id, name, url, api_key, description, is_active, created_at, updated_at FROM projects ORDER BY id DESC"
    } else {
        "SELECT id, name, url, api_key, description, is_active, created_at, updated_at FROM projects WHERE is_active = 1 ORDER BY id DESC"
    };

    let mut stmt = conn.prepare(sql)?;
    let projects = stmt
        .query_map([], |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                url: row.get(2)?,
                api_key: row.get(3)?,
                description: row.get(4)?,
                is_active: row.get::<_, i32>(5)? != 0,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;

    Ok(projects)
}

pub fn get_by_id(conn: &Connection, id: i64) -> AppResult<Project> {
    conn.query_row(
        "SELECT id, name, url, api_key, description, is_active, created_at, updated_at FROM projects WHERE id = ?1",
        [id],
        |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                url: row.get(2)?,
                api_key: row.get(3)?,
                description: row.get(4)?,
                is_active: row.get::<_, i32>(5)? != 0,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        },
    )
    .map_err(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => {
            AppError::NotFound(format!("Project with id {} not found", id))
        }
        _ => AppError::Database(e.to_string()),
    })
}

pub fn create(
    conn: &Connection,
    name: &str,
    url: &str,
    api_key: Option<&str>,
    description: Option<&str>,
) -> AppResult<Project> {
    conn.execute(
        "INSERT INTO projects (name, url, api_key, description) VALUES (?1, ?2, ?3, ?4)",
        params![name, url, api_key, description],
    )?;

    let id = conn.last_insert_rowid();
    get_by_id(conn, id)
}

pub fn update(
    conn: &Connection,
    id: i64,
    name: Option<&str>,
    url: Option<&str>,
    api_key: Option<&str>,
    description: Option<&str>,
) -> AppResult<Project> {
    let current = get_by_id(conn, id)?;

    let new_name = name.unwrap_or(&current.name);
    let new_url = url.unwrap_or(&current.url);
    // Use api_key as-is if provided (including empty string), otherwise keep current
    let new_api_key = api_key.map(Some).unwrap_or(current.api_key.as_deref());
    let new_description = description.or(current.description.as_deref());

    conn.execute(
        "UPDATE projects SET name = ?1, url = ?2, api_key = ?3, description = ?4, updated_at = datetime('now') WHERE id = ?5",
        params![new_name, new_url, new_api_key, new_description, id],
    )?;

    get_by_id(conn, id)
}

pub fn soft_delete(conn: &Connection, id: i64) -> AppResult<()> {
    let rows = conn.execute(
        "UPDATE projects SET is_active = 0, updated_at = datetime('now') WHERE id = ?1",
        [id],
    )?;

    if rows == 0 {
        return Err(AppError::NotFound(format!(
            "Project with id {} not found",
            id
        )));
    }
    Ok(())
}

pub fn hard_delete(conn: &Connection, id: i64) -> AppResult<()> {
    let rows = conn.execute("DELETE FROM projects WHERE id = ?1", [id])?;

    if rows == 0 {
        return Err(AppError::NotFound(format!(
            "Project with id {} not found",
            id
        )));
    }
    Ok(())
}
