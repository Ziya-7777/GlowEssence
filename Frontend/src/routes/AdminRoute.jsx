import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// only lets a logged-in user with role "admin" through
const AdminRoute = () => {
  const currentUser = useSelector((state) => state.users.currentUser);
  const location = useLocation();

  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
