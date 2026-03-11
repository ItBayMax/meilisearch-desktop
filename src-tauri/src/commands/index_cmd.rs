use serde_json::Value;
use tauri::State;

use crate::services::meilisearch_service;
use crate::state::AppState;

#[tauri::command]
pub async fn get_indexes(state: State<'_, AppState>, project_id: i64) -> Result<Value, String> {
    meilisearch_service::get_indexes(&state, project_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_index(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_index(&state, project_id, &uid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_index(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    primary_key: Option<String>,
) -> Result<Value, String> {
    log::info!("Creating index: project_id={}, uid={}, primary_key={:?}", project_id, uid, primary_key);
    let result = meilisearch_service::create_index(&state, project_id, &uid, primary_key.as_deref())
        .await
        .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("Index '{}' created for project {}", uid, project_id),
        Err(e) => log::error!("Failed to create index '{}' for project {}: {}", uid, project_id, e),
    }
    result
}

#[tauri::command]
pub async fn delete_index(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    log::info!("Deleting index: project_id={}, uid={}", project_id, uid);
    let result = meilisearch_service::delete_index(&state, project_id, &uid)
        .await
        .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("Index '{}' deleted from project {}", uid, project_id),
        Err(e) => log::error!("Failed to delete index '{}' from project {}: {}", uid, project_id, e),
    }
    result
}

#[tauri::command]
pub async fn get_index_stats(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_index_stats(&state, project_id, &uid)
        .await
        .map_err(|e| e.to_string())
}
