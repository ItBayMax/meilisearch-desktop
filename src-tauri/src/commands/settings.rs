use serde_json::Value;
use tauri::State;

use crate::services::meilisearch_service;
use crate::state::AppState;

#[tauri::command]
pub async fn get_settings(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_settings(&state, project_id, &uid)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_settings(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    settings: Value,
) -> Result<Value, String> {
    log::info!("Updating all settings: project_id={}, index={}", project_id, uid);
    let result = meilisearch_service::update_settings(&state, project_id, &uid, settings)
        .await
        .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("Settings updated for index '{}' of project {}", uid, project_id),
        Err(e) => log::error!("Failed to update settings for index '{}' of project {}: {}", uid, project_id, e),
    }
    result
}

#[tauri::command]
pub async fn reset_settings(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    log::info!("Resetting settings: project_id={}, index={}", project_id, uid);
    let result = meilisearch_service::reset_settings(&state, project_id, &uid)
        .await
        .map_err(|e| e.to_string());
    match &result {
        Ok(_) => log::info!("Settings reset for index '{}' of project {}", uid, project_id),
        Err(e) => log::error!("Failed to reset settings for index '{}' of project {}: {}", uid, project_id, e),
    }
    result
}

// Individual setting commands - using generic helper

#[tauri::command]
pub async fn get_searchable_attributes(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_setting(&state, project_id, &uid, "searchable-attributes")
        .await
        .map_err(|e| e.to_string())
}

// Individual setting update commands - with logging

#[tauri::command]
pub async fn update_searchable_attributes(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    attributes: Value,
) -> Result<Value, String> {
    log::info!("Updating searchable-attributes: project_id={}, index={}", project_id, uid);
    meilisearch_service::update_setting(&state, project_id, &uid, "searchable-attributes", attributes)
        .await
        .map_err(|e| { log::error!("Failed to update searchable-attributes for index '{}': {}", uid, e); e.to_string() })
}

