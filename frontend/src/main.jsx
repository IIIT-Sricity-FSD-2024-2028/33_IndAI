import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useOutletContext,
} from "react-router-dom";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./redux/store.js";
import { useResource } from "./hooks/api.js";
import { Shell } from "./components/Shell.jsx";
import { Empty, ErrorText } from "./components/Common.jsx";
import { Auth } from "./pages/Auth.jsx";
import { Overview } from "./pages/Overview.jsx";
import { Home } from "./pages/Home.jsx";
const Trading = lazy(() =>
  import("./pages/Trading.jsx").then((module) => ({ default: module.Trading })),
);
import { Portfolio, Journal } from "./pages/Portfolio.jsx";
import { Plans } from "./pages/Plans.jsx";
import { Guidance } from "./pages/Guidance.jsx";
import { Courses, Course } from "./pages/Courses.jsx";
import { Tasks } from "./pages/Tasks.jsx";
const Members = lazy(() =>
  import("./pages/Members.jsx").then((module) => ({ default: module.Members })),
);
const Member = lazy(() =>
  import("./pages/Members.jsx").then((module) => ({ default: module.Member })),
);
const Quizzes = lazy(() =>
  import("./pages/Quizzes.jsx").then((module) => ({ default: module.Quizzes })),
);
const Quiz = lazy(() =>
  import("./pages/Quizzes.jsx").then((module) => ({ default: module.Quiz })),
);
const QuizBuilder = lazy(() =>
  import("./pages/Quizzes.jsx").then((module) => ({
    default: module.QuizBuilder,
  })),
);
import { Learners } from "./pages/Learners.jsx";
const Provider = lazy(() =>
  import("./pages/Provider.jsx").then((module) => ({
    default: module.Provider,
  })),
);
const Commerce = lazy(() =>
  import("./pages/Provider.jsx").then((module) => ({
    default: module.Commerce,
  })),
);
import { Notifications, Support, Ticket, Admin } from "./pages/Operations.jsx";
import "./style.css";
import { ThemeProvider } from "./hooks/useTheme.jsx";

function Gate({ children, roles }) {
  const user = useOutletContext();
  return user.status !== "approved" ? (
    <Navigate to="/overview" replace />
  ) : roles && !roles.includes(user.role) ? (
    <Empty>This page is unavailable for your role.</Empty>
  ) : (
    children
  );
}
function Workspace() {
  const session = useResource("/me", { refetchInterval: 30000 });
  if (session.isPending) return <main className="center">Opening IndAI…</main>;
  if (session.error?.status === 401) return <Navigate to="/login" replace />;
  if (session.isError)
    return (
      <main className="center">
        <ErrorText error={session.error} />
        <button onClick={() => session.refetch()} className="button">
          Retry
        </button>
      </main>
    );
  return <Shell user={session.data} />;
}
const student = ["student"];
createRoot(document.querySelector("#root")).render(
  <StrictMode>
    <ReduxProvider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <Suspense
            fallback={
              <main className="center" role="status">
                Opening workspace…
              </main>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/login"
                element={<Auth key="login" mode="login" />}
              />
              <Route
                path="/register"
                element={<Auth key="register" mode="register" />}
              />
              <Route
                path="/recovery"
                element={<Auth key="recovery" mode="recovery" />}
              />
              <Route element={<Workspace />}>
                <Route path="overview" element={<Overview />} />
                <Route
                  path="trading"
                  element={
                    <Gate roles={["student", "instructor"]}>
                      <Suspense
                        fallback={
                          <p role="status">Loading trading workspace…</p>
                        }
                      >
                        <Trading />
                      </Suspense>
                    </Gate>
                  }
                />
                <Route
                  path="portfolio"
                  element={
                    <Gate roles={["student", "instructor"]}>
                      <Portfolio />
                    </Gate>
                  }
                />
                <Route
                  path="journal"
                  element={
                    <Gate roles={["student", "instructor"]}>
                      <Journal />
                    </Gate>
                  }
                />
                <Route
                  path="plans"
                  element={
                    <Gate roles={student}>
                      <Plans />
                    </Gate>
                  }
                />
                <Route
                  path="guidance"
                  element={
                    <Gate roles={["student", "instructor", "provider"]}>
                      <Guidance />
                    </Gate>
                  }
                />
                <Route
                  path="tasks"
                  element={
                    <Gate roles={["student", "instructor", "provider"]}>
                      <Tasks />
                    </Gate>
                  }
                />
                <Route
                  path="courses"
                  element={
                    <Gate
                      roles={[
                        "student",
                        "instructor",
                        "provider",
                        "superadmin",
                      ]}
                    >
                      <Courses />
                    </Gate>
                  }
                />
                <Route
                  path="courses/:id"
                  element={
                    <Gate
                      roles={[
                        "student",
                        "instructor",
                        "provider",
                        "superadmin",
                      ]}
                    >
                      <Course />
                    </Gate>
                  }
                />
                <Route
                  path="members"
                  element={
                    <Gate roles={["admin", "superadmin"]}>
                      <Members />
                    </Gate>
                  }
                />
                <Route
                  path="members/:id"
                  element={
                    <Gate roles={["admin", "superadmin"]}>
                      <Member />
                    </Gate>
                  }
                />
                <Route
                  path="learners"
                  element={
                    <Gate roles={["instructor"]}>
                      <Learners />
                    </Gate>
                  }
                />
                <Route
                  path="provider"
                  element={
                    <Gate roles={["provider"]}>
                      <Provider />
                    </Gate>
                  }
                />
                <Route
                  path="commerce"
                  element={
                    <Gate roles={["admin", "superadmin"]}>
                      <Commerce />
                    </Gate>
                  }
                />
                <Route
                  path="quizzes"
                  element={
                    <Gate>
                      <Quizzes />
                    </Gate>
                  }
                />
                <Route
                  path="quizzes/new"
                  element={
                    <Gate roles={["instructor", "provider"]}>
                      <QuizBuilder />
                    </Gate>
                  }
                />
                <Route
                  path="quizzes/:id/edit"
                  element={
                    <Gate roles={["instructor", "provider"]}>
                      <QuizBuilder />
                    </Gate>
                  }
                />
                <Route
                  path="quizzes/:id"
                  element={
                    <Gate>
                      <Quiz />
                    </Gate>
                  }
                />
                <Route path="notifications" element={<Notifications />} />
                <Route path="support" element={<Support />} />
                <Route path="support/:id" element={<Ticket />} />
                <Route
                  path="admin"
                  element={
                    <Gate roles={["admin", "superadmin"]}>
                      <Admin />
                    </Gate>
                  }
                />
                <Route path="*" element={<Empty>Page not found.</Empty>} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </ReduxProvider>
  </StrictMode>,
);
