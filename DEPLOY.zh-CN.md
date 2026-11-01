# 上传 GitHub 与发布论文主页

本项目已经包含论文简介、方法原图、结果表、13 页原始 PDF、在线阅读器和 BibTeX。无需 npm 安装或构建。

## 1. 创建并上传仓库

1. 在 GitHub 创建仓库，建议命名为 `S-CAD`。使用 GitHub Free 发布 Pages 时，仓库应设为 Public。
2. 解压项目包，进入 `S-CAD` 文件夹。
3. 将**文件夹内部的所有文件和子文件夹**上传到仓库根目录，确保仓库根目录直接能看到 `index.html` 和 `README.md`。
4. 提交到 `main` 分支。请一并保留 `.nojekyll` 和 `vendor/`，后者是 PDF 阅读器所需的本地依赖。

GitHub 仓库中的 README 会自动显示论文简介；其中“Read the paper (PDF)”链接可直接打开论文。

也可以使用 GitHub Desktop 上传完整文件夹，或在本目录通过 Git 推送到你创建的空仓库：

```powershell
git init
git add .
git commit -m "Add S-CAD paper project"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.git
git push -u origin main
```

请将远程地址替换为实际仓库地址。以上命令仅是操作说明，本项目包没有执行远程推送。

## 2. 启用网页

进入仓库 **Settings → Pages**，选择：

- Source：**Deploy from a branch**
- Branch：**main**
- Folder：**/(root)**

点击 Save，等待 GitHub 显示已发布的网址。使用 GitHub 用户 `TRT-kg` 且仓库命名为 `S-CAD` 时，默认项目网址格式为：

```text
https://trt-kg.github.io/S-CAD/
```

这是发布后的预期地址格式，当前项目包并未创建或发布远程仓库。**以 GitHub Pages 设置中实际显示的地址为准。**

发布说明依据 [GitHub 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 3. 用于海报二维码

二维码建议链接到发布后的**主页网址**，读者扫码后可以先查看简介，再点击阅读论文。若需要直接进入阅读器，使用主页网址加上 `reader.html`。

## 4. 本地预览

在本目录打开终端，运行：

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

然后打开 [http://127.0.0.1:8000/](http://127.0.0.1:8000/)。PDF 阅读器需要通过 HTTP/HTTPS 运行。双击本地 HTML 文件时，可使用页面上的“打开原始 PDF”链接阅读。

## 文件说明

| 文件 | 用途 |
|---|---|
| `README.md` | GitHub 仓库首页的论文介绍 |
| `index.html` / `styles.css` / `app.js` | 中英文论文主页 |
| `reader.html` / `reader.css` / `reader.js` | PDF 在线阅读器 |
| `assets/paper.pdf` | 原始论文 PDF |
| `assets/figures/framework.webp` | 论文方法原图的网页版本 |
| `CITATION.bib` | BibTeX 引用 |
| `vendor/pdfjs/` | PDF.js 本地依赖 |
| `THIRD_PARTY_NOTICES.md` | PDF.js 版本与授权说明 |
| `.nojekyll` | 静态文件发布标记 |
