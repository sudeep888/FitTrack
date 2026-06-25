import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { WorkoutLog } from "./pages/WorkoutLog";
import { Progress } from "./pages/Progress";
import { Analytics } from "./pages/Analytics";
import { Calculators } from "./pages/Calculators";
import { Goals } from "./pages/Goals";
import { Records } from "./pages/Records";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="workouts" element={<WorkoutLog />} />
            <Route path="progress" element={<Progress />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="calculators" element={<Calculators />} />
            <Route path="goals" element={<Goals />} />
            <Route path="records" element={<Records />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
