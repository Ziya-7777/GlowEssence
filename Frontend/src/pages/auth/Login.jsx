import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../features/users/userSlicer";
import { logoutSeller } from "../../features/sellers/sellerSlicer";
import "./Auth.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.users);

  // "verified" comes from the email verification link redirect,
  // e.g. /login?verified=success or /login?verified=failed
  const [searchParams] = useSearchParams();
  const verified = searchParams.get("verified");

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      // clear any leftover seller session so the navbar doesn't get confused
      // about which role is actually logged in right now
      dispatch(logoutSeller());
      navigate("/");
    } catch {
      // error message is already saved in redux state, nothing else to do
    }
  };

  return (
    <div className="ge-auth-page">
      <div className="ge-auth-visual">
        <div className="ge-auth-visual-content">
          <span className="ge-eyebrow">Welcome Back</span>
          <h2>Your glow routine missed you.</h2>
          <p>
            Sign in to track orders, save your favorite products, and get
            early access to new beauty drops.
          </p>
        </div>
      </div>

      <div className="ge-auth-form-side">
        <div className="ge-auth-card">
          <h1 className="ge-auth-title">Sign In</h1>
          <p className="ge-auth-subtitle">
            Enter your details to access your GlowEssence account.
          </p>

          {verified === "success" && (
            <p className="ge-auth-alert ge-auth-alert-success">
              Email verified successfully. You can now log in.
            </p>
          )}
          {verified === "failed" && (
            <p className="ge-auth-alert ge-auth-alert-error">
              That verification link is invalid or has expired.
            </p>
          )}

          {error && (
            <p className="ge-auth-alert ge-auth-alert-error">{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="ge-form-group">
              <label className="ge-label" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="ge-form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="ge-form-group">
              <label className="ge-label" htmlFor="login-password">
                Password
              </label>
              <div className="ge-password-field">
                <input
                  id="login-password"
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

            <div className="ge-form-row-between">
              <label className="ge-checkbox-label">
                <input type="checkbox" />
                Remember me
              </label>
              <Link to="/forgot-password" className="ge-link-gold">
                Forgot password?
              </Link>
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
            Don't have an account?{" "}
            <Link to="/register" className="ge-link-gold">
              Create one
            </Link>
          </p>

          <p className="ge-auth-footer-text">
            Are you a seller?{" "}
            <Link to="/seller/login" className="ge-link-gold">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
