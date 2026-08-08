import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CheckoutSteps from "../../components/layout/checkout/CheckoutSteps";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
} from "../../features/cart/cartSlicer";
import "./Cart.css";

const Cart = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.users);
  const { items, isLoading, error } = useSelector((state) => state.cart);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchCart());
    }
  }, [dispatch, currentUser]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleIncrease = (item) => {
    dispatch(updateCartItem({ id: item._id, quantity: item.quantity + 1 }));
  };

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      dispatch(updateCartItem({ id: item._id, quantity: item.quantity - 1 }));
    }
  };

  const handleRemove = (item) => {
    dispatch(removeCartItem(item._id));
  };

  return (
    <section className="ge-checkout-page">
      <div className="ge-checkout-card">
        <CheckoutSteps active="cart" />

        <div className="ge-cart-grid">
          <div className="ge-cart-main">
            <h1 className="ge-checkout-title">Shopping Cart</h1>

            {!currentUser && (
              <p>
                Please{" "}
                <Link to="/login" className="ge-link-gold">
                  sign in
                </Link>{" "}
                to view your cart.
              </p>
            )}

            {currentUser && isLoading && <p>Loading your cart...</p>}

            {currentUser && error && <p className="ge-cart-error">{error}</p>}

            {currentUser && !isLoading && !error && items.length === 0 && (
              <p>Your cart is empty.</p>
            )}

            {currentUser && !isLoading && items.length > 0 && (
              <ul className="ge-cart-list">
                {items.map((item) => (
                  <li className="ge-cart-item" key={item._id}>
                    <div className="ge-cart-item-media">
                      <img src={item.product.image} alt={item.product.name} />
                    </div>

                    <div className="ge-cart-item-details">
                      <div className="ge-cart-item-top">
                        <div>
                          <h3>{item.product.name}</h3>
                        </div>

                        <button
                          type="button"
                          className="ge-cart-remove"
                          onClick={() => handleRemove(item)}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="ge-cart-item-bottom">
                        <div className="ge-qty-select">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => handleDecrease(item)}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => handleIncrease(item)}
                          >
                            +
                          </button>
                        </div>

                        <span className="ge-cart-item-price">
                          ₹ {item.product.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="ge-order-summary">
            <h2>Total</h2>

            <div className="ge-order-row">
              <span>Subtotal</span>
              <span>₹ {subtotal}</span>
            </div>

            <div className="ge-order-row">
              <span>Shipping</span>
              <span className="ge-order-row-note">Calculated on checkout</span>
            </div>

            <div className="ge-order-divider"></div>

            <div className="ge-order-row ge-order-total">
              <span>Total</span>
              <span>₹ {subtotal}</span>
            </div>

            <div className="ge-discount">
              <label className="ge-label">Discount code</label>
              <div className="ge-discount-input">
                <input
                  type="text"
                  className="ge-form-control"
                  placeholder="Enter code"
                />
                <button
                  type="button"
                  className="ge-discount-btn"
                  aria-label="Apply discount code"
                >
                  <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>

            <Link to="/checkout/shipping" className="ge-btn-gold ge-checkout-btn">
              Checkout Now
            </Link>

            <Link to="/" className="ge-back-link">
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Cart;
