import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
  fetchAllSellers,
  deleteSellerByAdmin,
  fetchDashboardSummary,
  fetchMonthlyRevenue,
  fetchTopProducts,
  fetchRecentOrders,
} from "../../features/admin/adminSlicer";
import "./AdminDashboard.css";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.users);
  const {
    users,
    sellers,
    summary,
    monthlyRevenue,
    topProducts,
    recentOrders,
    isLoading,
    error,
    message,
  } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("overview");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "user" });

  useEffect(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchMonthlyRevenue());
    dispatch(fetchTopProducts());
    dispatch(fetchRecentOrders());
    dispatch(fetchAllUsers());
    dispatch(fetchAllSellers());
  }, [dispatch]);

  // the admin should never see/edit/delete their own account in this table
  const manageableUsers = users.filter((user) => user._id !== currentUser?.id);

  const handleEditClick = (user) => {
    setEditingId(user._id);
    setEditForm({ name: user.name, email: user.email, role: user.role });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (e, id) => {
    e.preventDefault();

    try {
      await dispatch(updateUserByAdmin({ id, updates: editForm })).unwrap();
      setEditingId(null);
    } catch {
      // error message is already saved in redux state, nothing else to do
    }
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This cannot be undone."
    );

    if (confirmed) {
      dispatch(deleteUserByAdmin(id));
    }
  };

  const handleDeleteSeller = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this seller? This cannot be undone."
    );

    if (confirmed) {
      dispatch(deleteSellerByAdmin(id));
    }
  };

  // highest revenue value, used so every bar's height is relative to it
  const maxRevenue = Math.max(1, ...monthlyRevenue.map((entry) => entry.revenue));
  const maxSold = Math.max(1, ...topProducts.map((entry) => entry.totalSold));

  return (
    <div className="ge-admin-page">
      <div className="ge-admin-header">
        <h1>Admin Dashboard</h1>
        <p>An overview of your store, and your registered customers.</p>
      </div>

      <div className="ge-admin-tabs">
        <button
          type="button"
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Manage Users
        </button>
        <button
          type="button"
          className={activeTab === "sellers" ? "active" : ""}
          onClick={() => setActiveTab("sellers")}
        >
          Manage Sellers
        </button>
      </div>

      {error && <p className="ge-admin-alert ge-admin-alert-error">{error}</p>}
      {message && (
        <p className="ge-admin-alert ge-admin-alert-success">{message}</p>
      )}

      {activeTab === "overview" && (
        <>
          <div className="ge-admin-stats">
            <div className="ge-admin-stat-card">
              <span>Total Users</span>
              <h3>{summary?.totalUsers ?? "—"}</h3>
            </div>
            <div className="ge-admin-stat-card">
              <span>Total Sellers</span>
              <h3>{summary?.totalSellers ?? "—"}</h3>
            </div>
            <div className="ge-admin-stat-card">
              <span>Total Products</span>
              <h3>{summary?.totalProducts ?? "—"}</h3>
            </div>
            <div className="ge-admin-stat-card">
              <span>Total Orders</span>
              <h3>{summary?.totalOrders ?? "—"}</h3>
            </div>
            <div className="ge-admin-stat-card">
              <span>Total Revenue</span>
              <h3>₹ {summary?.totalRevenue ?? 0}</h3>
            </div>
          </div>

          <div className="ge-admin-charts">
            <div className="ge-admin-chart-card">
              <h2>Monthly Revenue</h2>

              {monthlyRevenue.length === 0 ? (
                <p className="ge-admin-empty">No orders yet.</p>
              ) : (
                <div className="ge-admin-bar-chart">
                  {monthlyRevenue.map((entry) => (
                    <div className="ge-admin-bar" key={entry._id.month}>
                      <span className="ge-admin-bar-value">₹{entry.revenue}</span>
                      <div
                        className="ge-admin-bar-fill"
                        style={{
                          height: `${(entry.revenue / maxRevenue) * 100}%`,
                        }}
                      ></div>
                      <span className="ge-admin-bar-label">
                        {MONTH_NAMES[entry._id.month - 1]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ge-admin-chart-card">
              <h2>Top Selling Products</h2>

              {topProducts.length === 0 ? (
                <p className="ge-admin-empty">No sales yet.</p>
              ) : (
                <div className="ge-admin-hbar-chart">
                  {topProducts.map((entry) => (
                    <div className="ge-admin-hbar-row" key={entry._id}>
                      <span className="ge-admin-hbar-label">
                        {entry.product?.name || "Unknown"}
                      </span>
                      <div className="ge-admin-hbar-track">
                        <div
                          className="ge-admin-hbar-fill"
                          style={{
                            width: `${(entry.totalSold / maxSold) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="ge-admin-hbar-value">{entry.totalSold} sold</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="ge-admin-chart-card ge-admin-recent-orders">
            <h2>Recent Orders</h2>

            {recentOrders.length === 0 ? (
              <p className="ge-admin-empty">No orders yet.</p>
            ) : (
              <div className="ge-admin-table-wrap">
                <table className="ge-admin-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>{order.user?.name || "Unknown"}</td>
                        <td>{order.product?.name || "Unknown"}</td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "users" && (
        <>
          {isLoading && <p>Loading users...</p>}

          {!isLoading && manageableUsers.length === 0 && (
            <p>No other users found.</p>
          )}

          {!isLoading && manageableUsers.length > 0 && (
            <div className="ge-admin-table-wrap">
              <table className="ge-admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manageableUsers.map((user) => (
                    <tr key={user._id}>
                      {editingId === user._id ? (
                        <>
                          <td>
                            <input
                              className="ge-form-control"
                              value={editForm.name}
                              onChange={(e) =>
                                setEditForm({ ...editForm, name: e.target.value })
                              }
                            />
                          </td>
                          <td>
                            <input
                              className="ge-form-control"
                              type="email"
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm({ ...editForm, email: e.target.value })
                              }
                            />
                          </td>
                          <td>
                            <select
                              className="ge-form-control"
                              value={editForm.role}
                              onChange={(e) =>
                                setEditForm({ ...editForm, role: e.target.value })
                              }
                            >
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                          </td>
                          <td>{user.isVerified ? "Yes" : "No"}</td>
                          <td className="ge-admin-actions">
                            <button
                              type="button"
                              className="ge-btn-gold"
                              onClick={(e) => handleSaveEdit(e, user._id)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="ge-btn-outline"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span
                              className={`ge-admin-role ge-admin-role-${user.role}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td>{user.isVerified ? "Yes" : "No"}</td>
                          <td className="ge-admin-actions">
                            <button type="button" onClick={() => handleEditClick(user)}>
                              <i className="bi bi-pencil"></i> Edit
                            </button>
                            <button
                              type="button"
                              className="ge-admin-delete"
                              onClick={() => handleDelete(user._id)}
                            >
                              <i className="bi bi-trash"></i> Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {activeTab === "sellers" && (
        <>
          {isLoading && <p>Loading sellers...</p>}

          {!isLoading && sellers.length === 0 && <p>No sellers found.</p>}

          {!isLoading && sellers.length > 0 && (
            <div className="ge-admin-table-wrap">
              <table className="ge-admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Business</th>
                    <th>GSTIN</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller) => (
                    <tr key={seller._id}>
                      <td>{seller.name}</td>
                      <td>{seller.email}</td>
                      <td>{seller.businessName || "—"}</td>
                      <td>{seller.gstin}</td>
                      <td className="ge-admin-actions">
                        <button
                          type="button"
                          className="ge-admin-delete"
                          onClick={() => handleDeleteSeller(seller._id)}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;