# ras_crww · 夜间个人主页

本地运行：`npm run dev`，打开 http://127.0.0.1:4173 。无需安装依赖。

静态文件位于 `dist/`，可直接部署。运行 `npm run check` 检查 JavaScript 语法。

## GitHub Pages

网页桌宠使用之前制作的两个原始 v2 精灵图：七草荠头像抱枕（更新后的左右翻滚版本）与七草荠 Q 版。位于 `dist/assets/pets/`，保持原始图像不变。网页支持点击互动、拖动、双击跳跃、鼠标方向注视、键盘移动与空格跳跃，以及暂停、收起和重新召唤。暂停和显示偏好保存在本机浏览器；遵循系统减少动态效果偏好。不会修改 ChatGPT 中的桌宠状态。

已提供 `.github/workflows/pages.yml`。仓库 Settings → Pages → Build and deployment 选择 GitHub Actions。PR 会运行 JavaScript 语法检查，合并到 `main` 后将 `dist/` 发布到 Pages。资源使用相对路径，可用于项目仓库子路径。无需安装依赖或填写部署密钥。

功能：响应式首页、持久化明暗主题、锚点导航、文章与作品弹窗、素材来源、鼠标星点、黑胶播放器（两季动画官方 OP / ED，支持播放暂停、选曲、切歌、进度、音量）。尊重系统减少动态效果设置。社交账号尚未提供，点击显示待填写提示。

## 原图来源

- 个人头像：用户提供的 `照片 1.jpg`，原文件复制为 `dist/assets/profile-avatar.jpg`，不重绘。
- 中央称号：`終焉の魔王`。采用 Yuji Boku 日式笔触字体及错落字排，参考作品标题气质，并非已确认的官方字标原字体。字体仅包含称号所需字形，保存在 `dist/assets/fonts/`，同目录附 SIL Open Font License。

- 首页背景：动画官方售货机主题视觉 https://yofukashi-no-uta.com/1st/news/archives/24
- 官方高分辨率原图：https://yofukashi-no-uta.com/1st/news/wp/wp-content/uploads/2022/02/c124a0955a367b667c270ad28aafd57f.jpg
- `anime-vending-visual.jpg` 保留下载的官方原图；`anime-vending-background.jpg` 是其售货机场景裁切和等比例缩小，无 AI 重绘。首页使用动画背景与官方透明立绘，随笔区域保留漫画素材。

- 原始透明立绘：https://yofukashi-no-uta.com/1st/character/img/nazuna_visual.png?2
- 官方表情图：https://yofukashi-no-uta.com/1st/character/img/nazuna_face_1.png
- 官方角色页：https://yofukashi-no-uta.com/1st/character/#/nazuna
- 漫画来源：https://shogakukan-comic.jp/book?isbn=9784091294920
- 公开试读：https://sc-portal.tameshiyo.me/9784091294920
- `manga-street.jpg` 为试读图片 11 的等比例场景裁切，原文件同时保留。页面背景仅进行 CSS 蓝紫调色和渐变遮罩，无 AI 重绘。原立绘 PNG 保持下载内容不变。

人物和漫画版权归原作者及权利人所有。文案为少量原作短句占位；社交信息及个人经历未编造。字体提供离线系统字体回退。

## 动画主题曲

由富士电视台动画官方频道公开发布的无字幕动画版 OP / ED，经 YouTube IFrame API 播放。第一季：堕天（AwXRPWmgLbU）、よふかしのうた（PvyaVqfylu4）；第二季：Mirage（l5S0JhqULAU）、眠れ（K5T_aKoN31Q）。均由 Creepy Nuts 演唱。无音乐文件重新托管，播放依赖 YouTube 的地区、网络和嵌入可用性；播放器提供官方视频入口。仅实际播放事件触发唱片和进度动画，关闭视频时暂停。

## 站内评论与角色更新

评论前端为 dist/comments.js，API 地址 https://ras-crww-comments.cosmicflea4.chatgpt.site/api/comments 。后端源码位于同级 comment-service 目录，使用 Sites + D1 持久化。访客在网页内填写昵称和留言，不需要 GitHub 账号，支持读取、提交和本人会话删除。仅昵称与内容公开显示；会话与限流数据不返回。前端使用 textContent 输出访客输入，页面载入时不伪造评论。

莺馅子全身图来自第二季动画官网透明图：https://yofukashi-no-uta.com/2ndwp/wp-content/themes/26385400ac1b/static/character/11/main.webp 。七草荠采用官方售货机视觉作为参考，通过内置 imagegen 进行去背景处理，生成透明全身图 assets/nazuna-coat-cutout.png；提示词要求保留长外套、饮料罐、表情和全身姿势并去掉背景，不是未经处理的官方原文件。
