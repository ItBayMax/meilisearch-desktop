use serde_json::Value;
use tauri::State;

use crate::services::meilisearch_service;
use crate::state::AppState;

#[tauri::command]
pub async fn get_documents(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    offset: Option<usize>,
    limit: Option<usize>,
    fields: Option<Vec<String>>,
) -> Result<Value, String> {
    meilisearch_service::get_documents(
        &state,
        project_id,
        &uid,
        offset.unwrap_or(0),
        limit.unwrap_or(20),
        fields,
    )
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_document(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    doc_id: String,
) -> Result<Value, String> {
    meilisearch_service::get_document(&state, project_id, &uid, &doc_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn add_documents(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    documents_json: String,
    primary_key: Option<String>,
) -> Result<Value, String> {
    log::info!("Adding documents: project_id={}, index={}, primary_key={:?}, payload_size={}", project_id, uid, primary_key, documents_json.len());
    let result = meilisearch_service::add_documents(
        &state,
        project_id,
        &uid,
        &documents_json,
        primary_key.as_deref(),
    )
    .await
    .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("Documents added to index '{}' of project {}", uid, project_id),
        Err(e) => log::error!("Failed to add documents to index '{}' of project {}: {}", uid, project_id, e),
    }
    result
}

#[tauri::command]
pub async fn upload_documents_file(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    file_path: String,
    primary_key: Option<String>,
) -> Result<Value, String> {
    log::info!("Uploading documents file: project_id={}, index={}, file={}, primary_key={:?}", project_id, uid, file_path, primary_key);
    let result = meilisearch_service::upload_documents_file(
        &state,
        project_id,
        &uid,
        &file_path,
        primary_key.as_deref(),
    )
    .await
    .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("Documents file '{}' uploaded to index '{}' of project {}", file_path, uid, project_id),
        Err(e) => log::error!("Failed to upload file '{}' to index '{}' of project {}: {}", file_path, uid, project_id, e),
    }
    result
}

#[tauri::command]
pub async fn fetch_documents_from_url(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    url: String,
    field_path: Option<String>,
    primary_key: Option<String>,
    headers: Option<std::collections::HashMap<String, String>>,
) -> Result<Value, String> {
    log::info!("Fetching documents from URL: project_id={}, index={}, url={}, field_path={:?}", project_id, uid, url, field_path);
    let result = meilisearch_service::fetch_documents_from_url(
        &state,
        project_id,
        &uid,
        &url,
        field_path.as_deref(),
        primary_key.as_deref(),
        headers,
    )
    .await
    .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("Documents fetched from URL '{}' to index '{}' of project {}", url, uid, project_id),
        Err(e) => log::error!("Failed to fetch documents from URL '{}' to index '{}' of project {}: {}", url, uid, project_id, e),
    }
    result
}

#[tauri::command]
pub async fn delete_document(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    doc_id: String,
) -> Result<Value, String> {
    log::info!("Deleting document: project_id={}, index={}, doc_id={}", project_id, uid, doc_id);
    let result = meilisearch_service::delete_document(&state, project_id, &uid, &doc_id)
        .await
        .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("Document '{}' deleted from index '{}' of project {}", doc_id, uid, project_id),
        Err(e) => log::error!("Failed to delete document '{}' from index '{}' of project {}: {}", doc_id, uid, project_id, e),
    }
    result
}

#[tauri::command]
pub async fn delete_documents(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    ids: Option<Vec<String>>,
) -> Result<Value, String> {
    log::info!("Deleting documents: project_id={}, index={}, ids={:?}", project_id, uid, ids.as_ref().map(|v| v.len()));
    let result = meilisearch_service::delete_documents(&state, project_id, &uid, ids)
        .await
        .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("Documents deleted from index '{}' of project {}", uid, project_id),
        Err(e) => log::error!("Failed to delete documents from index '{}' of project {}: {}", uid, project_id, e),
    }
    result
}
