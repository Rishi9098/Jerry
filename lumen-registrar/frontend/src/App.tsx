import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/shell/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { StudentsListPage } from "./pages/StudentsListPage";
import { AdmissionsPage } from "./pages/AdmissionsPage";
import { StudentProfilePage } from "./pages/StudentProfilePage";
import { StudentEditPage } from "./pages/StudentEditPage";
import { GradesPage } from "./pages/GradesPage";
import { CoursesPage } from "./pages/CoursesPage";
import { DegreeAuditPage } from "./pages/DegreeAuditPage";
import { AtRiskInterventionsPage } from "./pages/AtRiskInterventionsPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsListPage />} />
        <Route path="students/new" element={<AdmissionsPage />} />
        <Route path="students/:id" element={<StudentProfilePage />} />
        <Route path="students/:id/edit" element={<StudentEditPage />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="degree-audit" element={<DegreeAuditPage />} />
        <Route path="at-risk" element={<AtRiskInterventionsPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/index.html" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
