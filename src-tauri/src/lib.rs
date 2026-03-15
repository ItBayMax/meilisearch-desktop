mod commands;
mod database;
mod error;
mod models;
mod services;
mod state;
mod tray;

use database::Database;
use state::AppState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("meilisearch-desktop".to_string()),
                    },
                ))
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stdout,
                ))
                .level(log::LevelFilter::Info)
                .level_for("reqwest", log::LevelFilter::Warn)
                .level_for("tao", log::LevelFilter::Warn)
                .level_for("wry", log::LevelFilter::Warn)
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .setup(|app| {
            log::info!("Starting Meilisearch Desktop application...");

            // Initialize database
            let app_data_dir = app.path().app_data_dir()?;
            log::info!("App data directory: {:?}", app_data_dir);

            let db_path = app_data_dir.join("meilisearch-desktop.db");
            log::info!("Database path: {:?}", db_path);

            let db = match Database::new(db_path) {
                Ok(db) => {
                    log::info!("Database initialized successfully");
                    db
                }
                Err(e) => {
                    log::error!("Failed to initialize database: {:?}", e);
                    return Err(e.into());
                }
            };
            let app_state = AppState::new(db);
            app.manage(app_state);

            // Create system tray
            log::info!("Creating system tray...");
            match tray::create_tray(app) {
                Ok(_) => log::info!("System tray created successfully"),
                Err(e) => {
                    log::error!("Failed to create system tray: {:?}", e);
                    // Don't fail if tray creation fails, just log the error
                }
            }

            // Show window after setup
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                log::info!("Main window shown");
            } else {
                log::warn!("Main window not found");
            }

            log::info!("Application setup completed successfully");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Project commands
            commands::project::get_projects,
            commands::project::get_project,
            commands::project::create_project,
            commands::project::update_project,
            commands::project::delete_project,
            commands::project::test_connection,
            commands::project::get_project_stats,
            commands::project::get_experimental_features,
            commands::project::update_experimental_features,
            // Index commands
            commands::index_cmd::get_indexes,
            commands::index_cmd::get_index,
            commands::index_cmd::create_index,
            commands::index_cmd::delete_index,
            commands::index_cmd::get_index_stats,
            // Document commands
            commands::document::get_documents,
            commands::document::get_document,
            commands::document::add_documents,
            commands::document::upload_documents_file,
            commands::document::fetch_documents_from_url,
            commands::document::delete_document,
            commands::document::delete_documents,
            // Search commands
            commands::search::search_documents,
            // Settings commands
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::settings::reset_settings,
            commands::settings::get_searchable_attributes,
            commands::settings::update_searchable_attributes,
            commands::settings::get_displayed_attributes,
            commands::settings::update_displayed_attributes,
            commands::settings::get_filterable_attributes,
            commands::settings::update_filterable_attributes,
            commands::settings::get_sortable_attributes,
            commands::settings::update_sortable_attributes,
            commands::settings::get_ranking_rules,
            commands::settings::update_ranking_rules,
            commands::settings::get_synonyms,
            commands::settings::update_synonyms,
            commands::settings::get_stop_words,
            commands::settings::update_stop_words,
            commands::settings::get_typo_tolerance,
            commands::settings::update_typo_tolerance,
            commands::settings::get_pagination_settings,
            commands::settings::update_pagination_settings,
            commands::settings::get_faceting,
            commands::settings::update_faceting,
            commands::settings::get_dictionary,
            commands::settings::update_dictionary,
            commands::settings::get_separator_tokens,
            commands::settings::update_separator_tokens,
            commands::settings::get_search_cutoff_ms,
            commands::settings::update_search_cutoff_ms,
            commands::settings::get_prefix_search,
            commands::settings::update_prefix_search,
            // Task commands
            commands::task::get_tasks,
            commands::task::get_task,
            commands::task::cancel_tasks,
            commands::task::delete_tasks,
            commands::task::wait_for_task,
            // Key commands
            commands::key::get_keys,
            commands::key::get_key,
            commands::key::create_key,
            commands::key::update_key,
            commands::key::delete_key,
            // Utility commands
            commands::utils::write_text_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
