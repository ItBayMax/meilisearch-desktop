use serde_json::Value;

use crate::error::{AppError, AppResult};
use crate::state::{AppState, MeiliClient};

/// Helper: get a MeiliClient for a given project
fn get_client(state: &AppState, project_id: i64) -> AppResult<MeiliClient> {
    let project = {
        let conn = state.db.conn.lock().unwrap();
        crate::database::dao::projects::get_by_id(&conn, project_id)?
    };
    Ok(state.get_or_create_client(project_id, &project.url, project.api_key.as_deref()))
}

// ===== Health & Stats =====

pub async fn test_connection(url: &str, api_key: Option<&str>) -> AppResult<Value> {
    let client = MeiliClient::new(url, api_key);

    // First check if server is reachable via health endpoint
    let health_response = client
        .get("/health")
        .send()
        .await?;
    
    if !health_response.status().is_success() {
        return Err(AppError::Network(format!(
            "Server unreachable, status: {}",
            health_response.status()
        )));
    }
    
    let health: Value = health_response.json().await?;

    // Verify API key by calling an authenticated endpoint (/stats)
    // /stats requires valid API key and returns useful info
    let stats_response = client
        .get("/stats")
        .send()
        .await?;
    
    if !stats_response.status().is_success() {
        let status = stats_response.status();
        let error_body: Value = stats_response.json().await.unwrap_or_default();
        let error_msg = error_body.get("message")
            .and_then(|m| m.as_str())
            .unwrap_or("Invalid API key or insufficient permissions");
        return Err(AppError::Meilisearch(format!(
            "API key validation failed ({}): {}",
            status, error_msg
        )));
    }

    // Get version info
    let version_response = client
        .get("/version")
        .send()
        .await?;
    
    if !version_response.status().is_success() {
        return Err(AppError::Meilisearch("Failed to get version info".to_string()));
    }
    
    let version: Value = version_response.json().await?;
    let pkg_version = version.get("pkgVersion").and_then(|s| s.as_str());
    
    // Validate version is not empty/unknown
    match pkg_version {
        Some(v) if !v.is_empty() && v != "unknown" => {
            Ok(serde_json::json!({
                "success": true,
                "status": health.get("status").and_then(|s| s.as_str()).unwrap_or("unknown"),
                "version": v,
            }))
        }
        _ => {
            Err(AppError::Meilisearch("Invalid version returned from server".to_string()))
        }
    }
}


pub async fn get_stats(state: &AppState, project_id: i64) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let stats: Value = client
        .get("/stats")
        .send()
        .await?
        .json()
        .await?;
    Ok(stats)
}

pub async fn get_experimental_features(state: &AppState, project_id: i64) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .get("/experimental-features")
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn update_experimental_features(
    state: &AppState,
    project_id: i64,
    features: Value,
) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .patch("/experimental-features")
        .json(&features)
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

// ===== Indexes =====

pub async fn get_indexes(state: &AppState, project_id: i64) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    
    let resp = client
        .get("/indexes?limit=1000")
        .send()
        .await?;
    
    let status = resp.status();
    
    if !status.is_success() {
        let text = resp.text().await?;
        log::error!("Get indexes failed: {} - {}", status, text);
        return Err(AppError::Meilisearch(format!("HTTP {}: {}", status, text)));
    }
    
    let body: Value = resp.json().await?;
    Ok(body)
}

pub async fn get_index(state: &AppState, project_id: i64, uid: &str) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .get(&format!("/indexes/{}", uid))
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn create_index(
    state: &AppState,
    project_id: i64,
    uid: &str,
    primary_key: Option<&str>,
) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let mut payload = serde_json::json!({ "uid": uid });
    if let Some(pk) = primary_key {
        payload["primaryKey"] = Value::String(pk.to_string());
    }
    let body: Value = client
        .post("/indexes")
        .json(&payload)
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn delete_index(state: &AppState, project_id: i64, uid: &str) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .delete(&format!("/indexes/{}", uid))
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn get_index_stats(state: &AppState, project_id: i64, uid: &str) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .get(&format!("/indexes/{}/stats", uid))
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

// ===== Documents =====

