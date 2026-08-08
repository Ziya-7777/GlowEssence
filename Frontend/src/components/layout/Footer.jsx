import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="ge-footer">
      <div className="ge-footer-inner">
        <div>
          <div className="ge-footer-brand">
            Glow<span>Essence</span>
          </div>
          <p className="ge-footer-about">
            Clean, cruelty-free beauty crafted with botanical ingredients — made
            to help your natural glow do the talking.
          </p>
          <div className="ge-footer-social">
            <a href="#" aria-label="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="#" aria-label="Facebook">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="#" aria-label="Pinterest">
              <i className="bi bi-pinterest"></i>
            </a>
            <a href="#" aria-label="TikTok">
              <i className="bi bi-tiktok"></i>
            </a>
          </div>
        </div>

        <div>
          <div className="ge-footer-heading">Shop</div>
          <ul className="ge-footer-links">
            <li><Link to="/">Skincare</Link></li>
            <li><Link to="/">Makeup</Link></li>
            <li><Link to="/">Fragrance</Link></li>
            <li><Link to="/">Gift Sets</Link></li>
            <li><Link to="/">Best Sellers</Link></li>
          </ul>
        </div>

        <div>
          <div className="ge-footer-heading">Support</div>
          <ul className="ge-footer-links">
            <li><Link to="/">Contact Us</Link></li>
            <li><Link to="/">FAQs</Link></li>
            <li><Link to="/">Shipping & Returns</Link></li>
            <li><Link to="/">Track Order</Link></li>
            <li><Link to="/profile">My Account</Link></li>
          </ul>
        </div>

        <div className="ge-footer-newsletter">
          <div className="ge-footer-heading">Stay in the Glow</div>
          <p>Subscribe for early access to new drops & exclusive offers.</p>
          <form
            className="ge-footer-newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input type="email" placeholder="Your email address" />
            <button type="submit" aria-label="Subscribe">
              <i className="bi bi-arrow-right"></i>
            </button>
          </form>
        </div>
      </div>

      <div className="ge-footer-bottom">
        <span>© {new Date().getFullYear()} GlowEssence. All rights reserved.</span>
        <div className="ge-footer-payments">
          <i className="bi bi-credit-card"></i>
          <i className="bi bi-paypal"></i>
          <i className="bi bi-apple"></i>
          <i className="bi bi-google"></i>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
