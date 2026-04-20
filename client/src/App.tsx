import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Home from "./pages/Home";
import ExperimentsPage from "./pages/ExperimentsPage";
import ExperimentDetail from "./pages/ExperimentDetail";
import LoansPage from "./pages/LoansPage";
import BookLoansPage from "./pages/BookLoansPage";
import AdminDashboard from "./pages/AdminDashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/experiments" component={ExperimentsPage} />
      <Route path="/experiments/:id" component={ExperimentDetail} />
      <Route path="/loans" component={LoansPage} />
      <Route path="/book-loans" component={BookLoansPage} />
      <Route path="/admin">
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
