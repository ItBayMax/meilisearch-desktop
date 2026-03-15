<a name="readme-top"></a>

<div align="center">
  <h1>Meilisearch Desktop</h1>

  <p align="center">
    <b>English</b> | <a href="README_zh.md">简体中文</a>
  </p>

  <p>
    A cross-platform desktop application for managing Meilisearch instances, built with Tauri 2 + React
  </p>

  <p>
    <a href="https://github.com/ItBayMax/meilisearch-desktop/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="License" />
    </a>
    <a href="https://tauri.app/">
      <img src="https://img.shields.io/badge/tauri-2.x-24C8D8.svg" alt="Tauri" />
    </a>
    <a href="https://react.dev/">
      <img src="https://img.shields.io/badge/react-18.x-61DAFB.svg" alt="React" />
    </a>
    <a href="https://www.rust-lang.org/">
      <img src="https://img.shields.io/badge/rust-1.70+-DEA584.svg" alt="Rust" />
    </a>
    <a href="https://www.meilisearch.com/">
      <img src="https://img.shields.io/badge/meilisearch-1.x-ff69b4.svg" alt="Meilisearch" />
    </a>
  </p>
</div>

## Table of Contents

- [About](#about)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Screenshots](#screenshots)
- [Related Projects](#related-projects)
- [Contributing](#contributing)

## About

**Meilisearch Desktop** is a cross-platform desktop client for managing Meilisearch search engine instances. Built on Tauri 2 (Rust backend) and React (TypeScript frontend), it offers a native desktop experience with local data persistence — no server deployment required.

### Why Meilisearch Desktop?

- **Native Desktop App**: Lightweight, fast startup, runs offline without a backend server
- **Cross-Platform**: Supports Windows, macOS, and Linux
- **Local Data Storage**: All project configurations stored locally via SQLite, no cloud dependency
- **Visual Management**: Intuitive UI for managing indexes, documents, and settings
- **Multi-Instance Support**: Manage multiple Meilisearch instances from a single application
- **Real-time Search Preview**: Test search queries with instant results and ranking scores
- **Complete Settings Control**: Configure all index settings through the interface

## Features

| Module | Description |
|--------|-------------|
| **Project Management** | Add and manage multiple Meilisearch instances with connection testing |
| **Index Management** | Create, configure, and delete indexes with full settings control |
| **Document Operations** | Add, edit, delete, and browse documents; supports JSON/CSV/NDJSON import |
| **Settings Configuration** | Attributes, ranking rules, synonyms, typo tolerance, embedders, and more |
| **Task Monitoring** | View and filter indexing tasks by status, type, and index |
| **API Key Management** | Create and manage API keys with fine-grained permissions |
| **Search Preview** | Real-time search with table/JSON view, filter builder, export query |
| **Multi-language** | English and Chinese interface |
| **Theme Support** | Dark and Light themes |
| **System Tray** | Minimize to system tray for background running |

## Architecture

```
meilisearch-desktop/
├── src/                        # React Frontend (TypeScript)
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── layout/             # Layout components (sidebar, header)
│   │   ├── search/             # Search-related components
│   │   ├── settings/           # Index settings components
│   │   ├── documents/          # Document operation components
│   │   ├── embedder/           # Embedder configuration components
│   │   ├── project/            # Project card and management
│   │   └── common/             # Common shared components
│   ├── pages/                  # Page components
│   │   ├── project/            # Project detail sub-pages
│   │   └── index/              # Index detail sub-pages
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # API service layer (Tauri invoke)
│   ├── contexts/               # React context providers
│   ├── i18n/                   # Internationalization (en/zh)
│   ├── types/                  # TypeScript type definitions
│   └── lib/                    # Utility functions
├── src-tauri/                  # Tauri Backend (Rust)
│   └── src/
│       ├── commands/           # Tauri command handlers
│       │   ├── project.rs      # Project CRUD operations
│       │   ├── index_cmd.rs    # Index management
│       │   ├── document.rs     # Document operations
│       │   ├── search.rs       # Search API
│       │   ├── settings.rs     # Index settings
│       │   ├── task.rs         # Task monitoring
│       │   ├── key.rs          # API key management
│       │   └── utils.rs        # Utility commands
│       ├── database/           # SQLite database operations
│       ├── services/           # Meilisearch HTTP client
│       ├── models/             # Data models
│       ├── state.rs            # Application state
│       └── tray.rs             # System tray configuration
└── public/                     # Static assets
```

### Tech Stack

**Backend (Rust):**
- Tauri 2 (Desktop Framework)
- Rusqlite (SQLite Database)
- Reqwest (HTTP Client)
- Serde (Serialization)
- Tokio (Async Runtime)

**Frontend (TypeScript):**
- React 18 (UI Library)
- Vite (Build Tool)
- TanStack Query (Data Fetching)
- Tailwind CSS + shadcn/ui (Styling)
- React Router (Routing)
- i18next (Internationalization)
- CodeMirror (JSON Editor)
- Framer Motion (Animations)

## Quick Start

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (1.70+)
- [Node.js](https://nodejs.org/) (18+)
- npm
- A running Meilisearch instance

### Platform-specific Dependencies

<details>
<summary><b>Windows</b></summary>

- [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (pre-installed on Windows 10/11)

</details>

<details>
<summary><b>macOS</b></summary>

```bash
xcode-select --install
```

</details>

<details>
<summary><b>Linux</b></summary>

```bash
# Debian/Ubuntu
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

</details>

### Installation

Download the latest pre-built installer directly from the [Releases](https://github.com/ItBayMax/meilisearch-desktop/releases) page — no build required.

> **macOS Note**: If macOS shows a "damaged" or "unverified developer" warning, run the following command:
>
> ```bash
> sudo xattr -cr /Applications/Meilisearch\ Desktop.app
> ```

### Development

```bash
# Clone the repository
git clone https://github.com/ItBayMax/meilisearch-desktop.git
cd meilisearch-desktop

# Install frontend dependencies
npm install

# Start development mode (hot reload)
npm run tauri dev
```

### Build for Production

```bash
# Build the application
npm run tauri build

# The installer/binary will be in:
# Windows: src-tauri/target/release/bundle/msi/
# macOS:   src-tauri/target/release/bundle/dmg/
# Linux:   src-tauri/target/release/bundle/deb/
```

### First Steps

1. Launch the application
2. Click "Add Project" to register your Meilisearch instance
3. Enter the Meilisearch URL (e.g., `http://localhost:7700`) and API Key
4. Start managing your indexes!

## Screenshots

> future documentation.

### Project Dashboard

![Project Dashboard](docs/images/en/project-dashboard.png)
*Main dashboard showing all registered Meilisearch instances with key metrics (index count, document count)*

<div align="center">
      <img src="docs/images/en/project-info.png" alt="info" style="width:100%; ">
</div>

<div align="center">
      <img src="docs/images/en/project-settings.png" alt="settings" style="width:100%; ">
</div>

<div align="center">
      <img src="docs/images/en/project-index.png" alt="index" style="width:100%; ">
</div>

### Index Management

![Index Management](docs/images/en/index-management.png)
*Index list view with document counts, status, and quick actions*

### Index Settings

![Index Settings](docs/images/en/index-settings.png)
*Comprehensive settings panel: attributes, ranking rules, synonyms, typo tolerance, embedders, etc.*

<div align="center">
      <img src="docs/images/en/index-settings-01.png" alt="ranking rules" style="width:45%; ">
      <img src="docs/images/en/index-settings-02.png" alt="embedders" style="width:50%; ">
</div>

### Search Preview

![Search Preview](docs/images/en/search-preview.png)
*Real-time search testing with table/JSON view, filter builder, column selector, and export query*

### Document Management

![Documents](docs/images/en/documents.png)
*Document table with action buttons (copy, edit, delete), hover copy, and batch import*

<div align="center">
      <img src="docs/images/en/documents-01.png" alt="add" style="width:45%; ">
      <img src="docs/images/en/documents-02.png" alt="view" style="width:50%; ">
</div>

### Task Monitor

![Task Monitor](docs/images/en/task-monitor.png)
*Task list with status filtering and detailed information*

### API Keys

![API Keys](docs/images/en/api-keys.png)
*API key management with visibility toggle and permission control*

### Theme Support

![Theme Dark](docs/images/en/theme-dark.png)
![Theme Light](docs/images/en/theme-light.png)
*Dark and Light theme support*

## Related Projects

| Project | Description | Link |
|---------|-------------|------|
| **Meilisearch Admin** | Web-based administration panel (Python + Vue 3) | [GitHub](https://github.com/ItBayMax/meilisearch-admin) |
| **Meilisearch** | Lightning-fast search engine | [meilisearch.com](https://www.meilisearch.com/) |

> If you prefer a web-based solution that can be deployed with Docker, check out [Meilisearch Admin](https://github.com/ItBayMax/meilisearch-admin).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <a href="#readme-top">Back to Top</a>
</p>
