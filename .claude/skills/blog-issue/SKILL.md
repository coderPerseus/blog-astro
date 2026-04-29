---
name: blog-issue
description: 把本地文件作为 issue 发布到 coderPerseus/blog 仓库,或按 ID 修改已有 issue。用户提供本地文件路径(.md/.markdown/.txt 等纯文本)即可创建 issue,文件名作为标题、文件内容作为正文;用户在 prompt 中提到"标签/label/tag/分类"时附加 label。当用户说"发文章/发 issue/发布到 blog/创建 issue/修改 issue/更新 issue #ID"等场景时触发。
---

# blog-issue

把本地文章自动发布为 GitHub issue 到 `coderPerseus/blog` 仓库,或按 ID 修改已有 issue。底层使用 `gh` CLI。

## 前置条件

- `gh` CLI 已安装并登录(`gh auth status` 验证)
- 目标仓库固定为 `coderPerseus/blog`(下文记作 `$REPO`)

## 触发场景

- **创建 issue**: 用户提供本地文件路径,且未要求修改某个 ID
- **修改 issue**: 用户在 prompt 中明确说"修改/更新 #N / issue 123"等,并附带新内容(可来自文件或 prompt 直接给)

## 流程一: 创建 issue

### 1. 解析文件路径

- 用户给出的路径可能是绝对路径或相对路径,先用 `Read` 工具读取确认存在
- 支持的文件类型:
  - **`.md` / `.markdown`**: 整个内容作为 body
  - **`.txt`**: 纯文本作为 body
  - **其它纯文本格式**(`.mdx`, `.rst`, 等): 直接当文本读取作为 body
  - **二进制/无法识别**: 报错并请用户提供文本格式

### 2. 生成标题

- 取**不带扩展名的 basename** 作为 title
- 例: `/path/to/我的-第一篇文章.md` → 标题 `我的-第一篇文章`
- **不要**自作主张去解析 markdown frontmatter 或第一行 `# heading` —— 用户明确要求文件名作标题

### 3. 解析标签

从用户 prompt 中提取标签,只在用户**明确**提到时才加:

- 触发词: `标签`、`label`、`tag`、`分类` 等
- 例: "标签是 bug,p1" → `--label "bug,p1"`
- 例: "打上 announcement 标签" → `--label "announcement"`
- **未提到则完全省略 `--label` 参数**,不要默认加任何 tag

### 4. 执行创建

使用 `Bash` 工具运行(body 通过 stdin 传入避免转义):

```bash
gh issue create \
  --repo coderPerseus/blog \
  --title "<title>" \
  --body-file <file_path> \
  [--label "label1,label2"]
```

> 优先用 `--body-file` 直接喂文件,避免 shell 转义把 markdown 弄乱。

成功后返回 issue URL,转告用户。

## 流程二: 修改 issue

当用户 prompt 同时满足以下两点时进入此流程:

1. 表达了修改意图(`修改/更新/编辑 issue`、`改一下 #N`)
2. 提供了 issue 编号(`#123`、`issue 123`、`第 5 个`)

### 可修改字段

根据用户输入决定要更新哪些字段,不要全部更新:

- **title**: 用户给了新标题或新文件(用文件名)
- **body**: 用户给了新文件(用文件内容)或直接在 prompt 写了新正文
- **labels**: 用户提了新标签

### 命令模板

```bash
gh issue edit <NUMBER> \
  --repo coderPerseus/blog \
  [--title "新标题"] \
  [--body-file <path>] \
  [--add-label "x,y"] \
  [--remove-label "z"]
```

注意:

- 替换标签用 `--add-label` + `--remove-label` 组合;如果用户说"标签改成 X,Y",先用 `gh issue view <N> --repo $REPO --json labels` 取当前标签,把不在新集合里的 remove,把新增的 add
- 如果用户只说"改正文",只传 `--body-file`,不要动 title/labels

## 关键约束

- **目标仓库写死** `coderPerseus/blog`,不要自作主张换仓库
- **不要瞎加标签** —— 用户没说就不加,这是用户明确要求
- **不要修改文件名作标题的规则** —— 即使 markdown 第一行是 `# xxx` 也不要用它当标题
- **创建前展示给用户确认**: 标题 + label + body 头几行,得到许可再 `gh issue create`(避免发错内容)
- **修改前同样确认**: 显示要改的字段和新值,获得许可后再执行
- 创建/修改成功后,把返回的 issue URL 给用户

## 常用辅助命令

- 查看 issue 当前状态: `gh issue view <N> --repo coderPerseus/blog`
- 列出最近 issue: `gh issue list --repo coderPerseus/blog --limit 10`
- 查看仓库现有 labels(确认用户给的 label 是否需要先创建):
  `gh label list --repo coderPerseus/blog`
- 如果用户给的 label 在仓库不存在,`gh issue create --label` 会失败 —— 此时报错并询问是创建新 label 还是改用已有 label,**不要**未经用户同意就 `gh label create`

## 错误处理

- 文件不存在: 提示路径错误,请用户检查
- 文件是二进制: 拒绝,要求文本格式
- `gh` 未登录: 提示运行 `gh auth login`
- label 不存在: 报错并列出仓库现有 labels,询问用户选择
- 修改时找不到 issue 编号: 提示用户确认 issue # 是否正确
