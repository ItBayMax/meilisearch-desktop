use crate::database::dao::projects as project_dao;
use crate::error::{AppError, AppResult};
use crate::models::project::Project;
use crate::state::AppState;

pub fn get_all(state: &AppState, include_inactive: bool) -> AppResult<Vec<Project>> {
    let conn = state.db.conn.lock().unwrap();
    project_dao::get_all(&conn, include_inactive)
}

pub fn get_by_id(state: &AppState, id: i64) -> AppResult<Project> {
    let conn = state.db.conn.lock().unwrap();
    project_dao::get_by_id(&conn, id)
}

pub fn create(
    state: &AppState,
    name: &str,
    url: &str,
    api_key: Option<&str>,
    description: Option<&str>,
) -> AppResult<Project> {
    if name.trim().is_empty() {
        return Err(AppError::Validation("Project name cannot be empty".to_string()));
    }
    if url.trim().is_empty() {
        return Err(AppError::Validation("Project URL cannot be empty".to_string()));
    }

    let conn = state.db.conn.lock().unwrap();
    project_dao::create(&conn, name.trim(), url.trim(), api_key, description)
}

pub fn update(
    state: &AppState,
    id: i64,
    name: Option<&str>,
    url: Option<&str>,
    api_key: Option<&str>,
    description: Option<&str>,
) -> AppResult<Project> {
    let conn = state.db.conn.lock().unwrap();
    let project = project_dao::update(&conn, id, name, url, api_key, description)?;

    // Invalidate cached Meilisearch client if URL or API key changed
    if url.is_some() || api_key.is_some() {
        drop(conn);
        state.invalidate_client(id);
    }

    Ok(project)
}

pub fn delete(state: &AppState, id: i64, hard: bool) -> AppResult<()> {
    let conn = state.db.conn.lock().unwrap();
    if hard {
        project_dao::hard_delete(&conn, id)?;
    } else {
        project_dao::soft_delete(&conn, id)?;
    }
    drop(conn);
    state.invalidate_client(id);
    Ok(())
}
