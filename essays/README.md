# 随笔目录说明

## 普通文章

放在 `essays/` 根目录的 `.md` 文件属于「散篇」。

```md
---
title: 文章标题
date: 2026-11-12
updated: 2026-11-12
description: 一句话摘要
draft: false
---

正文……
```

文件名可以随便取，但会变成网页文件名；建议使用英文、数字或拼音。

## 文集

在 `essays/` 下新建一个一级文件夹，就是一个文集：

```text
essays/
  siji/
    _collection.md
    01.md
    02.md
```

文集配置写在 `_collection.md`：

```md
---
title: 枫糖空集·四季
description: 一个关于季节的系列
order: 01
cover: cover.png
---

这里可以写文集介绍。
```

- `title` 不填时使用文件夹名。
- `date` 用于文章日期；`updated` 存在时优先用于排序。
- `draft: true` 的文章不会生成。
- `_collection.md`、`README.md`、`_` 开头的文件不会被当成文章。
- 运行本目录的 `publish.bat` 只发布随笔；运行项目根目录 `sync.bat` 发布全部。

## 注意

不要把 `.bat` 脚本复制进文集文件夹。生成的 HTML 会出现在文集文件夹里，这是网页访问需要的。
