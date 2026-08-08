import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  changePassword,
  fetchUserProfile,
  logoutUser,
  updateUserProfile,
} from "../../features/users/userSlicer";
import "./Profile.css";

const TABS = [
  { key: "info", label: "Profile Info", icon: "bi-person" },
  { key: "orders", label: "Order History", icon: "bi-bag-check" },
  { key: "addresses", label: "Addresses", icon: "bi-geo-alt" },
  { key: "security", label: "Security", icon: "bi-shield-lock" },
];

const ORDERS = [
  { id: "#GE-10432", date: "July 2, 2026", status: "delivered", total: "$68.00" },
  { id: "#GE-10387", date: "June 18, 2026", status: "shipped", total: "$124.50" },
  { id: "#GE-10312", date: "May 29, 2026", status: "processing", total: "$42.00" },
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("info");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentUser, profile, error, message } = useSelector(
    (state) => state.users
  );

  // load the real logged-in user's details (login only gives us id + name)
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchUserProfile(currentUser.id));
    }
  }, [dispatch, currentUser]);

  const displayName = profile?.name || currentUser?.name || "";
  const displayEmail = profile?.email || "";

  // turn "Jane Doe" into "JD" for the avatar circle
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  // ---------- Profile Info: view / edit toggle ----------

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
  });
  const [infoBackup, setInfoBackup] = useState(null);

  // whenever the real profile arrives, fill the form with real values.
  // Adjusting state during render (instead of in an effect) avoids an
  // extra, unnecessary re-render.
  const [prevProfile, setPrevProfile] = useState(null);
  if (profile && profile !== prevProfile) {
    setPrevProfile(profile);
    setInfoForm((prev) => ({
      ...prev,
      firstName: profile.name || "",
      email: profile.email || "",
    }));
  }

  const handleEditInfo = () => {
    setInfoBackup(infoForm); // remember current values in case user cancels
    setIsEditingInfo(true);
  };

  const handleCancelInfo = () => {
    setInfoForm(infoBackup);
    setIsEditingInfo(false);
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault();

    try {
      // NOTE: only name + email actually exist on the backend User model,
      // so only those two get saved. Last Name / Phone / Skin Type are
      // kept in this page's memory only, and reset if you refresh.
      await dispatch(
        updateUserProfile({
          id: currentUser.id,
          updates: { name: infoForm.firstName, email: infoForm.email },
        })
      ).unwrap();

      setIsEditingInfo(false);
    } catch {
      // error message is already saved in redux state, nothing else to do
    }
  };

  // ---------- Addresses: local list with edit / delete / add ----------
  // starts empty - the user adds their own addresses with "Add New Address".
  // NOTE: kept in this page's memory only, not saved to a database,
  // since there's no "addresses" feature on the backend yet.

  const [addresses, setAddresses] = useState([]);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    tag: "",
    line1: "",
    line2: "",
    phone: "",
  });

  const handleEditAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressForm(address);
  };

  const handleCancelAddress = () => {
    setEditingAddressId(null);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();

    setAddresses((prev) =>
      prev.map((address) =>
        address.id === editingAddressId
          ? { ...addressForm, id: editingAddressId }
          : address
      )
    );

    setEditingAddressId(null);
  };

  const handleRemoveAddress = (id) => {
    setAddresses((prev) => prev.filter((address) => address.id !== id));
  };

  const handleAddAddress = () => {
    const newAddress = {
      id: Date.now(), // simple way to get a unique id
      tag: "New",
      line1: "",
      line2: "",
      phone: "",
    };

    setAddresses((prev) => [...prev, newAddress]);
    handleEditAddress(newAddress); // open it in edit mode right away
  };

  // ---------- Security: change password ----------

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordFormError, setPasswordFormError] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordFormError("");

    if (newPassword !== confirmNewPassword) {
      setPasswordFormError("New passwords do not match.");
      return;
    }

    try {
      await dispatch(
        changePassword({ id: currentUser.id, currentPassword, newPassword })
      ).unwrap();

      // clear the fields once the password is changed successfully
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch {
      // error message is already saved in redux state, nothing else to do
    }
  };

  return (
    <div className="ge-profile-page">
      <div className="ge-profile-header">
        <h1>My Account</h1>
        <p>Manage your profile, orders, and account settings.</p>
      </div>

      <div className="ge-profile-layout">
        <aside className="ge-profile-sidebar ge-card">
          <div className="ge-profile-avatar">{initials}</div>
          <h3>{displayName}</h3>
          <div className="ge-profile-email">{displayEmail}</div>

          <ul className="ge-profile-nav">
            {TABS.map((tab) => (
              <li key={tab.key}>
                <button
                  className={activeTab === tab.key ? "active" : ""}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <i className={`bi ${tab.icon}`}></i> {tab.label}
                </button>
              </li>
            ))}
            <li>
              <button className="logout" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Log Out
              </button>
            </li>
          </ul>
        </aside>

        <section className="ge-profile-content ge-card">
          {activeTab === "info" && (
            <>
              <div className="ge-profile-section-head">
                <h2>Profile Information</h2>
                {!isEditingInfo && (
                  <button
                    type="button"
                    className="ge-btn-outline"
                    onClick={handleEditInfo}
                  >
                    <i className="bi bi-pencil"></i> Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveInfo}>
                <div className="ge-profile-grid">
                  <div className="ge-form-group">
                    <label className="ge-label" htmlFor="p-first">First Name</label>
                    {isEditingInfo ? (
                      <input
                        id="p-first"
                        className="ge-form-control"
                        value={infoForm.firstName}
                        onChange={(e) =>
                          setInfoForm({ ...infoForm, firstName: e.target.value })
                        }
                      />
                    ) : (
                      <p className="ge-profile-view-value">
                        {infoForm.firstName || "Not set"}
                      </p>
                    )}
                  </div>

                  <div className="ge-form-group">
                    <label className="ge-label" htmlFor="p-last">Last Name</label>
                    {isEditingInfo ? (
                      <input
                        id="p-last"
                        className="ge-form-control"
                        value={infoForm.lastName}
                        onChange={(e) =>
                          setInfoForm({ ...infoForm, lastName: e.target.value })
                        }
                      />
                    ) : (
                      <p className="ge-profile-view-value">
                        {infoForm.lastName || "Not set"}
                      </p>
                    )}
                  </div>

                  <div className="ge-form-group">
                    <label className="ge-label" htmlFor="p-email">Email Address</label>
                    {isEditingInfo ? (
                      <input
                        id="p-email"
                        type="email"
                        className="ge-form-control"
                        value={infoForm.email}
                        onChange={(e) =>
                          setInfoForm({ ...infoForm, email: e.target.value })
                        }
                      />
                    ) : (
                      <p className="ge-profile-view-value">
                        {infoForm.email || "Not set"}
                      </p>
                    )}
                  </div>

                  <div className="ge-form-group">
                    <label className="ge-label" htmlFor="p-phone">Phone Number</label>
                    {isEditingInfo ? (
                      <input
                        id="p-phone"
                        className="ge-form-control"
                        value={infoForm.phone}
                        onChange={(e) =>
                          setInfoForm({ ...infoForm, phone: e.target.value })
                        }
                      />
                    ) : (
                      <p className="ge-profile-view-value">
                        {infoForm.phone || "Not set"}
                      </p>
                    )}
                  </div>

                  <div className="ge-form-group full">
                    <label className="ge-label" htmlFor="p-bio">Skin Type / Notes</label>
                    {isEditingInfo ? (
                      <input
                        id="p-bio"
                        className="ge-form-control"
                        placeholder="e.g. Combination skin, fragrance-sensitive"
                        value={infoForm.bio}
                        onChange={(e) =>
                          setInfoForm({ ...infoForm, bio: e.target.value })
                        }
                      />
                    ) : (
                      <p className="ge-profile-view-value">
                        {infoForm.bio || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                {isEditingInfo && (
                  <div className="ge-profile-save">
                    <button type="submit" className="ge-btn-gold">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="ge-btn-outline"
                      onClick={handleCancelInfo}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </>
          )}

          {activeTab === "orders" && (
            <>
              <h2>Order History</h2>
              {ORDERS.map((order) => (
                <div className="ge-order-item" key={order.id}>
                  <div className="ge-order-thumb">
                    <i className="bi bi-bag"></i>
                  </div>
                  <div className="ge-order-info">
                    <div className="ge-order-title">{order.id}</div>
                    <div className="ge-order-date">{order.date}</div>
                  </div>
                  <span className={`ge-order-status ${order.status}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span className="ge-order-total">{order.total}</span>
                </div>
              ))}
            </>
          )}

          {activeTab === "addresses" && (
            <>
              <h2>Saved Addresses</h2>

              {addresses.length === 0 && (
                <p className="ge-profile-view-value">
                  You haven't added any addresses yet.
                </p>
              )}

              {addresses.map((address) => (
                <div className="ge-address-card" key={address.id}>
                  {editingAddressId === address.id ? (
                    <form onSubmit={handleSaveAddress}>
                      <div className="ge-form-group">
                        <label className="ge-label">Label</label>
                        <input
                          className="ge-form-control"
                          placeholder="e.g. Home, Work"
                          value={addressForm.tag}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, tag: e.target.value })
                          }
                        />
                      </div>

                      <div className="ge-form-group">
                        <label className="ge-label">Address Line</label>
                        <input
                          className="ge-form-control"
                          value={addressForm.line1}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, line1: e.target.value })
                          }
                        />
                      </div>

                      <div className="ge-form-group">
                        <label className="ge-label">City / State / Country</label>
                        <input
                          className="ge-form-control"
                          value={addressForm.line2}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, line2: e.target.value })
                          }
                        />
                      </div>

                      <div className="ge-form-group">
                        <label className="ge-label">Phone</label>
                        <input
                          className="ge-form-control"
                          value={addressForm.phone}
                          onChange={(e) =>
                            setAddressForm({ ...addressForm, phone: e.target.value })
                          }
                        />
                      </div>

                      <div className="ge-address-actions">
                        <button type="submit">
                          <i className="bi bi-check-lg"></i> Save
                        </button>
                        <button type="button" onClick={handleCancelAddress}>
                          <i className="bi bi-x-lg"></i> Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <span className="ge-address-tag">{address.tag}</span>
                      <p>
                        {displayName} <br />
                        {address.line1} <br />
                        {address.line2} <br />
                        {address.phone}
                      </p>
                      <div className="ge-address-actions">
                        <button onClick={() => handleEditAddress(address)}>
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button onClick={() => handleRemoveAddress(address.id)}>
                          <i className="bi bi-trash"></i> Remove
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              <button type="button" className="ge-btn-outline mt-4" onClick={handleAddAddress}>
                <i className="bi bi-plus-lg"></i> Add New Address
              </button>
            </>
          )}

          {activeTab === "security" && (
            <>
              <h2>Security</h2>

              {passwordFormError && (
                <p className="ge-profile-alert ge-profile-alert-error">
                  {passwordFormError}
                </p>
              )}
              {error && (
                <p className="ge-profile-alert ge-profile-alert-error">{error}</p>
              )}
              {message && (
                <p className="ge-profile-alert ge-profile-alert-success">
                  {message}
                </p>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="ge-profile-grid">
                  <div className="ge-form-group full">
                    <label className="ge-label" htmlFor="p-current">Current Password</label>
                    <input
                      id="p-current"
                      type="password"
                      className="ge-form-control"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ge-form-group">
                    <label className="ge-label" htmlFor="p-new">New Password</label>
                    <input
                      id="p-new"
                      type="password"
                      className="ge-form-control"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ge-form-group">
                    <label className="ge-label" htmlFor="p-confirm">Confirm New Password</label>
                    <input
                      id="p-confirm"
                      type="password"
                      className="ge-form-control"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="ge-profile-save">
                  <button type="submit" className="ge-btn-gold">Update Password</button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
