# GitLab Desktop

一个基于 Tauri 和 React 构建的 GitLab 桌面客户端，提供更便捷的 GitLab 项目管理体验。

## 功能特性

- 🚀 快速访问 GitLab 项目和 Issue
- 🎯 实时查看和管理项目 Issue
- 👥 支持多用户切换
- 🔄 自动同步 GitLab 数据
- 💻 跨平台支持 (Windows, macOS, Linux)
- 🎨 美观的用户界面
- 🔒 安全的认证管理

## 安装说明

### 环境要求

- Node.js 16.0 或更高版本
- Rust 开发环境
- pnpm 包管理器

### 安装步骤

1. 克隆项目代码
```bash
git clone https://github.com/yourusername/gitlab-desktop.git
cd gitlab-desktop
```

2. 安装依赖
```bash
pnpm install
```

3. 启动开发服务器
```bash
pnpm tauri dev
```

4. 构建应用
```bash
pnpm tauri build
```

## 使用方法

1. 启动应用后，点击设置按钮配置 GitLab 服务器地址和个人访问令牌
2. 选择要管理的项目
3. 查看和管理项目的 Issue

## 技术栈

- [Tauri](https://tauri.app/) - 跨平台应用框架
- [React](https://reactjs.org/) - 用户界面库
- [TypeScript](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - 样式框架

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。在提交 PR 之前，请确保：

1. 代码符合项目的编码规范
2. 添加必要的测试用例
3. 更新相关文档

## 许可证

[MIT License](LICENSE)