pub async fn get_documents(
    state: &AppState,
    project_id: i64,
    uid: &str,
    offset: usize,
    limit: usize,
    fields: Option<Vec<String>>,
) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let mut path = format!("/indexes/{}/documents?offset={}&limit={}", uid, offset, limit);
    if let Some(ref f) = fields {
        path.push_str(&format!("&fields={}", f.join(",")));
    }
    let body: Value = client
        .get(&path)
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn get_document(
    state: &AppState,
    project_id: i64,
    uid: &str,
    doc_id: &str,
) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .get(&format!("/indexes/{}/documents/{}", uid, doc_id))
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn add_documents(
    state: &AppState,
    project_id: i64,
    uid: &str,
    documents_json: &str,
    primary_key: Option<&str>,
) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let mut path = format!("/indexes/{}/documents", uid);
    if let Some(pk) = primary_key {
        path.push_str(&format!("?primaryKey={}", pk));
    }
    let body: Value = client
        .post(&path)
        .header("Content-Type", "application/json")
        .body(documents_json.to_string())
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn upload_documents_file(
    state: &AppState,
    project_id: i64,
    uid: &str,
    file_path: &str,
    primary_key: Option<&str>,
) -> AppResult<Value> {
    let content = std::fs::read_to_string(file_path)?;

    // Detect if CSV by extension
    let is_csv = file_path.to_lowercase().ends_with(".csv");

    let json_content = if is_csv {
        // Parse CSV to JSON array
        let mut rdr = csv::Reader::from_reader(content.as_bytes());
        let headers = rdr.headers()?.clone();
        let mut records = Vec::new();
        for result in rdr.records() {
            let record = result?;
            let mut map = serde_json::Map::new();
            for (i, header) in headers.iter().enumerate() {
                if let Some(value) = record.get(i) {
                    // Try to parse as number or bool, fallback to string
                    if let Ok(n) = value.parse::<i64>() {
                        map.insert(header.to_string(), Value::from(n));
                    } else if let Ok(f) = value.parse::<f64>() {
                        map.insert(header.to_string(), Value::from(f));
                    } else if value == "true" || value == "false" {
                        map.insert(header.to_string(), Value::from(value == "true"));
                    } else {
                        map.insert(header.to_string(), Value::from(value));
                    }
                }
            }
            records.push(Value::Object(map));
        }
        serde_json::to_string(&records)?
    } else {
        // Validate JSON
        let _: Value = serde_json::from_str(&content)?;
        content
    };

    add_documents(state, project_id, uid, &json_content, primary_key).await
}

pub async fn fetch_documents_from_url(
    state: &AppState,
    project_id: i64,
    uid: &str,
    url: &str,
    field_path: Option<&str>,
    primary_key: Option<&str>,
    headers: Option<std::collections::HashMap<String, String>>,
) -> AppResult<Value> {
    let http_client = reqwest::Client::new();
    let mut request = http_client.get(url);

    if let Some(hdrs) = headers {
        for (key, value) in hdrs {
            request = request.header(&key, &value);
        }
    }

    let resp = request.send().await?;
    let mut body: Value = resp.json().await?;

    // Extract from nested field path if provided
    if let Some(path) = field_path {
        for part in path.split('.') {
            body = body
                .get(part)
                .cloned()
                .ok_or_else(|| {
                    AppError::Validation(format!("Field path '{}' not found in response", path))
                })?;
        }
    }

    let json_str = serde_json::to_string(&body)?;
    add_documents(state, project_id, uid, &json_str, primary_key).await
}

pub async fn delete_document(
    state: &AppState,
    project_id: i64,
    uid: &str,
    doc_id: &str,
) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .delete(&format!("/indexes/{}/documents/{}", uid, doc_id))
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn delete_documents(
    state: &AppState,
    project_id: i64,
    uid: &str,
    ids: Option<Vec<String>>,
) -> AppResult<Value> {
    let client = get_client(state, project_id)?;

    if let Some(doc_ids) = ids {
        let body: Value = client
            .post(&format!("/indexes/{}/documents/delete-batch", uid))
            .json(&doc_ids)
            .send()
            .await?
            .json()
            .await?;
        Ok(body)
    } else {
        let body: Value = client
            .delete(&format!("/indexes/{}/documents", uid))
            .send()
            .await?
            .json()
            .await?;
        Ok(body)
    }
}

// ===== Search =====

pub async fn search(
    state: &AppState,
    project_id: i64,
    uid: &str,
    params: Value,
) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .post(&format!("/indexes/{}/search", uid))
        .json(&params)
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

// ===== Settings =====

pub async fn get_settings(state: &AppState, project_id: i64, uid: &str) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .get(&format!("/indexes/{}/settings", uid))
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn update_settings(
    state: &AppState,
    project_id: i64,
    uid: &str,
    settings: Value,
) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .patch(&format!("/indexes/{}/settings", uid))
        .json(&settings)
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn reset_settings(state: &AppState, project_id: i64, uid: &str) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .delete(&format!("/indexes/{}/settings", uid))
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

/// Generic helper for individual setting endpoints (GET)
pub async fn get_setting(
    state: &AppState,
    project_id: i64,
    uid: &str,
    setting_name: &str,
) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .get(&format!("/indexes/{}/settings/{}", uid, setting_name))
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

