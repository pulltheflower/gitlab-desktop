// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
struct GitLabConfig {
    url: String,
    token: String,
}

#[tauri::command]
async fn save_gitlab_config(
    app_handle: tauri::AppHandle,
    config: GitLabConfig,
) -> Result<(), String> {
    let app_dir = app_handle
        .path_resolver()
        .app_config_dir()
        .ok_or("Failed to get app config directory")?;

    fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;

    let config_path = app_dir.join("gitlab_config.json");
    let config_json = serde_json::to_string(&config).map_err(|e| e.to_string())?;
    fs::write(config_path, config_json).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn load_gitlab_config(app_handle: tauri::AppHandle) -> Result<GitLabConfig, String> {
    let app_dir = app_handle
        .path_resolver()
        .app_config_dir()
        .ok_or("Failed to get app config directory")?;

    let config_path = app_dir.join("gitlab_config.json");
    let config_json = fs::read_to_string(config_path).map_err(|e| e.to_string())?;
    let config: GitLabConfig = serde_json::from_str(&config_json).map_err(|e| e.to_string())?;

    Ok(config)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_gitlab_config, load_gitlab_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
