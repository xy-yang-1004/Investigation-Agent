import crypto from "node:crypto";
import type {
  ResearchInput,
  ResearchPlan,
  ResearchSnapshot,
  ResearchTarget,
  SupplierAnalysis,
  SupplierReport
} from "../types";
import { summarize } from "../utils/text";
import type { LLMClient, LLMRequest, LLMResponse } from "./types";

function hostFromUrl(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function inferSupplierName(input?: ResearchInput) {
  const target = input?.target?.trim();
  if (target) return target.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const host = hostFromUrl(input?.url);
  return host ? host.split(".")[0].replace(/-/g, " ") : "示例供应商";
}

function buildTarget(input?: ResearchInput): ResearchTarget {
  const supplierName = inferSupplierName(input);
  const hasUrl = Boolean(input?.url || /^https?:\/\//.test(input?.target || ""));
  const hasCategory = Boolean(input?.productCategory || input?.industry);

  return {
    inputType: hasUrl && hasCategory ? "mixed" : hasUrl ? "url" : hasCategory ? "mixed" : "supplier",
    supplierName,
    industry: input?.industry || "智能制造与 B2B 供应链",
    productCategory: input?.productCategory || "工业自动化解决方案",
    url: input?.url || (/^https?:\/\//.test(input?.target || "") ? input?.target : undefined),
    researchGoal: `评估 ${supplierName} 作为潜在供应商的产品匹配度、合作风险和采购推进路径。`,
    keyQuestions: [
      "供应商主营产品和目标客户是否匹配当前采购需求？",
      "价格、交付、售后和合规方面有哪些需要进一步验证的风险？",
      "与可替代供应商相比，是否具备差异化优势？",
      "下一步应如何进行询价、样品测试和商务谈判？"
    ]
  };
}

function buildPlan(target: ResearchTarget): ResearchPlan {
  return {
    summary: `围绕 ${target.supplierName} 的公开信息、产品能力、价格信号、风险点和竞品替代方案进行结构化调研。`,
    tasks: [
      {
        id: "scope",
        title: "明确调研边界",
        objective: "识别供应商、行业、产品类别和决策问题。",
        method: "解析用户输入并形成关键问题清单。",
        expectedOutput: "标准化调研目标"
      },
      {
        id: "collect",
        title: "收集公开信号",
        objective: "整理官网、目录、市场描述和产品线信号。",
        method: "优先使用用户 URL 和供应商名称生成资料线索。",
        expectedOutput: "供应商信息快照"
      },
      {
        id: "analyze",
        title: "供应商多维分析",
        objective: "分析产品、价格、优势、风险和合作适配度。",
        method: "使用模型对结构化信息进行归纳和判断。",
        expectedOutput: "可执行分析结论"
      },
      {
        id: "report",
        title: "生成决策报告",
        objective: "输出可导出的 Markdown/JSON 报告。",
        method: "将调研过程转化为采购和运营可读的报告。",
        expectedOutput: "结构化供应商调研报告"
      }
    ]
  };
}

function buildSnapshot(target: ResearchTarget): ResearchSnapshot {
  return {
    collectedSummary: `${target.supplierName} 被识别为 ${target.industry} 领域中与 ${target.productCategory} 相关的潜在供应商。mock 模式下数据用于演示 Agent 流程，真实环境会调用模型并可接入搜索、官网抓取和内部供应商库。`,
    supplierSignals: [
      "可能具备面向企业客户的产品展示和售前咨询流程。",
      "需要进一步验证资质、交付周期、售后覆盖和区域服务能力。",
      "适合通过小批量试单或样品测试降低首次合作风险。"
    ],
    productSignals: [
      `${target.productCategory} 是当前调研的核心产品范围。`,
      "产品资料应重点关注规格参数、可定制能力、兼容性和认证情况。",
      "如涉及硬件或工业品，应补充测试报告、质保条款和备件策略。"
    ],
    pricingSignals: [
      "公开价格通常不完整，建议通过 RFQ 获取阶梯报价。",
      "需要拆分样品费、批量价、运费、税费、维护费和定制开发费。",
      "可用竞品报价建立目标价区间和谈判锚点。"
    ],
    potentialCompetitors: ["Global Sources 供应商", "Alibaba.com 同类供应商", "区域本地集成商"],
    sources: [
      {
        title: "用户输入",
        url: target.url,
        type: "user-input",
        confidence: "high",
        note: "由用户提供的供应商、行业或 URL 信息。"
      },
      {
        title: "Mock research corpus",
        type: "mock",
        confidence: "medium",
        note: "用于无 API Key 环境的本地演示数据。"
      }
    ]
  };
}

function buildAnalysis(target: ResearchTarget, snapshot: ResearchSnapshot): SupplierAnalysis {
  return {
    productAnalysis: {
      mainProducts: [target.productCategory, "定制化配套服务", "售前技术咨询"],
      pricingSignals: snapshot.pricingSignals,
      targetCustomers: ["采购团队", "运营团队", "中小企业项目负责人", "渠道合作伙伴"],
      maturity: "growing"
    },
    strengths: [
      "产品范围与用户调研目标具有直接相关性。",
      "适合通过结构化询价快速获取可比报价。",
      "如果官网和资料完善，可显著降低初步筛选成本。"
    ],
    risks: [
      "公开信息可能不足以验证真实产能和交付稳定性。",
      "价格体系、售后 SLA 和合规资质需要二次确认。",
      "首次合作前缺少样品测试和合同约束会增加执行风险。"
    ],
    competitorComparison: [
      {
        name: "Alibaba.com 同类供应商",
        positioning: "价格透明度较高、可快速比价。",
        likelyStrength: "供应商数量多，报价获取速度快。",
        likelyWeakness: "质量和售后稳定性差异较大。"
      },
      {
        name: "区域本地集成商",
        positioning: "强调本地交付、部署和售后。",
        likelyStrength: "响应速度快，沟通成本低。",
        likelyWeakness: "价格可能更高，产品选择范围有限。"
      },
      {
        name: "品牌原厂或授权代理",
        positioning: "强调品质、认证和长期保障。",
        likelyStrength: "合规和质量保障更强。",
        likelyWeakness: "议价空间通常较小。"
      }
    ],
    cooperationAdvice: {
      fitScore: 78,
      recommendedApproach: "建议进入初步询价和资料核验阶段，在获得报价、资质、交付周期和样品测试结果后再决定是否进入合同谈判。",
      negotiationPoints: ["阶梯报价", "样品测试费用", "交付周期", "质保与售后 SLA", "定制化开发边界"],
      nextSteps: [
        "发送包含规格、数量、交期和认证要求的 RFQ。",
        "要求提供公司资质、客户案例、测试报告和售后政策。",
        "选择 2-3 家竞品供应商建立价格和服务对照表。",
        "完成样品测试或小批量试单后再扩大采购规模。"
      ]
    },
    assumptions: [
      "mock 模式不代表真实市场数据，仅用于展示 Agent 工作流。",
      "未接入付费数据库或实时搜索时，所有公开信息都应由人工或外部工具复核。"
    ]
  };
}

function buildReport(target: ResearchTarget, snapshot: ResearchSnapshot, analysis: SupplierAnalysis): SupplierReport {
  return {
    title: `${target.supplierName} 供应商调研报告`,
    generatedAt: new Date().toISOString(),
    executiveSummary: `${target.supplierName} 与 ${target.productCategory} 需求存在较高相关性，建议作为候选供应商进入询价和资料核验阶段。主要关注点是价格完整性、交付稳定性、售后服务和资质证明。`,
    supplierOverview: {
      name: target.supplierName,
      website: target.url,
      industry: target.industry,
      productCategory: target.productCategory,
      positioning: "面向企业采购场景的潜在供应商候选对象。",
      facts: snapshot.supplierSignals
    },
    productAnalysis: analysis.productAnalysis,
    strengths: analysis.strengths,
    risks: analysis.risks,
    competitorComparison: analysis.competitorComparison,
    cooperationAdvice: analysis.cooperationAdvice,
    assumptions: analysis.assumptions,
    sources: snapshot.sources
  };
}

export class MockLLMClient implements LLMClient {
  provider = "local-mock";
  model = "mock-supplier-research-v1";
  mode: "mock" = "mock";

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const startedAt = new Date().toISOString();
    const started = Date.now();
    const input = request.context?.input as ResearchInput | undefined;
    const target = (request.context?.target as ResearchTarget | undefined) || buildTarget(input);
    const snapshot = (request.context?.snapshot as ResearchSnapshot | undefined) || buildSnapshot(target);
    const analysis = (request.context?.analysis as SupplierAnalysis | undefined) || buildAnalysis(target, snapshot);

    let payload: unknown;
    if (request.capability === "intent-parsing") payload = buildTarget(input);
    else if (request.capability === "research-planning") payload = buildPlan(target);
    else if (request.capability === "information-collection") payload = buildSnapshot(target);
    else if (request.capability === "supplier-analysis") payload = buildAnalysis(target, snapshot);
    else payload = buildReport(target, snapshot, analysis);

    const content = JSON.stringify(payload, null, 2);
    return {
      content,
      log: {
        id: crypto.randomUUID(),
        stepId: request.stepId,
        capability: request.capability,
        provider: this.provider,
        model: this.model,
        mode: this.mode,
        startedAt,
        durationMs: Date.now() - started,
        inputSummary: summarize(request.userPrompt),
        outputSummary: summarize(content),
        promptTokens: Math.ceil(request.userPrompt.length / 4),
        completionTokens: Math.ceil(content.length / 4),
        totalTokens: Math.ceil((request.userPrompt.length + content.length) / 4)
      }
    };
  }
}