#[tauri::command]
pub async fn get_displayed_attributes(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_setting(&state, project_id, &uid, "displayed-attributes")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_displayed_attributes(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    attributes: Value,
) -> Result<Value, String> {
    log::info!("Updating displayed-attributes: project_id={}, index={}", project_id, uid);
    meilisearch_service::update_setting(&state, project_id, &uid, "displayed-attributes", attributes)
        .await
        .map_err(|e| { log::error!("Failed to update displayed-attributes for index '{}': {}", uid, e); e.to_string() })
}

#[tauri::command]
pub async fn get_filterable_attributes(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_setting(&state, project_id, &uid, "filterable-attributes")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_filterable_attributes(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    attributes: Value,
) -> Result<Value, String> {
    log::info!("Updating filterable-attributes: project_id={}, index={}", project_id, uid);
    meilisearch_service::update_setting(&state, project_id, &uid, "filterable-attributes", attributes)
        .await
        .map_err(|e| { log::error!("Failed to update filterable-attributes for index '{}': {}", uid, e); e.to_string() })
}

#[tauri::command]
pub async fn get_sortable_attributes(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_setting(&state, project_id, &uid, "sortable-attributes")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_sortable_attributes(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    attributes: Value,
) -> Result<Value, String> {
    log::info!("Updating sortable-attributes: project_id={}, index={}", project_id, uid);
    meilisearch_service::update_setting(&state, project_id, &uid, "sortable-attributes", attributes)
        .await
        .map_err(|e| { log::error!("Failed to update sortable-attributes for index '{}': {}", uid, e); e.to_string() })
}

#[tauri::command]
pub async fn get_ranking_rules(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_setting(&state, project_id, &uid, "ranking-rules")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_ranking_rules(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    rules: Value,
) -> Result<Value, String> {
    log::info!("Updating ranking-rules: project_id={}, index={}", project_id, uid);
    meilisearch_service::update_setting(&state, project_id, &uid, "ranking-rules", rules)
        .await
        .map_err(|e| { log::error!("Failed to update ranking-rules for index '{}': {}", uid, e); e.to_string() })
}

#[tauri::command]
pub async fn get_synonyms(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_setting(&state, project_id, &uid, "synonyms")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_synonyms(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    synonyms: Value,
) -> Result<Value, String> {
    log::info!("Updating synonyms: project_id={}, index={}", project_id, uid);
    meilisearch_service::update_setting(&state, project_id, &uid, "synonyms", synonyms)
        .await
        .map_err(|e| { log::error!("Failed to update synonyms for index '{}': {}", uid, e); e.to_string() })
}

#[tauri::command]
pub async fn get_stop_words(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_setting(&state, project_id, &uid, "stop-words")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_stop_words(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    words: Value,
) -> Result<Value, String> {
    log::info!("Updating stop-words: project_id={}, index={}", project_id, uid);
    meilisearch_service::update_setting(&state, project_id, &uid, "stop-words", words)
        .await
        .map_err(|e| { log::error!("Failed to update stop-words for index '{}': {}", uid, e); e.to_string() })
}

#[tauri::command]
pub async fn get_typo_tolerance(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_setting(&state, project_id, &uid, "typo-tolerance")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_typo_tolerance(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    settings: Value,
) -> Result<Value, String> {
    log::info!("Updating typo-tolerance: project_id={}, index={}", project_id, uid);
    meilisearch_service::update_setting(&state, project_id, &uid, "typo-tolerance", settings)
        .await
        .map_err(|e| { log::error!("Failed to update typo-tolerance for index '{}': {}", uid, e); e.to_string() })
}

#[tauri::command]
pub async fn get_pagination_settings(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_setting(&state, project_id, &uid, "pagination")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_pagination_settings(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    settings: Value,
) -> Result<Value, String> {
    log::info!("Updating pagination: project_id={}, index={}", project_id, uid);
    meilisearch_service::update_setting(&state, project_id, &uid, "pagination", settings)
        .await
        .map_err(|e| { log::error!("Failed to update pagination for index '{}': {}", uid, e); e.to_string() })
}

#[tauri::command]
pub async fn get_faceting(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_setting(&state, project_id, &uid, "faceting")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_faceting(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    settings: Value,
) -> Result<Value, String> {
    log::info!("Updating faceting: project_id={}, index={}", project_id, uid);
    meilisearch_service::update_setting(&state, project_id, &uid, "faceting", settings)
        .await
        .map_err(|e| { log::error!("Failed to update faceting for index '{}': {}", uid, e); e.to_string() })
}

#[tauri::command]
pub async fn get_dictionary(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_setting(&state, project_id, &uid, "dictionary")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_dictionary(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    words: Value,
) -> Result<Value, String> {
    log::info!("Updating dictionary: project_id={}, index={}", project_id, uid);
    meilisearch_service::update_setting(&state, project_id, &uid, "dictionary", words)
        .await
        .map_err(|e| { log::error!("Failed to update dictionary for index '{}': {}", uid, e); e.to_string() })
}

#[tauri::command]
pub async fn get_separator_tokens(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_setting(&state, project_id, &uid, "separator-tokens")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_separator_tokens(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    tokens: Value,
) -> Result<Value, String> {
    log::info!("Updating separator-tokens: project_id={}, index={}", project_id, uid);
    meilisearch_service::update_setting(&state, project_id, &uid, "separator-tokens", tokens)
        .await
        .map_err(|e| { log::error!("Failed to update separator-tokens for index '{}': {}", uid, e); e.to_string() })
}

#[tauri::command]
pub async fn get_search_cutoff_ms(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_setting(&state, project_id, &uid, "search-cutoff-ms")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_search_cutoff_ms(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    value: Value,
) -> Result<Value, String> {
    log::info!("Updating search-cutoff-ms: project_id={}, index={}", project_id, uid);
    meilisearch_service::update_setting(&state, project_id, &uid, "search-cutoff-ms", value)
        .await
        .map_err(|e| { log::error!("Failed to update search-cutoff-ms for index '{}': {}", uid, e); e.to_string() })
}

#[tauri::command]
pub async fn get_prefix_search(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
) -> Result<Value, String> {
    meilisearch_service::get_setting(&state, project_id, &uid, "prefix-search")
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_prefix_search(
    state: State<'_, AppState>,
    project_id: i64,
    uid: String,
    value: Value,
) -> Result<Value, String> {
    log::info!("Updating prefix-search: project_id={}, index={}", project_id, uid);
    meilisearch_service::update_setting(&state, project_id, &uid, "prefix-search", value)
        .await
        .map_err(|e| { log::error!("Failed to update prefix-search for index '{}': {}", uid, e); e.to_string() })
}
