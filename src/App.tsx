import { useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, FileText, Home, Search } from "lucide-react";
import { getHealth } from "./api";
import { AgentPage } from "./pages/AgentPage";
import { HomePage } from "./pages/HomePage";
import { ReportPage } from "./pages/ReportPage";
import { ResearchPage } from "./pages/ResearchPage";
import type { HealthStatus } from "./types";

function parseRoute() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [page = "", id] = raw.split("/");
  return { page: page || "home", id };
}

function useHashRoute() {
  const [route, setRoute] = useState(parseRoute);
  useEffect(() => {
    const onChange = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

function navTo(path: string) {
  window.location.hash = path;
}

function Header({ health }: { health?: HealthStatus }) {
  return (
    <header className="app-header">
      <a className="brand" href="#/">
        <span className="brand-mark">S</span>
        <span>
          <strong>SupplierScope AI</strong>
          <small>供应商调研 Agent</small>
        </span>
      </a>
      <nav className="nav-links" aria-label="主导航">
        <a href="#/">
          <Home size={16} /> 首页
        </a>
        <a href="#/research">
          <Search size={16} /> 新建调研
        </a>
      </nav>
      <div className="health-pill" title="当前模型运行模式">
        <Activity size={15} />
        <span>{health ? `${health.mode} · ${health.model}` : "checking"}</span>
      </div>
    </header>
  );
}

export function App() {
  const route = useHashRoute();
  const [health, setHealth] = useState<HealthStatus>();

  useEffect(() => {
    getHealth().then(setHealth).catch(() => undefined);
  }, []);

  const page = useMemo(() => {
    if (route.page === "research") return <ResearchPage onCreated={(id) => navTo(`/agent/${id}`)} />;
    if (route.page === "agent" && route.id) return <AgentPage runId={route.id} onOpenReport={(id) => navTo(`/report/${id}`)} />;
    if (route.page === "report" && route.id) return <ReportPage runId={route.id} />;
    return <HomePage health={health} onStart={() => navTo("/research")} />;
  }, [health, route.id, route.page]);

  return (
    <div className="app-shell">
      <Header health={health} />
      <main>{page}</main>
      <footer className="app-footer">
        <span>
          <BarChart3 size={15} /> Agent planning, model calls, structured report
        </span>
        <span>
          <FileText size={15} /> Markdown / JSON export
        </span>
      </footer>
    </div>
  );
}
