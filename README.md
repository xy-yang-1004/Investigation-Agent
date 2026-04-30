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

## 为什么需要 API 调用额度

供应商调研不是单轮问答，而是一个多步骤 Agent 工作流。一次完整任务通常需要多次模型调用：输入解析、任务规划、资料整理、供应商分析、报告生成，以及后续的多供应商对比、报告润色、结构化导出和用户追问。随着用户批量调研供应商、生成多版本报告、接入更多数据源，调用量会随任务数和供应商数量线性增长。

## 用于 API 供应商额度申请的项目描述

项目名称：SupplierScope AI - AI Agent 驱动的供应商调研与自动化报告生成平台。

项目解决的问题：采购、运营、市场和创业团队在筛选供应商时，需要反复搜索官网、整理产品信息、比较价格与风险，并把结果整理成决策报告。该流程耗时、重复且难以标准化。SupplierScope AI 将该流程产品化为一个可运行的 Agent 平台，帮助团队快速完成供应商初筛和合作建议生成。

Agent 如何使用模型 API：系统将一次调研拆成多个模型任务，包括用户输入解析、调研计划生成、供应商公开信号整理、产品/价格/优势/风险/竞品分析、最终结构化报告生成。每一步都会记录模型能力、调用次数、输入摘要、输出摘要和 token 使用情况，便于审计和展示。

当前已完成的功能：项目已实现本地可运行的 React + Node.js 应用，包含首页、调研输入页、Agent 执行页、报告页、API 使用展示、Markdown/JSON 导出、OpenAI-compatible API 封装、mock 模式、本地 JSON 运行记录和示例数据。

为什么需要更高 API 调用额度：真实业务中，一个采购任务往往涉及 10-50 家候选供应商；每家供应商需要 5 次以上模型调用，后续还会产生报告再生成、竞品矩阵、多语言输出和用户追问。因此基础额度很快会限制批量调研、用户测试和产品迭代。

预期调用量：MVP 阶段预计每天 100-300 个调研任务，每个任务 5-8 次模型调用，约 500-2400 次调用/天；小团队试点阶段预计每天 500-1000 个调研任务，约 2500-8000 次调用/天。

长期规划：接入实时搜索、官网抓取、供应商数据库、企业内部采购记录、报价单解析、批量供应商对比、团队协作审批和报告版本管理，逐步发展为采购智能决策平台。

GitHub 项目亮点：项目不是单页 demo，而是完整工程；具备前后端、Agent 编排、模型 API 封装、mock/真实 API 自动切换、运行日志、导出能力、示例数据和清晰 README，适合作为 API 额度申请的可运行技术证明。

## Roadmap

- 接入可配置搜索供应商，增强实时资料来源。
- 支持批量供应商导入和竞品矩阵导出。
- 增加 PDF / DOCX 报告导出。
- 引入报告版本管理和团队协作批注。
- 增加报价单、产品手册和合同条款解析。
- 增加供应商评分规则配置和行业模板。

## GitHub 上传步骤

```bash
git init
git add .
git commit -m "Initial SupplierScope AI project"
git branch -M main
git remote add origin https://github.com/<your-name>/supplier-scope-ai.git
git push -u origin main
```

如果当前目录已经是 Git 仓库，可从 `git add .` 开始。
