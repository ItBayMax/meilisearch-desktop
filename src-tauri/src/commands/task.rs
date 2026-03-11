use serde_json::Value;
use tauri::State;

use crate::services::meilisearch_service;
use crate::state::AppState;

#[tauri::command]
pub async fn get_tasks(
    state: State<'_, AppState>,
    project_id: i64,
    params: Option<Value>,
) -> Result<Value, String> {
    meilisearch_service::get_tasks(&state, project_id, params)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_task(
    state: State<'_, AppState>,
    project_id: i64,
    task_uid: u64,
) -> Result<Value, String> {
    meilisearch_service::get_task(&state, project_id, task_uid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn cancel_tasks(
    state: State<'_, AppState>,
    project_id: i64,
    filters: Value,
) -> Result<Value, String> {
    log::info!("Canceling tasks for project {}: filters={}", project_id, filters);
    let result = meilisearch_service::cancel_tasks(&state, project_id, filters)
        .await
        .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("Tasks canceled for project {}", project_id),
        Err(e) => log::error!("Failed to cancel tasks for project {}: {}", project_id, e),
    }
    result
}

#[tauri::command]
pub async fn delete_tasks(
    state: State<'_, AppState>,
    project_id: i64,
    filters: Value,
) -> Result<Value, String> {
    log::info!("Deleting tasks for project {}: filters={}", project_id, filters);
    let result = meilisearch_service::delete_tasks(&state, project_id, filters)
        .await
        .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("Tasks deleted for project {}", project_id),
        Err(e) => log::error!("Failed to delete tasks for project {}: {}", project_id, e),
    }
    result
}

#[tauri::command]
pub async fn wait_for_task(
    state: State<'_, AppState>,
    project_id: i64,
    task_uid: u64,
    timeout: Option<u64>,
) -> Result<Value, String> {
    meilisearch_service::wait_for_task(&state, project_id, task_uid, timeout)
        .await
        .map_err(|e| e.to_string())
}
