use serde_json::Value;
use tauri::State;

use crate::services::meilisearch_service;
use crate::state::AppState;

#[tauri::command]
pub async fn get_keys(state: State<'_, AppState>, project_id: i64) -> Result<Value, String> {
    meilisearch_service::get_keys(&state, project_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_key(
    state: State<'_, AppState>,
    project_id: i64,
    key: String,
) -> Result<Value, String> {
    meilisearch_service::get_key(&state, project_id, &key)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_key(
    state: State<'_, AppState>,
    project_id: i64,
    options: Value,
) -> Result<Value, String> {
    log::info!("Creating API key for project {}", project_id);
    let result = meilisearch_service::create_key(&state, project_id, options)
        .await
        .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("API key created for project {}", project_id),
        Err(e) => log::error!("Failed to create API key for project {}: {}", project_id, e),
    }
    result
}

#[tauri::command]
pub async fn update_key(
    state: State<'_, AppState>,
    project_id: i64,
    key: String,
    options: Value,
) -> Result<Value, String> {
    log::info!("Updating API key for project {}: key={}", project_id, key);
    let result = meilisearch_service::update_key(&state, project_id, &key, options)
        .await
        .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("API key '{}' updated for project {}", key, project_id),
        Err(e) => log::error!("Failed to update API key '{}' for project {}: {}", key, project_id, e),
    }
    result
}

#[tauri::command]
pub async fn delete_key(
    state: State<'_, AppState>,
    project_id: i64,
    key: String,
) -> Result<Value, String> {
    log::info!("Deleting API key for project {}: key={}", project_id, key);
    let result = meilisearch_service::delete_key(&state, project_id, &key)
        .await
        .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("API key '{}' deleted from project {}", key, project_id),
        Err(e) => log::error!("Failed to delete API key '{}' from project {}: {}", key, project_id, e),
    }
    result
}
