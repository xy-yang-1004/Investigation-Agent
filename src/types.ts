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

export interface ResearchSource {
  title: string;
  url?: string;
  type: string;
  confidence: "low" | "medium" | "high";
  note: string;
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
  productAnalysis: {
    mainProducts: string[];
    pricingSignals: string[];
    targetCustomers: string[];
    maturity: "early" | "growing" | "established" | "unknown";
  };
  strengths: string[];
  risks: string[];
  competitorComparison: Array<{
    name: string;
    positioning: string;
    likelyStrength: string;
    likelyWeakness: string;
  }>;
  cooperationAdvice: {
    fitScore: number;
    recommendedApproach: string;
    negotiationPoints: string[];
    nextSteps: string[];
  };
  assumptions: string[];
  sources: ResearchSource[];
}

export interface ResearchRun {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: RunStatus;
  input: ResearchInput;
  target?: {
    inputType: string;
    supplierName: string;
    industry: string;
    productCategory: string;
    url?: string;
    researchGoal: string;
    keyQuestions: string[];
  };
  plan?: ResearchPlan;
  snapshot?: unknown;
  analysis?: unknown;
  report?: SupplierReport;
  steps: AgentStep[];
  usage: ApiCallLog[];
  error?: string;
}

export interface HealthStatus {
  ok: boolean;
  mode: "mock" | "real";
  model: string;
  provider: string;
  siteFetch: boolean;
}
