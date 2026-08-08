import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchSellerProfileDetails,
  logoutSeller,
} from "../../features/sellers/sellerSlicer";
import "./SellerProfile.css";

const SellerProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentSeller, profile } = useSelector((state) => state.seller);

  useEffect(() => {
    if (currentSeller) {
      dispatch(fetchSellerProfileDetails(currentSeller.id));
    }
  }, [dispatch, currentSeller]);

  const handleLogout = () => {
    dispatch(logoutSeller());
    navigate("/");
  };

  return (
    <div className="ge-seller-profile-page">
      <div className="ge-seller-profile-card">
        <div className="ge-seller-profile-header">
          <div className="ge-seller-profile-avatar">
            {profile?.name ? profile.name[0].toUpperCase() : "S"}
          </div>
          <div>
            <h1>{profile?.name || currentSeller?.name}</h1>
            <span className="ge-seller-status ge-seller-status-approved">
              Active Seller
            </span>
          </div>
        </div>

        <div className="ge-seller-profile-details">
          <div className="ge-seller-profile-row">
            <span className="ge-label">Business Name</span>
            <p>{profile?.businessName || "Not set"}</p>
          </div>
          <div className="ge-seller-profile-row">
            <span className="ge-label">Email Address</span>
            <p>{profile?.email}</p>
          </div>
          <div className="ge-seller-profile-row">
            <span className="ge-label">Phone Number</span>
            <p>{profile?.phoneNumber}</p>
          </div>
          <div className="ge-seller-profile-row">
            <span className="ge-label">GSTIN</span>
            <p>{profile?.gstin}</p>
          </div>
          <div className="ge-seller-profile-row full">
            <span className="ge-label">Business Address</span>
            <p>{profile?.address}</p>
          </div>
        </div>

        <button type="button" className="ge-btn-outline" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i> Log Out
        </button>
      </div>
    </div>
  );
};

export default SellerProfile;
