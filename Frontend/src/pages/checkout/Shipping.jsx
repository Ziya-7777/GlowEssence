import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CheckoutSteps from "../../components/layout/checkout/CheckoutSteps";
import { fetchCart } from "../../features/cart/cartSlicer";
import "./Checkout.css";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  postalCode: "",
  address: "",
};

const Shipping = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.users);
  const { items } = useSelector((state) => state.cart);

  const [form, setForm] = useState(INITIAL_FORM);
  const [shippingMethod, setShippingMethod] = useState("express");
  const [errors, setErrors] = useState({});

  // load the real cart so the order summary here matches the cart page
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchCart());
    }
  }, [dispatch, currentUser]);

  // shipping cost depends on which option is selected
  const shippingCost = shippingMethod === "standard" ? 0 : 150;

  // add up price * quantity for every item in the cart
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const total = subtotal + shippingCost;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\s-]{7,15}$/.test(form.phone.trim())) {
      newErrors.phone = "Enter a valid phone number";
    }

    if (!form.country.trim()) newErrors.country = "Country / Region is required";
    if (!form.city.trim()) newErrors.city = "City is required";

    if (!form.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    } else if (!/^[0-9A-Za-z\s-]{3,10}$/.test(form.postalCode.trim())) {
      newErrors.postalCode = "Enter a valid postal code";
    }

    if (!form.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      navigate("/checkout/payment");
    }
  };

  return (
    <section className="ge-checkout-page">
      <div className="ge-checkout-card">
        <CheckoutSteps active="shipping" />

        <div className="ge-checkout-grid">
          <form className="ge-checkout-form" onSubmit={handleSubmit} noValidate>
            <h1 className="ge-checkout-title">Contacts</h1>

            <div className="ge-form-row">
              <div className="ge-field">
                <label className="ge-label">First name</label>
                <input
                  type="text"
                  name="firstName"
                  className={`ge-form-control ${errors.firstName ? "is-invalid" : ""}`}
                  placeholder="First name"
                  value={form.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && (
                  <span className="ge-field-error">{errors.firstName}</span>
                )}
              </div>
              <div className="ge-field">
                <label className="ge-label">Last name</label>
                <input
                  type="text"
                  name="lastName"
                  className={`ge-form-control ${errors.lastName ? "is-invalid" : ""}`}
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && (
                  <span className="ge-field-error">{errors.lastName}</span>
                )}
              </div>
            </div>

            <div className="ge-form-row">
              <div className="ge-field">
                <label className="ge-label">E-mail</label>
                <input
                  type="email"
                  name="email"
                  className={`ge-form-control ${errors.email ? "is-invalid" : ""}`}
                  placeholder="E-mail"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <span className="ge-field-error">{errors.email}</span>
                )}
              </div>
              <div className="ge-field">
                <label className="ge-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  className={`ge-form-control ${errors.phone ? "is-invalid" : ""}`}
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handleChange}
                />
                {errors.phone && (
                  <span className="ge-field-error">{errors.phone}</span>
                )}
              </div>
            </div>

            <h2 className="ge-checkout-subtitle">Shipping Address</h2>

            <div className="ge-form-row">
              <div className="ge-field">
                <label className="ge-label">Country / Region</label>
                <input
                  type="text"
                  name="country"
                  className={`ge-form-control ${errors.country ? "is-invalid" : ""}`}
                  placeholder="Country / Region"
                  value={form.country}
                  onChange={handleChange}
                />
                {errors.country && (
                  <span className="ge-field-error">{errors.country}</span>
                )}
              </div>
              <div className="ge-field">
                <label className="ge-label">City</label>
                <input
                  type="text"
                  name="city"
                  className={`ge-form-control ${errors.city ? "is-invalid" : ""}`}
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                />
                {errors.city && (
                  <span className="ge-field-error">{errors.city}</span>
                )}
              </div>
            </div>

            <div className="ge-form-row">
              <div className="ge-field">
                <label className="ge-label">Postal code</label>
                <input
                  type="text"
                  name="postalCode"
                  className={`ge-form-control ${errors.postalCode ? "is-invalid" : ""}`}
                  placeholder="Postal code"
                  value={form.postalCode}
                  onChange={handleChange}
                />
                {errors.postalCode && (
                  <span className="ge-field-error">{errors.postalCode}</span>
                )}
              </div>
              <div className="ge-field">
                <label className="ge-label">Address</label>
                <input
                  type="text"
                  name="address"
                  className={`ge-form-control ${errors.address ? "is-invalid" : ""}`}
                  placeholder="Address"
                  value={form.address}
                  onChange={handleChange}
                />
                {errors.address && (
                  <span className="ge-field-error">{errors.address}</span>
                )}
              </div>
            </div>

            <div className="ge-shipping-methods">
              <label
                className={`ge-shipping-option ${
                  shippingMethod === "standard" ? "is-selected" : ""
                }`}
              >
                <span className="ge-radio-group">
                  <input
                    type="radio"
                    name="shipping-method"
                    checked={shippingMethod === "standard"}
                    onChange={() => setShippingMethod("standard")}
                  />
                  Standard Shipping
                </span>
                <span className="ge-shipping-days">5-7 days</span>
                <span className="ge-shipping-price">Free</span>
              </label>

              <label
                className={`ge-shipping-option ${
                  shippingMethod === "express" ? "is-selected" : ""
                }`}
              >
                <span className="ge-radio-group">
                  <input
                    type="radio"
                    name="shipping-method"
                    checked={shippingMethod === "express"}
                    onChange={() => setShippingMethod("express")}
                  />
                  Express Shipping
                </span>
                <span className="ge-shipping-days">1-3 days</span>
                <span className="ge-shipping-price">₹ 150</span>
              </label>
            </div>

            <button type="submit" className="ge-btn-gold ge-checkout-btn">
              Continue to Payment
            </button>

            <Link to="/cart" className="ge-back-link">
              Back to Shopping Cart
            </Link>
          </form>

          <aside className="ge-order-summary">
            <div className="ge-order-summary-head">
              <h2>Your Order</h2>
              <Link to="/cart" className="ge-link-gold">
                Edit Cart
              </Link>
            </div>

            <ul className="ge-order-items">
              {items.map((item) => (
                <li key={item._id}>
                  <img src={item.product.image} alt={item.product.name} />
                  <div className="ge-order-item-info">
                    <h4>{item.product.name}</h4>
                    <span>Quantity {item.quantity}</span>
                  </div>
                  <span className="ge-order-item-price">
                    ₹ {item.product.price * item.quantity}
                  </span>
                </li>
              ))}
            </ul>

            <div className="ge-order-divider"></div>

            <div className="ge-order-row">
              <span>Subtotal</span>
              <span>₹ {subtotal}</span>
            </div>
            <div className="ge-order-row">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? "Free" : `₹ ${shippingCost}`}</span>
            </div>

            <div className="ge-order-divider"></div>

            <div className="ge-order-row ge-order-total">
              <span>Total</span>
              <span>₹ {total}</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Shipping;
