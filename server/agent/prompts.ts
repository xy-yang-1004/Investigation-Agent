import type {
  ResearchInput,
  ResearchPlan,
  ResearchSnapshot,
  ResearchTarget,
  SupplierAnalysis,
  WebsiteSnapshot
} from "../types";

const systemBase = [
  "You are a senior procurement research analyst and AI agent planner.",
  "Return valid JSON only. Do not wrap JSON in Markdown.",
  "If a fact is not verified, mark it as an assumption instead of inventing exact numbers.",
  "Keep the output useful for procurement, operations, marketing, and startup teams."
].join(" ");

export function buildParseInputPrompt(input: ResearchInput) {
  return {
    systemPrompt: systemBase,
    userPrompt: `Parse this supplier research request into a normalized target.

Input:
${JSON.stringify(input, null, 2)}

Return JSON with this shape:
{
  "inputType": "supplier | category | url | mixed",
  "supplierName": "string",
  "industry": "string",
  "productCategory": "string",
  "url": "string or omitted",
  "researchGoal": "string",
  "keyQuestions": ["string"]
}`
  };
}

export function buildPlanningPrompt(target: ResearchTarget) {
  return {
    systemPrompt: systemBase,
    userPrompt: `Create a practical research plan for this supplier target.

Target:
${JSON.stringify(target, null, 2)}

Return JSON with this shape:
{
  "summary": "string",
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "objective": "string",
      "method": "string",
      "expectedOutput": "string"
    }
  ]
}`
  };
}

export function buildCollectionPrompt(target: ResearchTarget, plan: ResearchPlan, websiteHints?: WebsiteSnapshot) {
  return {
    systemPrompt: systemBase,
    userPrompt: `Organize supplier research signals based on the target, plan, and optional website hints.

Target:
${JSON.stringify(target, null, 2)}

Plan:
${JSON.stringify(plan, null, 2)}

Website hints:
${JSON.stringify(websiteHints || null, null, 2)}

Return JSON with this shape:
{
  "collectedSummary": "string",
  "supplierSignals": ["string"],
  "productSignals": ["string"],
  "pricingSignals": ["string"],
  "potentialCompetitors": ["string"],
  "sources": [
    {
      "title": "string",
      "url": "string or omitted",
      "type": "official | marketplace | news | directory | model-knowledge | mock | user-input",
      "confidence": "low | medium | high",
      "note": "string"
    }
  ],
  "websiteHints": ${websiteHints ? "the website hints object" : "null or omitted"}
}`
  };
}

export function buildAnalysisPrompt(target: ResearchTarget, snapshot: ResearchSnapshot) {
  return {
    systemPrompt: systemBase,
    userPrompt: `Analyze this supplier for product fit, pricing signals, strengths, risks, competitors, and cooperation advice.

Target:
${JSON.stringify(target, null, 2)}

Research snapshot:
${JSON.stringify(snapshot, null, 2)}

Return JSON with this shape:
{
  "productAnalysis": {
    "mainProducts": ["string"],
    "pricingSignals": ["string"],
    "targetCustomers": ["string"],
    "maturity": "early | growing | established | unknown"
  },
  "strengths": ["string"],
  "risks": ["string"],
  "competitorComparison": [
    {
      "name": "string",
      "positioning": "string",
      "likelyStrength": "string",
      "likelyWeakness": "string"
    }
  ],
  "cooperationAdvice": {
    "fitScore": 0,
    "recommendedApproach": "string",
    "negotiationPoints": ["string"],
    "nextSteps": ["string"]
  },
  "assumptions": ["string"]
}`
  };
}

export function buildReportPrompt(
  target: ResearchTarget,
  snapshot: ResearchSnapshot,
  analysis: SupplierAnalysis
) {
  return {
    systemPrompt: systemBase,
    userPrompt: `Generate the final structured supplier research report.

Target:
${JSON.stringify(target, null, 2)}

Research snapshot:
${JSON.stringify(snapshot, null, 2)}

Analysis:
${JSON.stringify(analysis, null, 2)}

Return JSON with this shape:
{
  "title": "string",
  "generatedAt": "ISO date string",
  "executiveSummary": "string",
  "supplierOverview": {
    "name": "string",
    "website": "string or omitted",
    "industry": "string",
    "productCategory": "string",
    "positioning": "string",
    "facts": ["string"]
  },
  "productAnalysis": {
    "mainProducts": ["string"],
    "pricingSignals": ["string"],
    "targetCustomers": ["string"],
    "maturity": "early | growing | established | unknown"
  },
  "strengths": ["string"],
  "risks": ["string"],
  "competitorComparison": [
    {
      "name": "string",
      "positioning": "string",
      "likelyStrength": "string",
      "likelyWeakness": "string"
    }
  ],
  "cooperationAdvice": {
    "fitScore": 0,
    "recommendedApproach": "string",
    "negotiationPoints": ["string"],
    "nextSteps": ["string"]
  },
  "assumptions": ["string"],
  "sources": [
    {
      "title": "string",
      "url": "string or omitted",
      "type": "official | marketplace | news | directory | model-knowledge | mock | user-input",
      "confidence": "low | medium | high",
      "note": "string"
    }
  ]
}`
  };
}
