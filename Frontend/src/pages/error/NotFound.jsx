import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = ({
  title = "Page Not Found",
  text = "Oops! The page you are looking for doesn't exist or has been moved.",
}) => {
  return (
    <div className="ge-notfound-page">
      <div className="ge-notfound-card">
        <span className="ge-notfound-icon">
          <i className="bi bi-emoji-frown"></i>
        </span>

        <h1 className="ge-notfound-code">404</h1>

        <h2 className="ge-notfound-title">{title}</h2>

        <p className="ge-notfound-text">{text}</p>

        <Link to="/" className="ge-btn-gold">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
