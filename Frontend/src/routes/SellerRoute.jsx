import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// only lets a logged-in seller through
const SellerRoute = () => {
  const currentSeller = useSelector((state) => state.seller.currentSeller);
  const location = useLocation();

  if (!currentSeller) {
    return <Navigate to="/seller/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default SellerRoute;
