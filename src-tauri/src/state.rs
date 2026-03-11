use std::collections::HashMap;
use std::sync::RwLock;

use crate::database::Database;

/// Lightweight Meilisearch client wrapping reqwest for REST API calls.
#[derive(Clone)]
pub struct MeiliClient {
    pub url: String,
    pub api_key: Option<String>,
    pub http: reqwest::Client,
}

impl MeiliClient {
    pub fn new(url: &str, api_key: Option<&str>) -> Self {
        Self {
            url: url.trim_end_matches('/').to_string(),
            api_key: api_key.map(|s| s.to_string()),
            http: reqwest::Client::new(),
        }
    }

    /// Build a GET request with authorization header.
    pub fn get(&self, path: &str) -> reqwest::RequestBuilder {
        let mut req = self.http.get(format!("{}{}", self.url, path));
        if let Some(ref key) = self.api_key {
            req = req.header("Authorization", format!("Bearer {}", key));
        }
        req
    }

    /// Build a POST request with authorization header.
    pub fn post(&self, path: &str) -> reqwest::RequestBuilder {
        let mut req = self.http.post(format!("{}{}", self.url, path));
        if let Some(ref key) = self.api_key {
            req = req.header("Authorization", format!("Bearer {}", key));
        }
        req
    }

    /// Build a PUT request with authorization header.
    pub fn put(&self, path: &str) -> reqwest::RequestBuilder {
        let mut req = self.http.put(format!("{}{}", self.url, path));
        if let Some(ref key) = self.api_key {
            req = req.header("Authorization", format!("Bearer {}", key));
        }
        req
    }

    /// Build a PATCH request with authorization header.
    pub fn patch(&self, path: &str) -> reqwest::RequestBuilder {
        let mut req = self.http.patch(format!("{}{}", self.url, path));
        if let Some(ref key) = self.api_key {
            req = req.header("Authorization", format!("Bearer {}", key));
        }
        req
    }

    /// Build a DELETE request with authorization header.
    pub fn delete(&self, path: &str) -> reqwest::RequestBuilder {
        let mut req = self.http.delete(format!("{}{}", self.url, path));
        if let Some(ref key) = self.api_key {
            req = req.header("Authorization", format!("Bearer {}", key));
        }
        req
    }
}

pub struct AppState {
    pub db: Database,
    pub clients: RwLock<HashMap<i64, MeiliClient>>,
}

impl AppState {
    pub fn new(db: Database) -> Self {
        Self {
            db,
            clients: RwLock::new(HashMap::new()),
        }
    }

    pub fn get_or_create_client(
        &self,
        project_id: i64,
        url: &str,
        api_key: Option<&str>,
    ) -> MeiliClient {
        {
            let clients = self.clients.read().unwrap();
            if let Some(client) = clients.get(&project_id) {
                // Check if url or api_key has changed
                let cached_key = client.api_key.as_deref();
                if client.url == url && cached_key == api_key {
                    return client.clone();
                }
                // URL or API key changed, need to recreate client
                log::info!("Client config changed for project {}, recreating client", project_id);
            }
        }

        let client = MeiliClient::new(url, api_key);
        let mut clients = self.clients.write().unwrap();
        clients.insert(project_id, client.clone());
        client
    }

    pub fn invalidate_client(&self, project_id: i64) {
        let mut clients = self.clients.write().unwrap();
        clients.remove(&project_id);
    }
}
