import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Admin } from "@/pages/Admin";
import { MovieEvents } from "@/pages/MovieEvents";
import { Header } from "@/components/Header";
import AdminLogin from "@/pages/Admin/Login";
import { AuthService } from "@/services/authService";
import useSessionStore from "@/stores/sessionStore";
import { routeConstants } from "@/routing/routeConstants";
import { Box, CircularProgress } from "@mui/material";

const useAuth = () => {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const setAuthenticated = useSessionStore((state) => state.setAuthenticated);
  const [isValidating, setIsValidating] = useState(true);

  // Check token validity on app load
  useEffect(() => {
    const checkAuth = async () => {
      setIsValidating(true);

      if (!AuthService.isAuthenticated()) {
        // No token stored, definitely not authenticated
        setAuthenticated(false);
        setIsValidating(false);
        return;
      }

      // Token exists, validate with server
      const isValid = await AuthService.validateToken();
      setAuthenticated(isValid);
      setIsValidating(false);
    };

    checkAuth();
  }, [setAuthenticated]);

  const logout = useCallback(() => {
    AuthService.logout();
    setAuthenticated(false);
  }, [setAuthenticated]);

  return {
    isAuthenticated,
    isValidating,
    logout,
  };
};

// Layout for public routes (no auth required)
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

// Layout for admin routes (auth required)
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isValidating } = useAuth();

  // Show loading while validating token
  if (isValidating) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

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

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  const handleLoginSuccess = () => {
    useSessionStore.getState().setAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        {/* Public route - MovieEvents (no auth required) */}
        <Route
          path={routeConstants.HOME}
          element={
            <PublicLayout>
              <MovieEvents />
            </PublicLayout>
          }
        />

        {/* Auth route - Admin login */}
        <Route
          path={routeConstants.AUTH}
          element={
            isAuthenticated ? (
              <Navigate to={routeConstants.ADMIN} replace />
            ) : (
              <AdminLogin onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* Protected admin route */}
        <Route
          path={routeConstants.ADMIN}
          element={
            <AdminLayout>
              <Admin />
            </AdminLayout>
          }
        />

        {/* Catch all - redirect to home */}
        <Route
          path="*"
          element={<Navigate to={routeConstants.HOME} replace />}
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;
