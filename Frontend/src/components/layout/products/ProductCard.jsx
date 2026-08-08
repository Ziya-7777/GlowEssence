import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCart } from "../../../features/cart/cartSlicer";
import {
  addToWishlist,
  fetchWishlist,
  removeWishlistItem,
} from "../../../features/wishlist/wishlistSlicer";
import "./ProductCard.css";

// fills 5 stars based on how many the rating rounds to
const renderStars = (rating) => {
  const filled = Math.round(rating);

  return (
    <div className="rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`bi ${star <= filled ? "bi-star-fill" : "bi-star"}`}
        ></i>
      ))}
      <span>{rating}</span>
    </div>
  );
};

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.users);
  const { items: wishlistItems, hasFetched: wishlistFetched } = useSelector(
    (state) => state.wishlist
  );

  // load the user's wishlist once so we know which hearts should
  // already show as filled/red
  useEffect(() => {
    if (currentUser && !wishlistFetched) {
      dispatch(fetchWishlist());
    }
  }, [currentUser, wishlistFetched, dispatch]);

  const wishlistEntry = wishlistItems.find(
    (item) => (item.product?._id || item.product) === product._id
  );
  const isWishlisted = Boolean(wishlistEntry);

  // stop the click from also opening the product page link,
  // since these buttons sit inside a <Link>
  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please sign in to add items to your cart.");
      return;
    }

    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      dispatch(fetchCart()); // refresh the cart count shown in the navbar
      alert("Added to cart!");
    } catch (error) {
      alert(error);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please sign in to add items to your wishlist.");
      return;
    }

    try {
      if (isWishlisted) {
        await dispatch(removeWishlistItem(wishlistEntry._id)).unwrap();
      } else {
        await dispatch(addToWishlist(product._id)).unwrap();
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="product-link"
    >
      <div className="ge-product-card">

        <div className="ge-product-image">

          <img src={product.image} alt={product.name} />

          {product.oldPrice && (
            <span className="discount">
              Save ₹{product.oldPrice - product.price}
            </span>
          )}

          <button
            className={`wishlist ${isWishlisted ? "active" : ""}`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={handleToggleWishlist}
          >
            <i className={`bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"}`}></i>
          </button>

        </div>

        <div className="ge-product-info">

          <small>{product.category?.name}</small>

          <h3>{product.name}</h3>

          {product.rating ? renderStars(product.rating) : null}

          <div className="price">

            <span className="new">
              ₹{product.price}
            </span>

            {product.oldPrice && (
              <span className="old">
                ₹{product.oldPrice}
              </span>
            )}

          </div>

          <button
            className="ge-btn-gold cart-btn"
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>

        </div>

      </div>
    </Link>
  );
};

export default ProductCard;
