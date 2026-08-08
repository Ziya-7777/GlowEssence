import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerSeller } from "../../features/sellers/sellerSlicer";
import "./Auth.css";

const SellerRegister = () => {
  const dispatch = useDispatch();
  const { isLoading, error, message } = useSelector((state) => state.seller);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setFormError("Please agree to the Terms & Seller Policy.");
      return;
    }

    dispatch(
      registerSeller({
        name,
        businessName,
        email,
        phoneNumber,
        gstin,
        address,
        password,
      })
    );
  };

  return (
    <div className="ge-auth-page">
      <div className="ge-auth-visual">
        <div className="ge-auth-visual-content">
          <span className="ge-eyebrow">Sell on GlowEssence</span>
          <h2>Grow your beauty business with us.</h2>
          <p>
            Create a business account to list your products and reach
            thousands of beauty lovers.
          </p>
        </div>
      </div>

      <div className="ge-auth-form-side">
        <div className="ge-auth-card">
          <h1 className="ge-auth-title">Create Business Account</h1>
          <p className="ge-auth-subtitle">
            Tell us about your business to start selling on GlowEssence.
          </p>

          {formError && (
            <p className="ge-auth-alert ge-auth-alert-error">{formError}</p>
          )}
          {error && (
            <p className="ge-auth-alert ge-auth-alert-error">{error}</p>
          )}
          {message && (
            <p className="ge-auth-alert ge-auth-alert-success">{message}</p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="ge-form-group">
              <label className="ge-label" htmlFor="seller-name">
                Owner Full Name
              </label>
              <input
                id="seller-name"
                type="text"
                className="ge-form-control"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="ge-form-group">
              <label className="ge-label" htmlFor="seller-business-name">
                Business Name
              </label>
              <input
                id="seller-business-name"
                type="text"
                className="ge-form-control"
                placeholder="Glow Beauty Store"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div className="ge-form-group">
              <label className="ge-label" htmlFor="seller-email">
                Email Address
              </label>
              <input
                id="seller-email"
                type="email"
                className="ge-form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="ge-form-group">
              <label className="ge-label" htmlFor="seller-phone">
                Phone Number
              </label>
              <input
                id="seller-phone"
                type="tel"
                className="ge-form-control"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="ge-form-group">
              <label className="ge-label" htmlFor="seller-gstin">
                GSTIN
              </label>
              <input
                id="seller-gstin"
                type="text"
                className="ge-form-control"
                placeholder="22AAAAA0000A1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                required
              />
            </div>

            <div className="ge-form-group">
              <label className="ge-label" htmlFor="seller-address">
                Business Address
              </label>
              <textarea
                id="seller-address"
                rows="2"
                className="ge-form-control"
                placeholder="Shop no, street, city, state, pincode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="ge-form-group">
              <label className="ge-label" htmlFor="seller-password">
                Password
              </label>
              <div className="ge-password-field">
                <input
                  id="seller-password"
                  type={showPassword ? "text" : "password"}
                  className="ge-form-control"
                  placeholder="Create a password"
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

            <div className="ge-form-group">
              <label className="ge-label" htmlFor="seller-confirm">
                Confirm Password
              </label>
              <div className="ge-password-field">
                <input
                  id="seller-confirm"
                  type={showConfirm ? "text" : "password"}
                  className="ge-form-control"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="ge-password-toggle"
                  aria-label="Toggle confirm password visibility"
                  onClick={() => setShowConfirm((prev) => !prev)}
                >
                  <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i>
                </button>
              </div>
            </div>

            <div className="ge-form-row-between" style={{ marginBottom: "1.6rem" }}>
              <label className="ge-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                I agree to the <Link to="/" className="ge-link-gold">Terms</Link> &amp;{" "}
                <Link to="/" className="ge-link-gold">Seller Policy</Link>
              </label>
            </div>

            <div className="ge-auth-submit">
              <button
                type="submit"
                className="ge-btn-gold"
                style={{ width: "100%" }}
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Business Account"}
              </button>
            </div>
          </form>

          <p className="ge-auth-footer-text">
            Want a shopper account instead?{" "}
            <Link to="/register" className="ge-link-gold">
              Sign up here
            </Link>
          </p>

          <p className="ge-auth-footer-text">
            Already have a business account?{" "}
            <Link to="/seller/login" className="ge-link-gold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellerRegister;
