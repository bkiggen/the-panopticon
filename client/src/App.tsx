import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Admin } from "./pages/Admin";
import { Showtimes } from "./pages/Showtimes";
import { Header } from "./components/Header";
import PayphoneAuth from "./pages/Auth/Payphone";
import useSessionStore from "./stores/sessionStore";
import { routeConstants } from "./routing/routeConstants";

const useAuth = () => {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  return { isAuthenticated };
};

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={routeConstants.AUTH} replace />;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
};

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Auth route - only show if not authenticated */}
        <Route
          path={routeConstants.AUTH}
          element={
            isAuthenticated ? (
              <Navigate to={routeConstants.HOME} replace />
            ) : (
              <PayphoneAuth />
            )
          }
        />

        {/* Protected routes with header */}
        <Route
          path={routeConstants.HOME}
          element={
            <AuthenticatedLayout>
              <Showtimes />
            </AuthenticatedLayout>
          }
        />

        <Route
          path={routeConstants.ADMIN}
          element={
            <AuthenticatedLayout>
              <Admin />
            </AuthenticatedLayout>
          }
        />

        {/* Catch all - redirect based on auth status */}
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated ? routeConstants.HOME : routeConstants.AUTH}
              replace
            />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
