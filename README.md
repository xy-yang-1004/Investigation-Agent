# SupplierScope AI

AI Agent 驱动的供应商调研与自动化报告生成平台。用户输入供应商名称、产品类别、行业或官网 URL 后，系统会自动解析目标、规划调研步骤、整理供应商信息、分析产品与风险、生成结构化报告，并展示完整的 API 调用日志。

这个项目面向采购、运营、市场和创业团队，目标是把原本需要人工搜索、复制、整理和判断的供应商初筛流程，压缩成一个可解释、可复用、可导出的 AI Agent 工作流。

## 核心功能

- 首页：介绍项目价值、使用方式和当前模型运行模式。
- 调研输入页：支持供应商名称、行业、产品类型、官网 URL。
- Agent 执行页：展示任务规划、步骤状态、中间结果和错误信息。
- 报告页：展示供应商概览、产品分析、优势、风险、竞品对比和合作建议。
- API 使用展示：展示调用能力、调用次数、模型、模式、输入摘要、输出摘要和 token 估算。
- 导出功能：支持 Markdown 和 JSON 报告下载。
- Mock/真实 API 自动切换：没有 API Key 时可直接运行 mock 模式；配置 API Key 后自动调用 OpenAI-compatible API。

## 技术架构

- Frontend：React + Vite + TypeScript
- Backend/API：Node.js + Express + TypeScript
- Agent 编排：服务端顺序执行 `目标解析 -> 调研规划 -> 信息整理 -> 供应商分析 -> 报告生成`
- Model API：OpenAI-compatible `/chat/completions`
- Storage：本地 JSON 文件，运行记录保存到 `data/runs`
- Export：服务端生成 Markdown / JSON

```text
src/                    React 前端页面与组件
server/                 Express API、Agent、模型封装、报告导出
data/examples/          示例输入与示例报告
data/runs/              本地运行记录，默认不提交 JSON 产物
```

## 本地运行

```bash
npm install
npm run dev
```

打开浏览器访问：

```text
http://localhost:5173
```

没有 API Key 时，项目会使用 mock 模式，仍然可以完整体验输入、Agent 执行、调用日志、报告页和导出功能。

## 环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

关键配置：

```env
PORT=5173
MOCK_MODE=auto
AI_API_KEY=
AI_API_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini
AI_TEMPERATURE=0.2
DISABLE_RESPONSE_FORMAT=false
ENABLE_SITE_FETCH=false
SITE_FETCH_TIMEOUT_MS=5000
```

`MOCK_MODE=auto` 表示没有 API Key 时使用 mock，有 API Key 时调用真实模型。若供应商不支持 `response_format`，可设置 `DISABLE_RESPONSE_FORMAT=true`。

## 示例输入

```json
{
  "target": "Acme Robotics",
  "industry": "智能制造",
  "productCategory": "仓储自动化机器人",
  "url": "https://example.com",
  "language": "zh-CN"
}
```

示例输出见 `data/examples/sample-report.json`。
