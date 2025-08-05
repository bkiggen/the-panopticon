import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Admin } from "./pages/Admin";
import { Showtimes } from "./pages/Showtimes";
import { Header } from "./components/Header";

const routesConstants = {
  HOME: "/",
  ADMIN: "/admin",
};

const useAuth = () => {
  const isAuthenticated = true; // TODO
  return { isAuthenticated };
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <div>
      <Header />
      <Router>
        <Routes>
          {/* Home route shows Showtimes */}
          <Route path={routesConstants.HOME} element={<Showtimes />} />

          {/* Protected admin route */}
          <Route
            path={routesConstants.ADMIN}
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route
            path="*"
            element={<Navigate to={routesConstants.HOME} replace />}
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
