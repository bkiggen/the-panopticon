import { useCallback, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Admin } from "@/pages/Admin";
import { MovieEvents } from "@/pages/MovieEvents";
import { Education } from "@/pages/Education";
import { ClassDetail } from "@/pages/Education/ClassDetail";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import AdminLogin from "@/pages/Admin/Login";
import MagicLinkVerify from "@/pages/Admin/MagicLinkVerify";
import { AuthService } from "@/services/authService";
import useSessionStore from "@/stores/sessionStore";
import { routeConstants } from "@/routing/routeConstants";
import { Box, CircularProgress } from "@mui/material";

const useAuth = () => {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated);
  const setAuthenticated = useSessionStore((state) => state.setAuthenticated);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsValidating(true);

      if (!AuthService.isAuthenticated()) {
        setAuthenticated(false);
        setIsValidating(false);
        return;
      }

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

  return { isAuthenticated, isValidating, logout };
};

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    {children}
    <Footer />
  </>
);

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isValidating } = useAuth();

  if (isValidating) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
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
      <Footer />
    </>
  );
};

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path={routeConstants.HOME}
          element={<PublicLayout><MovieEvents /></PublicLayout>}
        />

        <Route
          path={routeConstants.AUTH}
          element={
            isAuthenticated
              ? <Navigate to={routeConstants.ADMIN} replace />
              : <AdminLogin onLoginSuccess={() => {}} />
          }
        />

        <Route path={routeConstants.MAGIC_LINK} element={<MagicLinkVerify />} />

        <Route
          path={routeConstants.ADMIN}
          element={<AdminLayout><Admin /></AdminLayout>}
        />

        <Route path={routeConstants.EDUCATION} element={<Education />} />
        <Route path={routeConstants.EDUCATION_CLASS} element={<ClassDetail />} />

        <Route path="*" element={<Navigate to={routeConstants.HOME} replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
