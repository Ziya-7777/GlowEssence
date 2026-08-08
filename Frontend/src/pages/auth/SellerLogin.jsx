import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSeller } from "../../features/sellers/sellerSlicer";
import "./Auth.css";

const SellerLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.seller);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(loginSeller({ email, password })).unwrap();
      navigate("/");
    } catch {
      // error message is already saved in redux state, nothing else to do
    }
  };

  return (
    <div className="ge-auth-page">
      <div className="ge-auth-visual">
        <div className="ge-auth-visual-content">
          <span className="ge-eyebrow">Seller Login</span>
          <h2>Manage your store, your way.</h2>
          <p>
            Sign in to your business account to manage your products and
            orders.
          </p>
        </div>
      </div>

      <div className="ge-auth-form-side">
        <div className="ge-auth-card">
          <h1 className="ge-auth-title">Seller Sign In</h1>
          <p className="ge-auth-subtitle">
            Enter your business account details to continue.
          </p>

          {error && (
            <p className="ge-auth-alert ge-auth-alert-error">{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="ge-form-group">
              <label className="ge-label" htmlFor="seller-login-email">
                Email Address
              </label>
              <input
                id="seller-login-email"
                type="email"
                className="ge-form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="ge-form-group">
              <label className="ge-label" htmlFor="seller-login-password">
                Password
              </label>
              <div className="ge-password-field">
                <input
                  id="seller-login-password"
                  type={showPassword ? "text" : "password"}
                  className="ge-form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="ge-password-toggle"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            <div className="ge-auth-submit">
              <button
                type="submit"
                className="ge-btn-gold"
                style={{ width: "100%" }}
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>

          <p className="ge-auth-footer-text">
            Don't have a business account?{" "}
            <Link to="/seller/register" className="ge-link-gold">
              Create one
            </Link>
          </p>

          <p className="ge-auth-footer-text">
            Are you a shopper?{" "}
            <Link to="/login" className="ge-link-gold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;
