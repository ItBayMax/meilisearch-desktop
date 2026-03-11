use serde_json::Value;
use tauri::State;

use crate::services::meilisearch_service;
use crate::state::AppState;

#[tauri::command]
pub async fn search_documents(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    params: Value,
) -> Result<Value, String> {
    meilisearch_service::search(&state, project_id, &uid, params)
        .await
        .map_err(|e| e.to_string())
}
