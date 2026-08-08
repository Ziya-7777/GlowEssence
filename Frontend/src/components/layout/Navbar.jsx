import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../../features/cart/cartSlicer";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.users);
  const { currentSeller } = useSelector((state) => state.seller);
  const { items } = useSelector((state) => state.cart);

  const isAdmin = currentUser?.role === "admin";
  const isSeller = Boolean(currentSeller);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchCart());
    }
  }, [dispatch, currentUser]);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="ge-navbar">
      <div className="ge-navbar-inner">
        <Link to="/" className="ge-navbar-brand" onClick={() => setIsOpen(false)}>
          Glow<span>Essence</span>
        </Link>

        <nav>
          <ul className={`ge-navbar-links ${isOpen ? "open" : ""}`}>
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to} onClick={() => setIsOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}

            {/* dashboard link changes depending on who is logged in */}
            {isAdmin && (
              <li>
                <Link to="/admin/dashboard" onClick={() => setIsOpen(false)}>
                  Admin Dashboard
                </Link>
              </li>
            )}
            {isSeller && (
              <li>
                <Link to="/seller/dashboard" onClick={() => setIsOpen(false)}>
                  Seller Dashboard
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="ge-navbar-actions">
          <button className="ge-icon-btn" aria-label="Search">
            <i className="bi bi-search"></i>
          </button>
          {/* sellers get their own profile page (with their own Logout button) */}
          <Link
            to={isSeller ? "/seller/profile" : "/profile"}
            className="ge-icon-btn"
            aria-label="Account"
          >
            <i className="bi bi-person"></i>
          </Link>
          <Link to="/wishlist" className="ge-icon-btn" aria-label="Wishlist">
            <i className="bi bi-heart"></i>
          </Link>
          <Link to="/cart" className="ge-icon-btn" aria-label="Cart">
            <i className="bi bi-bag"></i>
            <span className="ge-cart-badge">{cartCount}</span>
          </Link>
          <button
            className="ge-navbar-toggle"
            aria-label="Toggle menu"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <i className={`bi ${isOpen ? "bi-x-lg" : "bi-list"}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
