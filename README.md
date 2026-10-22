# ras_crww · 夜间个人主页

本地运行：`npm run dev`，打开 http://127.0.0.1:4173 。无需安装依赖。

静态文件位于 `dist/`，可直接部署。运行 `npm run check` 检查 JavaScript 语法。

## GitHub Pages

已提供 `.github/workflows/pages.yml`。仓库 Settings → Pages → Build and deployment 选择 GitHub Actions。PR 会运行 JavaScript 语法检查，合并到 `main` 后将 `dist/` 发布到 Pages。资源使用相对路径，可用于项目仓库子路径。无需安装依赖或填写部署密钥。

功能：响应式首页、持久化明暗主题、锚点导航、文章与作品弹窗、素材来源、鼠标星点、黑胶播放器（原创 Web Audio 氛围音，支持播放暂停、切歌、进度、音量）。尊重系统减少动态效果设置。社交账号尚未提供，点击显示待填写提示。

## 原图来源

- 原始透明立绘：https://yofukashi-no-uta.com/1st/character/img/nazuna_visual.png?2
- 官方表情图：https://yofukashi-no-uta.com/1st/character/img/nazuna_face_1.png
- 官方角色页：https://yofukashi-no-uta.com/1st/character/#/nazuna
- 漫画来源：https://shogakukan-comic.jp/book?isbn=9784091294920
- 公开试读：https://sc-portal.tameshiyo.me/9784091294920
- `manga-street.jpg` 为试读图片 11 的等比例场景裁切，原文件同时保留。页面背景仅进行 CSS 蓝紫调色和渐变遮罩，无 AI 重绘。原立绘 PNG 保持下载内容不变。

人物和漫画版权归原作者及权利人所有。文案为少量原作短句占位；社交信息及个人经历未编造。字体提供离线系统字体回退。
