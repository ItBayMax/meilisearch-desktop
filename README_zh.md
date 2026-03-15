<a name="readme-top"></a>

<div align="center">
  <h1>Meilisearch Desktop</h1>

  <p align="center">
    <a href="README.md">English</a> | <b>简体中文</b>
  </p>

  <p>
    基于 Tauri 2 + React 构建的跨平台 Meilisearch 管理桌面应用
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

## 目录

- [项目介绍](#项目介绍)
- [功能特性](#功能特性)
- [系统架构](#系统架构)
- [快速开始](#快速开始)
- [功能截图](#功能截图)
- [相关项目](#相关项目)
- [参与贡献](#参与贡献)

## 项目介绍

**Meilisearch Desktop** 是一个跨平台的 Meilisearch 搜索引擎管理桌面客户端。基于 Tauri 2（Rust 后端）和 React（TypeScript 前端）构建，提供原生桌面体验和本地数据持久化，无需部署后端服务即可使用。

### 项目背景

Meilisearch 官方镜像缺少 UI 管理界面，日常运维需要通过 curl 命令或代码调用 API。本项目旨在：

1. 提供轻量级的桌面端管理工具，开箱即用
2. 统一管理多个 Meilisearch 实例
3. 简化索引配置、文档管理等操作
4. 可视化展示任务状态和搜索结果

> 如果您需要 Web 端的解决方案，可以使用 [Meilisearch Admin](https://github.com/ItBayMax/meilisearch-admin)（基于 Python + Vue 3 的 Web 管理面板，支持 Docker 部署）。

### 为什么选择 Meilisearch Desktop？

- **原生桌面应用**：轻量快速，离线运行，无需部署后端服务
- **跨平台支持**：支持 Windows、macOS、Linux
- **本地数据存储**：项目配置通过 SQLite 存储在本地，无云端依赖
- **可视化管理**：直观的 UI 界面管理索引、文档和配置
- **多实例支持**：在一个应用中管理多个 Meilisearch 实例
- **实时搜索预览**：即时测试搜索查询并查看结果和相关度评分
- **完整配置控制**：通过界面配置所有索引设置

## 功能特性

| 模块 | 功能描述 |
|------|----------|
| **项目管理** | 添加和管理多个 Meilisearch 实例，支持连接测试 |
| **索引管理** | 创建、配置和删除索引，支持完整的设置控制 |
| **文档操作** | 添加、编辑、删除和浏览文档，支持 JSON/CSV/NDJSON 导入 |
| **配置管理** | 属性、排序规则、同义词、容错设置、向量化配置等 |
| **任务监控** | 查看和管理索引任务，支持按状态、类型、索引筛选 |
| **密钥管理** | 创建和管理 API 密钥，细粒度权限控制 |
| **搜索预览** | 实时搜索，支持表格/JSON 视图、筛选构建器、导出查询 |
| **多语言** | 支持中文和英文界面切换 |
| **主题切换** | 支持暗黑和明亮主题 |
| **系统托盘** | 最小化到系统托盘后台运行 |

## 系统架构

```
meilisearch-desktop/
├── src/                        # React 前端 (TypeScript)
│   ├── components/             # 可复用 UI 组件
│   │   ├── ui/                 # shadcn/ui 基础组件
│   │   ├── layout/             # 布局组件（侧边栏、头部）
│   │   ├── search/             # 搜索相关组件
│   │   ├── settings/           # 索引设置组件
│   │   ├── documents/          # 文档操作组件
│   │   ├── embedder/           # 向量化配置组件
│   │   ├── project/            # 项目卡片与管理
│   │   └── common/             # 通用共享组件
│   ├── pages/                  # 页面组件
│   │   ├── project/            # 项目详情子页面
│   │   └── index/              # 索引详情子页面
│   ├── hooks/                  # 自定义 React Hooks
│   ├── services/               # API 服务层（Tauri invoke）
│   ├── contexts/               # React Context Provider
│   ├── i18n/                   # 国际化（中/英）
│   ├── types/                  # TypeScript 类型定义
│   └── lib/                    # 工具函数
├── src-tauri/                  # Tauri 后端 (Rust)
│   └── src/
│       ├── commands/           # Tauri 命令处理
│       │   ├── project.rs      # 项目 CRUD 操作
│       │   ├── index_cmd.rs    # 索引管理
│       │   ├── document.rs     # 文档操作
│       │   ├── search.rs       # 搜索 API
│       │   ├── settings.rs     # 索引设置
│       │   ├── task.rs         # 任务监控
│       │   ├── key.rs          # API 密钥管理
│       │   └── utils.rs        # 工具命令
│       ├── database/           # SQLite 数据库操作
│       ├── services/           # Meilisearch HTTP 客户端
│       ├── models/             # 数据模型
│       ├── state.rs            # 应用状态
│       └── tray.rs             # 系统托盘配置
└── public/                     # 静态资源
```

### 技术栈

**后端（Rust）：**
- Tauri 2（桌面应用框架）
- Rusqlite（SQLite 数据库）
- Reqwest（HTTP 客户端）
- Serde（序列化/反序列化）
- Tokio（异步运行时）

**前端（TypeScript）：**
- React 18（UI 框架）
- Vite（构建工具）
- TanStack Query（数据请求管理）
- Tailwind CSS + shadcn/ui（样式框架）
- React Router（路由）
- i18next（国际化）
- CodeMirror（JSON 编辑器）
- Framer Motion（动画效果）

## 快速开始

### 环境要求

- [Rust](https://www.rust-lang.org/tools/install)（1.70+）
- [Node.js](https://nodejs.org/)（18+）
- npm
- 运行中的 Meilisearch 实例

### 平台依赖

<details>
<summary><b>Windows</b></summary>

- [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)（Windows 10/11 已预装）

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

### 安装

直接前往 [Releases](https://github.com/ItBayMax/meilisearch-desktop/releases) 页面下载最新的预构建安装包，无需手动编译。

> **macOS 提示**：如果 macOS 提示应用「已损坏」或「无法验证开发者」，请执行以下命令：
>
> ```bash
> sudo xattr -cr /Applications/Meilisearch\ Desktop.app
> ```

### 开发

```bash
# 克隆项目
git clone https://github.com/ItBayMax/meilisearch-desktop.git
cd meilisearch-desktop

# 安装前端依赖
npm install

# 启动开发模式（热更新）
npm run tauri dev
```

### 构建生产版本

```bash
# 构建应用
npm run tauri build

# 安装包/可执行文件位于：
# Windows: src-tauri/target/release/bundle/msi/
# macOS:   src-tauri/target/release/bundle/dmg/
# Linux:   src-tauri/target/release/bundle/deb/
```

### 开始使用

1. 启动应用
2. 点击「添加项目」注册您的 Meilisearch 实例
3. 输入 Meilisearch 地址（如 `http://localhost:7700`）和 API Key
4. 开始管理您的索引！

## 功能截图

> 以下为功能模块说明和功能展示。

### 项目仪表盘

![项目仪表盘](docs/images/zh/project-dashboard.png)
*主仪表盘展示所有已注册的 Meilisearch 实例及关键指标（索引数、文档数）*

**主要功能：**
- 项目卡片展示实例基本信息和统计数据
- 支持复制地址
- 快速跳转到搜索预览

<div align="center">
      <img src="docs/images/zh/project-info.png" alt="项目信息" style="width:100%; ">
</div>

<div align="center">
      <img src="docs/images/zh/project-settings.png" alt="项目设置" style="width:100%; ">
</div>

<div align="center">
      <img src="docs/images/zh/project-index.png" alt="项目索引" style="width:100%; ">
</div>

### 索引管理

![索引管理](docs/images/zh/index-management.png)
*索引列表视图，展示文档数量、状态和快捷操作*

**主要功能：**
- 索引卡片展示状态、文档数、更新时间
- 支持创建、删除索引
- 批量导入文档（JSON/CSV/NDJSON）

### 索引配置

![索引配置](docs/images/zh/index-settings.png)
*完整的设置面板，采用 Tab 页签导航*

**配置项包括：**
- 基础信息 (General)
- 属性配置 (Attributes)
- 排序规则 (Ranking Rules)
- 同义词 (Synonyms)
- 容错设置 (Typo Tolerance)
- 前缀搜索 (Prefix Search)
- 停止词 (Stop Words)
- 分隔符 (Separators)
- 字典 (Dictionary)
- 分页 (Pagination)
- 分页大小 (Faceting)
- 搜索截止 (Search Cutoff)
- 向量化 (Embedders)

<div align="center">
      <img src="docs/images/zh/index-settings-01.png" alt="排序规则" style="width:45%; ">
      <img src="docs/images/zh/index-settings-02.png" alt="向量化" style="width:50%; ">
</div>

### 搜索预览

![搜索预览](docs/images/zh/search-preview.png)
*实时搜索测试，支持表格/JSON 视图和相关度评分*

**主要功能：**
- 进入页面自动查询数据
- 表格视图 / JSON 视图切换
- 相关度评分展示
- 筛选条件构建器
- 复制 JSON、编辑、删除文档
- 单元格内容悬停复制
- 导出查询（cURL / Postman / JSON）
- 可选择展示列

### 文档管理

![文档管理](docs/images/zh/documents.png)
*文档表格展示，带操作按钮（复制、编辑、删除）和批量导入*

<div align="center">
      <img src="docs/images/zh/documents-01.png" alt="添加文档" style="width:45%; ">
      <img src="docs/images/zh/documents-02.png" alt="查看文档" style="width:50%; ">
</div>

### 任务监控

![任务监控](docs/images/zh/task-monitor.png)
*任务列表，支持按状态、类型、索引筛选和详情查看*

### API 密钥管理

![API 密钥](docs/images/zh/api-keys.png)
*API 密钥管理，支持显示/隐藏切换和权限控制*

### 主题支持

![主题-暗黑](docs/images/zh/theme-dark.png)
![主题-明亮](docs/images/zh/theme-light.png)
*支持暗黑和明亮主题切换*

## 相关项目

| 项目 | 描述 | 链接 |
|------|------|------|
| **Meilisearch Admin** | Web 端管理面板（Python + Vue 3），支持 Docker 部署 | [GitHub](https://github.com/ItBayMax/meilisearch-admin) |
| **Meilisearch** | 高性能搜索引擎 | [meilisearch.com](https://www.meilisearch.com/) |

> 如果您更倾向于 Web 端方案，可以使用 [Meilisearch Admin](https://github.com/ItBayMax/meilisearch-admin)，支持 Docker 一键部署。

## 参与贡献

欢迎提交 Pull Request 参与贡献！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 开源协议

本项目基于 Apache License 2.0 协议开源 - 详见 [LICENSE](LICENSE) 文件。

---

<p align="center">
  <a href="#readme-top">返回顶部</a>
</p>
