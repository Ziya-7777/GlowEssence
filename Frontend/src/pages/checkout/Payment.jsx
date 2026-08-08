import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CheckoutSteps from "../../components/layout/checkout/CheckoutSteps";
import { fetchCart, clearCart } from "../../features/cart/cartSlicer";
import {
  createOrder,
  createCodOrder,
  verifyOrderPayment,
  clearOrderStatus,
} from "../../features/orders/orderSlicer";
import "./Checkout.css";

// Razorpay's public key. This one is safe to use in frontend code
// (only the SECRET key must stay on the backend, never here).
const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

const Payment = () => {
  const dispatch = useDispatch();

  const { currentUser } = useSelector((state) => state.users);
  const { items } = useSelector((state) => state.cart);
  const { isLoading, error, completedOrder } = useSelector(
    (state) => state.order
  );

  // which payment option the customer picked: "razorpay" or "cod"
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  // load the latest cart when this page opens
  // and clear any old success/error message from a previous visit
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchCart());
    }
    dispatch(clearOrderStatus());
  }, [dispatch, currentUser]);

  // total price of everything currently in the cart
  const totalPrice = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // this runs when the customer clicks "Pay Now"
  const handlePayNow = async () => {
    // turn the cart items into the simple { productId, quantity } shape
    // that the backend order API expects
    const orderItems = items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    }));

    try {
      // Step 1: ask the backend to create ONE Razorpay order for the whole cart
      const result = await dispatch(createOrder(orderItems)).unwrap();
      const { razorpayOrder } = result;

      // Step 2: open Razorpay's own payment popup
      // (this is where the customer enters card / UPI / wallet details)
      const options = {
        key: RAZORPAY_KEY,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: "GlowEssence",
        description: "Order Payment",
        theme: { color: "#b8935f" },

        // Razorpay calls this function automatically after payment succeeds
        handler: async (response) => {
          try {
            // Step 3: send the payment details back to the backend to verify
            await dispatch(
              verifyOrderPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items: orderItems,
              })
            ).unwrap();

            // Step 4: payment confirmed, so empty the cart
            dispatch(clearCart());
          } catch {
            // error message is already saved in redux state, nothing else to do
          }
        },
      };

      const razorpayCheckout = new window.Razorpay(options);
      razorpayCheckout.open();
    } catch {
      // error message is already saved in redux state, nothing else to do
    }
  };

  // this runs when the customer clicks "Place Order" with Cash on Delivery
  // selected - no payment gateway involved, the order is placed right away
  const handleCodOrder = async () => {
    const orderItems = items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    }));

    try {
      await dispatch(createCodOrder(orderItems)).unwrap();
      dispatch(clearCart());
    } catch {
      // error message is already saved in redux state, nothing else to do
    }
  };

  // once payment is verified, show a simple success screen instead of the form
  if (completedOrder) {
    return (
      <section className="ge-checkout-page">
        <div className="ge-checkout-card ge-order-success">
          <span className="ge-order-success-icon">
            <i className="bi bi-check-circle"></i>
          </span>

          <h1 className="ge-checkout-title">Payment Successful!</h1>

          <p>
            Your order <strong>#{completedOrder._id}</strong> has been placed
            successfully.
          </p>

          <Link to="/" className="ge-btn-gold">
            Back to Home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="ge-checkout-page">
      <div className="ge-checkout-card">
        <CheckoutSteps active="payment" />

        <div className="ge-checkout-grid">
          <div className="ge-checkout-form">
            <h1 className="ge-checkout-title">Payment</h1>

            {!currentUser && (
              <p>
                Please{" "}
                <Link to="/login" className="ge-link-gold">
                  sign in
                </Link>{" "}
                to continue.
              </p>
            )}

            {currentUser && items.length === 0 && (
              <p>Your cart is empty. Add some products before checking out.</p>
            )}

            {currentUser && items.length > 0 && (
              <>
                <div className="ge-payment-methods">
                  <label
                    className={`ge-payment-method-option ${
                      paymentMethod === "razorpay" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                    />
                    <span className="ge-payment-method-icon">
                      <i className="bi bi-credit-card"></i>
                    </span>
                    <span className="ge-payment-method-text">
                      <strong>Pay Online</strong>
                      <small>Card, UPI, Netbanking or Wallet via Razorpay</small>
                    </span>
                  </label>

                  <label
                    className={`ge-payment-method-option ${
                      paymentMethod === "cod" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                    />
                    <span className="ge-payment-method-icon">
                      <i className="bi bi-cash-coin"></i>
                    </span>
                    <span className="ge-payment-method-text">
                      <strong>Cash on Delivery</strong>
                      <small>Pay in cash when your order arrives</small>
                    </span>
                  </label>
                </div>

                {error && <p className="ge-field-error">{error}</p>}

                {paymentMethod === "razorpay" ? (
                  <button
                    type="button"
                    className="ge-btn-gold ge-checkout-btn"
                    onClick={handlePayNow}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : `Pay ₹ ${totalPrice}`}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="ge-btn-gold ge-checkout-btn"
                    onClick={handleCodOrder}
                    disabled={isLoading}
                  >
                    {isLoading ? "Placing Order..." : `Place Order · ₹ ${totalPrice}`}
                  </button>
                )}
              </>
            )}

            <Link to="/checkout/shipping" className="ge-back-link">
              Back to Shipping
            </Link>
          </div>

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

            <div className="ge-order-row ge-order-total">
              <span>Total</span>
              <span>₹ {totalPrice}</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default Payment;
