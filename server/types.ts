export type MockMode = "auto" | "true" | "false";
export type RunStatus = "queued" | "running" | "completed" | "failed";
export type StepStatus = "pending" | "running" | "completed" | "failed";

export interface ResearchInput {
  target: string;
  industry?: string;
  productCategory?: string;
  url?: string;
  language?: "zh-CN" | "en-US";
}

export interface AgentStep {
  id: string;
  title: string;
  objective: string;
  status: StepStatus;
  startedAt?: string;
  completedAt?: string;
  resultSummary?: string;
  result?: unknown;
  error?: string;
}

export interface ApiCallLog {
  id: string;
  stepId: string;
  capability: string;
  provider: string;
  model: string;
  mode: "mock" | "real";
  startedAt: string;
  durationMs: number;
  inputSummary: string;
  outputSummary: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  error?: string;
}

export interface ResearchTarget {
  inputType: "supplier" | "category" | "url" | "mixed";
  supplierName: string;
  industry: string;
  productCategory: string;
  url?: string;
  researchGoal: string;
  keyQuestions: string[];
}

export interface ResearchPlanTask {
  id: string;
  title: string;
  objective: string;
  method: string;
  expectedOutput: string;
}

export interface ResearchPlan {
  summary: string;
  tasks: ResearchPlanTask[];
}

export interface WebsiteSnapshot {
  url: string;
  title?: string;
  description?: string;
  headings: string[];
  textSample: string;
  fetchedAt: string;
  error?: string;
}

export interface ResearchSource {
  title: string;
  url?: string;
  type: "official" | "marketplace" | "news" | "directory" | "model-knowledge" | "mock" | "user-input";
  confidence: "low" | "medium" | "high";
  note: string;
}

export interface ResearchSnapshot {
  collectedSummary: string;
  supplierSignals: string[];
  productSignals: string[];
  pricingSignals: string[];
  potentialCompetitors: string[];
  sources: ResearchSource[];
  websiteHints?: WebsiteSnapshot;
}

export interface CompetitorComparison {
  name: string;
  positioning: string;
  likelyStrength: string;
  likelyWeakness: string;
}

export interface SupplierAnalysis {
  productAnalysis: {
    mainProducts: string[];
    pricingSignals: string[];
    targetCustomers: string[];
    maturity: "early" | "growing" | "established" | "unknown";
  };
  strengths: string[];
  risks: string[];
  competitorComparison: CompetitorComparison[];
  cooperationAdvice: {
    fitScore: number;
    recommendedApproach: string;
    negotiationPoints: string[];
    nextSteps: string[];
  };
  assumptions: string[];
}

export interface SupplierReport {
  title: string;
  generatedAt: string;
  executiveSummary: string;
  supplierOverview: {
    name: string;
    website?: string;
    industry: string;
    productCategory: string;
    positioning: string;
    facts: string[];
  };
  productAnalysis: SupplierAnalysis["productAnalysis"];
  strengths: string[];
  risks: string[];
  competitorComparison: CompetitorComparison[];
  cooperationAdvice: SupplierAnalysis["cooperationAdvice"];
  assumptions: string[];
  sources: ResearchSource[];
}

export interface ResearchRun {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: RunStatus;
  input: ResearchInput;
  target?: ResearchTarget;
  plan?: ResearchPlan;
  snapshot?: ResearchSnapshot;
  analysis?: SupplierAnalysis;
  report?: SupplierReport;
  steps: AgentStep[];
  usage: ApiCallLog[];
  error?: string;
}