/// Generic helper for individual setting endpoints (PUT)
pub async fn update_setting(
    state: &AppState,
    project_id: i64,
    uid: &str,
    setting_name: &str,
    value: Value,
) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .put(&format!("/indexes/{}/settings/{}", uid, setting_name))
        .json(&value)
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

// ===== Tasks =====

pub async fn get_tasks(state: &AppState, project_id: i64, params: Option<Value>) -> AppResult<Value> {
    let client = get_client(state, project_id)?;

    let mut path = "/tasks".to_string();
    if let Some(p) = params {
        let mut query_parts = Vec::new();
        if let Some(obj) = p.as_object() {
            for (key, val) in obj {
                match val {
                    Value::Array(arr) => {
                        let items: Vec<String> = arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string()).or_else(|| Some(v.to_string()))).collect();
                        if !items.is_empty() {
                            query_parts.push(format!("{}={}", key, items.join(",")));
                        }
                    }
                    Value::Number(n) => {
                        query_parts.push(format!("{}={}", key, n));
                    }
                    Value::String(s) => {
                        query_parts.push(format!("{}={}", key, s));
                    }
                    _ => {}
                }
            }
        }
        if !query_parts.is_empty() {
            path.push_str(&format!("?{}", query_parts.join("&")));
        }
    }

    let body: Value = client
        .get(&path)
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn get_task(state: &AppState, project_id: i64, task_uid: u64) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .get(&format!("/tasks/{}", task_uid))
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn cancel_tasks(state: &AppState, project_id: i64, filters: Value) -> AppResult<Value> {
    let client = get_client(state, project_id)?;

    let mut path = "/tasks/cancel".to_string();
    if let Some(obj) = filters.as_object() {
        let mut parts = Vec::new();
        for (key, val) in obj {
            if let Some(arr) = val.as_array() {
                let items: Vec<String> = arr.iter().filter_map(|v| v.as_str().map(String::from).or_else(|| Some(v.to_string()))).collect();
                parts.push(format!("{}={}", key, items.join(",")));
            }
        }
        if !parts.is_empty() {
            path.push_str(&format!("?{}", parts.join("&")));
        }
    }

    let body: Value = client
        .post(&path)
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn delete_tasks(state: &AppState, project_id: i64, filters: Value) -> AppResult<Value> {
    let client = get_client(state, project_id)?;

    let mut path = "/tasks".to_string();
    if let Some(obj) = filters.as_object() {
        let mut parts = Vec::new();
        for (key, val) in obj {
            if let Some(arr) = val.as_array() {
                let items: Vec<String> = arr.iter().filter_map(|v| v.as_str().map(String::from).or_else(|| Some(v.to_string()))).collect();
                parts.push(format!("{}={}", key, items.join(",")));
            }
        }
        if !parts.is_empty() {
            path.push_str(&format!("?{}", parts.join("&")));
        }
    }

    let body: Value = client
        .delete(&path)
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn wait_for_task(
    state: &AppState,
    project_id: i64,
    task_uid: u64,
    timeout: Option<u64>,
) -> AppResult<Value> {
    let timeout_ms = timeout.unwrap_or(30000);
    let start = std::time::Instant::now();

    loop {
        let task = get_task(state, project_id, task_uid).await?;
        if let Some(status) = task.get("status").and_then(|s| s.as_str()) {
            if status == "succeeded" || status == "failed" || status == "canceled" {
                return Ok(task);
            }
        }

        if start.elapsed().as_millis() as u64 > timeout_ms {
            return Ok(task);
        }

        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
    }
}

// ===== Keys =====

pub async fn get_keys(state: &AppState, project_id: i64) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .get("/keys")
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn get_key(state: &AppState, project_id: i64, key_id: &str) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .get(&format!("/keys/{}", key_id))
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn create_key(state: &AppState, project_id: i64, options: Value) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .post("/keys")
        .json(&options)
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn update_key(
    state: &AppState,
    project_id: i64,
    key_id: &str,
    options: Value,
) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let body: Value = client
        .patch(&format!("/keys/{}", key_id))
        .json(&options)
        .send()
        .await?
        .json()
        .await?;
    Ok(body)
}

pub async fn delete_key(state: &AppState, project_id: i64, key_id: &str) -> AppResult<Value> {
    let client = get_client(state, project_id)?;
    let resp = client
        .delete(&format!("/keys/{}", key_id))
        .send()
        .await?;

    if resp.status().is_success() {
        Ok(serde_json::json!({"deleted": true}))
    } else {
        let body: Value = resp.json().await?;
        Ok(body)
    }
}
