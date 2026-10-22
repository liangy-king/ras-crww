# ras_crww · 夜间游戏菜单版

个人网站以左侧菜单和中央栏目舞台组织，参考 P3/P5 设置菜单的选中条、斜向分区与人物剪影转场。六位角色分别使用独立主题配色。

## 运行与发布

- `npm run dev`：http://127.0.0.1:4173
- `npm run check`：检查所有脚本语法并运行转场行为测试。
- 发布内容为 `dist/`，无第三方运行依赖。GitHub Actions 将 main 分支发布到 GitHub Pages。

## 界面与交互

- 首页、关于、随笔、作品、留言、设置采用同一文档内的栏目切换，保留原有 #home / #about / #notes / #works / #comments 深链接。旧 #contact 对应关于页的联系信息。
- 栏目切换只隐藏、显示已有内容；音乐元素和留言表单不重新挂载。浏览器前进后退、键盘方向键选择菜单、Enter 进入、Escape 返回首页可用；输入控件内不拦截方向键。
- 名字与英文左侧菜单使用本地 Russo One，银白主体、向右 12%、向下 10% 的淡紫硬投影，无描边。中文标签使用系统粗体。称号「終焉の魔王」沿用本地 Yuji Boku 字形。
- 设置可切换 P3 水下漂浮 / P5 分镜切入、深夜 / 月白主题、动画总开关、常驻动效、桌宠显示；偏好保存到当前浏览器。
- 六区固定绑定：首页七草荠、关于夜守光、随笔莺馅子、作品星见菊、留言夕真昼、设置桔梗芹。各有两组原图分镜、独立环境和深浅配色，控件与播放器同步更新。配置集中在 sections.js，world.js 管理场景与常驻装饰。
- 首次进入每区 3200ms，再次 1600ms，访问记录保存于当前标签页 sessionStorage，刷新保留。预览不消耗首次记录。切入约 300ms、视线约 650ms，延长中段人物停留。50% 时提交路由；跳过按钮及 Esc 立即完成，过场外 Esc 返回首页。
- 快速连点在提交前取消旧镜头，只提交最新目标；提交后只保留最后一个排队目标。隐藏标签页、减少动态效果或关闭动画时清理遮罩和时钟。
- 常驻动效包含月环、路线、档案扫描、花瓣、便签和星形贴纸；当前环境缓慢漂移，正文保持稳定。手机减少粒子且禁用鼠标视差，后台暂停。设置含动画总开关与独立常驻动效开关。
- 图片预加载解码：当前角色按需准备，导航悬停/聚焦预取，环境小图后台预热。实际转场 rAF 采样仅存 DOM 的 data-frame-p95 / data-frame-count，不上传。
- 人物和环境均使用原图裁切、缩放和压缩；不是连续视频动作，不声称原版专用 3D 的 1:1 复刻。
- 弹窗有进入和关闭动画，支持 Escape 和点击外侧关闭，使用原生 dialog 焦点管理。

## 原始素材与字体

- 背景：动画官方售货机视觉 https://yofukashi-no-uta.com/1st/news/archives/24
- 官方高分辨率原图：https://yofukashi-no-uta.com/1st/news/wp/wp-content/uploads/2022/02/c124a0955a367b667c270ad28aafd57f.jpg
- anime-vending-visual.jpg 为原图；anime-vending-background.jpg 为既有原图场景裁切。新界面直接使用该裁切，只缩放、压暗和调色，没有生成、扩图或重绘建筑。
- 七草荠完整立绘、转场蒙版：第一季官网原始透明图 https://yofukashi-no-uta.com/1st/character/img/nazuna_visual.png?2 （assets/nazuna-original.png）。
- 莺馅子完整立绘、转场蒙版：https://yofukashi-no-uta.com/2ndwp/wp-content/themes/26385400ac1b/static/character/11/main.webp （assets/anko-season2.webp）。
- 个人头像：用户提供的照片原文件复制，不重绘。
- 漫画：小学馆第一卷官方公开试读 https://shogakukan-comic.jp/book?isbn=9784091294920 。随笔、作品为明确标记的台词和视觉收藏占位，不编造个人经历。
- 旧版 nazuna-coat-cutout.png 是此前 AI 辅助去背景资产，本版没有引用；本版显示人物及剪影均使用上述官方透明原图。
- Russo One 来自 Google Fonts，字体子集和许可证位于 assets/fonts/russo-one-menu.ttf 与 Russo-One-OFL.txt。Yuji Boku 子集与许可证也在同目录。均为 SIL Open Font License。
- 人物与漫画版权归原作者及权利人所有，菜单设计参考不表示与游戏或动画官方有关联。

- 新增转场剧照：动画第二季官网公开 story 数据。每张原始 URL、集数和处理记录见 `dist/assets/transitions/sources.json`，处理仅为等比例缩小、WebP 压缩和运行时裁切。

## 音乐、留言与桌宠

五首用户提供的 FLAC 已转为 192 kbps MP3，保留完整歌曲，位于 assets/music/。四首动漫 OP/ED 与ヨルシカ《だから僕は音楽を辞めた》通过本站纯音频播放，不依赖 MV、YouTube 或网易云接口。进入页面尝试自动播放；若浏览器拦截，首次点击后播放。支持选曲、切歌、进度、静音与音量、列表循环。

评论接口继续使用 https://ras-crww-comments.cosmicflea4.chatgpt.site/api/comments ，不改动后端和已有留言。支持昵称匿名提交、分页、刷新与本人会话删除，前端以 textContent 渲染访客输入。

两个桌宠复用之前制作的原始 v2 精灵图。支持拖动、点击、双击跳跃、方向注视、键盘操作、暂停与收起。默认停靠在底部安全区域以避开表单和播放器控件。

## 修改前备份

基准前端提交：85189b7fe029a897cc6c788e2898785693644cbc。

工作区同级 backups/ras-crww-20261022-before-game-menu/ 保存网站源码及静态资源 ZIP、Git 历史 bundle、评论后端源码 ZIP 和 RESTORE.txt。备份包含五首 MP3；评论源码备份不是线上数据库快照，不包含密钥和访客会话凭据。独立工作树为 ras-crww-menu，原基准可从备份或 Git 历史恢复。

## 六分区版本素材与备份

新角色透明原图与环境裁切来源详见 dist/assets/scenes/sources.json。留言区使用原漫画街景并叠加暖色，其他区使用动画原场景；售货机只用作首页环境。当前版本改造前备份为 ../backups/ras-crww-7ba1deb-before-six-sections.zip。
