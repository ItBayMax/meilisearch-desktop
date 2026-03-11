import { Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AppLayout } from "./components/layout/AppLayout";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import IndexDetail from "./pages/IndexDetail";
import Indexes from "./pages/project/Indexes";
import ProjectSettings from "./pages/project/Settings";
import ProjectSearch from "./pages/project/Search";
import ProjectTasks from "./pages/project/Tasks";
import ProjectKeys from "./pages/project/Keys";
import AppSettings from "./pages/AppSettings";

import IndexGeneral from "./pages/index/General";
import IndexDocuments from "./pages/index/Documents";
import Attributes from "./pages/index/Attributes";
import RankingRules from "./pages/index/RankingRules";
import Synonyms from "./pages/index/Synonyms";
import TypoTolerance from "./pages/index/TypoTolerance";
import PrefixSearch from "./pages/index/PrefixSearch";
import StopWords from "./pages/index/StopWords";
import Separators from "./pages/index/Separators";
import Dictionary from "./pages/index/Dictionary";
import IndexPagination from "./pages/index/Pagination";
import IndexFaceting from "./pages/index/Faceting";
import SearchCutoff from "./pages/index/SearchCutoff";
import Embedders from "./pages/index/Embedders";

function App() {
  return (
    <>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/settings" element={<AppSettings />} />
          <Route path="/projects/:id" element={<ProjectDetail />}>
            <Route index element={<Indexes />} />
            <Route path="tasks" element={<ProjectTasks />} />
            <Route path="settings" element={<ProjectSettings />} />
            <Route path="keys" element={<ProjectKeys />} />
            <Route path="search" element={<ProjectSearch />} />
          </Route>
          <Route
            path="/projects/:projectId/indexes/:indexId"
            element={<IndexDetail />}
          >
            <Route index element={<IndexGeneral />} />
            <Route path="documents" element={<IndexDocuments />} />
            <Route path="attributes" element={<Attributes />} />
            <Route path="ranking-rules" element={<RankingRules />} />
            <Route path="synonyms" element={<Synonyms />} />
            <Route path="typo-tolerance" element={<TypoTolerance />} />
            <Route path="prefix-search" element={<PrefixSearch />} />
            <Route path="stop-words" element={<StopWords />} />
            <Route path="separators" element={<Separators />} />
            <Route path="dictionary" element={<Dictionary />} />
            <Route path="pagination" element={<IndexPagination />} />
            <Route path="faceting" element={<IndexFaceting />} />
            <Route path="search-cutoff" element={<SearchCutoff />} />
            <Route path="embedders" element={<Embedders />} />
          </Route>
        </Route>
      </Routes>
      <Toaster
        position="top-right"
        richColors
        closeButton
      />
    </>
  );
}

export default App;
