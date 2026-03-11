use serde_json::Value;
use tauri::State;

use crate::models::project::Project;
use crate::services::{meilisearch_service, project_service};
use crate::state::AppState;

#[tauri::command]
pub fn get_projects(
    state: State<'_, AppState>,
    include_inactive: bool,
) -> Result<Vec<Project>, String> {
    project_service::get_all(&state, include_inactive).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_project(state: State<'_, AppState>, project_id: i64) -> Result<Project, String> {
    project_service::get_by_id(&state, project_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_project(
    state: State<'_, AppState>,
    name: String,
    url: String,
    api_key: Option<String>,
    description: Option<String>,
) -> Result<Project, String> {
    log::info!("Creating project: name={}, url={}", name, url);
    let result = project_service::create(
        &state,
        &name,
        &url,
        api_key.as_deref(),
        description.as_deref(),
    )
    .map_err(|e| e.to_string());
    match &result {
        Ok(p) => log::info!("Project created successfully: id={}", p.id),
        Err(e) => log::error!("Failed to create project: {}", e),
    }
    result
}

#[tauri::command]
pub fn update_project(
    state: State<'_, AppState>,
    project_id: i64,
    name: Option<String>,
    url: Option<String>,
    api_key: Option<String>,
    description: Option<String>,
) -> Result<Project, String> {
    log::info!("Updating project: id={}", project_id);
    
    // Invalidate client cache if url or api_key changed
    if url.is_some() || api_key.is_some() {
        state.invalidate_client(project_id);
        log::info!("Invalidated client cache for project {} due to connection config change", project_id);
    }
    
    let result = project_service::update(
        &state,
        project_id,
        name.as_deref(),
        url.as_deref(),
        api_key.as_deref(),
        description.as_deref(),
    )
    .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("Project {} updated successfully", project_id),
        Err(e) => log::error!("Failed to update project {}: {}", project_id, e),
    }
    result
}

#[tauri::command]
pub fn delete_project(
    state: State<'_, AppState>,
    project_id: i64,
    hard: bool,
) -> Result<(), String> {
    log::info!("Deleting project: id={}, hard={}", project_id, hard);
    let result = project_service::delete(&state, project_id, hard).map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("Project {} deleted successfully (hard={})", project_id, hard),
        Err(e) => log::error!("Failed to delete project {}: {}", project_id, e),
    }
    result
}

#[tauri::command]
pub async fn test_connection(url: String, api_key: Option<String>) -> Result<Value, String> {
    meilisearch_service::test_connection(&url, api_key.as_deref())
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_project_stats(
    state: State<'_, AppState>,
    project_id: i64,
) -> Result<Value, String> {
    meilisearch_service::get_stats(&state, project_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_experimental_features(
    state: State<'_, AppState>,
    project_id: i64,
) -> Result<Value, String> {
    meilisearch_service::get_experimental_features(&state, project_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_experimental_features(
    state: State<'_, AppState>,
    project_id: i64,
    features: Value,
) -> Result<Value, String> {
    log::info!("Updating experimental features for project {}", project_id);
    let result = meilisearch_service::update_experimental_features(&state, project_id, features)
        .await
        .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("Experimental features updated for project {}", project_id),
        Err(e) => log::error!("Failed to update experimental features for project {}: {}", project_id, e),
    }
    result
}
