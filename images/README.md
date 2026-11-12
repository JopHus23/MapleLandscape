# 影像目录说明

## 普通图片

放在 `images/` 根目录的图片属于「未分组」。

推荐命名：

```text
26.11.09.png
26.11.10.jpg
```

日期从文件名读取；没有日期时使用文件修改时间兜底。

## 影像集

在 `images/` 下新建一个一级文件夹，就是一个影像集：

```text
images/
  siji/
    _collection.md
    cover.png
    26.11.12.png
```

影像集配置写在 `_collection.md`：

```md
---
title: 枫糖空集·四季
description: 一个关于季节的影像系列
order: 01
cover: cover.png
---

这里可以写影像集介绍。
```

- 缩略图会自动生成到 `images/thumbs/`。
- 墙上列表使用缩略图，点击预览加载原图。
- 运行本目录的 `publish.bat` 只发布影像；运行项目根目录 `sync.bat` 发布全部。

## 注意

不要把 `.bat` 脚本复制进影像集文件夹。生成的影像集 `index.html` 会出现在影像集文件夹里，这是网页访问需要的。
