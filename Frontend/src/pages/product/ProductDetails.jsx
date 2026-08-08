import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import RelatedProducts from "../../components/layout/products/RelatedProducts";
import NotFound from "../error/NotFound";
import { fetchProductById } from "../../features/products/productSlicer";
import { addToCart, fetchCart } from "../../features/cart/cartSlicer";
import {
  addToWishlist,
  fetchWishlist,
  removeWishlistItem,
} from "../../features/wishlist/wishlistSlicer";
import { fetchReviews, addReview } from "../../features/reviews/reviewSlicer";
import "./ProductDetails.css";

const REVIEWS_PER_PAGE = 3;

// fills 5 stars based on how many the rating rounds to
const renderStars = (rating) => {
  const filled = Math.round(rating);

  return (
    <div className="product-rating">
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

// turns a reviewer's name into 1-2 letter initials for the avatar circle
const getInitials = (name) => {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
};

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.users);
  const {
    currentProduct: product,
    isLoadingCurrent: isLoading,
    currentError: productError,
  } = useSelector((state) => state.product);
  const { items: reviews, isLoading: reviewsLoading, error: reviewError } =
    useSelector((state) => state.reviews);
  const { items: wishlistItems, hasFetched: wishlistFetched } = useSelector(
    (state) => state.wishlist
  );

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewPage, setReviewPage] = useState(1);

  // reset the review pagination back to page 1 whenever we navigate to a
  // different product. Adjusting state during render (rather than in the
  // effect below) avoids an extra, unnecessary re-render.
  const [prevId, setPrevId] = useState(id);
  if (id !== prevId) {
    setPrevId(id);
    setReviewPage(1);
  }

  // load this product (and its reviews) whenever the page opens, using
  // the real database id from the URL
  useEffect(() => {
    dispatch(fetchProductById(id));
    dispatch(fetchReviews(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentUser && !wishlistFetched) {
      dispatch(fetchWishlist());
    }
  }, [currentUser, wishlistFetched, dispatch]);

  if (isLoading) {
    return <p style={{ textAlign: "center", margin: "80px" }}>Loading product...</p>;
  }

  if (productError) {
    return (
      <NotFound
        title="Something Went Wrong"
        text={productError}
      />
    );
  }

  if (!product) {
    return (
      <NotFound
        title="Product Not Found"
        text="Sorry, this product doesn't exist or is no longer available."
      />
    );
  }

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const wishlistEntry = wishlistItems.find(
    (item) => (item.product?._id || item.product) === product._id
  );
  const isWishlisted = Boolean(wishlistEntry);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please sign in to leave a review.");
      return;
    }

    try {
      await dispatch(
        addReview({
          productId: product._id,
          rating: reviewRating,
          comment: reviewComment,
        })
      ).unwrap();

      // fetch the list again so the new review comes back with the
      // reviewer's name already filled in
      dispatch(fetchReviews(product._id));
      setReviewComment("");
      setReviewRating(5);
      setReviewPage(1);
    } catch (error) {
      alert(error);
    }
  };

  // ---------- Pagination (client-side, simple slice of the array) ----------

  const totalReviewPages = Math.max(
    Math.ceil(reviews.length / REVIEWS_PER_PAGE),
    1
  );

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : null;

  const reviewStartIndex = (reviewPage - 1) * REVIEWS_PER_PAGE;
  const currentReviews = reviews.slice(
    reviewStartIndex,
    reviewStartIndex + REVIEWS_PER_PAGE
  );

  const goToPrevReviewPage = () => {
    setReviewPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextReviewPage = () => {
    setReviewPage((prev) => Math.min(prev + 1, totalReviewPages));
  };

  const handleAddToCart = async () => {
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

  const handleToggleWishlist = async () => {
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
    <>
      <div className="product-details-page">
        <nav className="product-breadcrumb">
          <Link to="/">Home</Link>
          <i className="bi bi-chevron-right"></i>
          <Link to="/shop">Shop</Link>
          <i className="bi bi-chevron-right"></i>
          <span>{product.name}</span>
        </nav>

        <section className="product-details">

          <div className="product-image">
            <img
              src={product.image}
              alt={product.name}
            />
            {discount > 0 && (
              <span className="product-discount-badge">{discount}% OFF</span>
            )}
          </div>

          <div className="product-info">

            <span className="category">
              {product.category?.name}
            </span>

            <h1>{product.name}</h1>

            {/* real products don't have a rating field yet, so only show
                stars when one actually exists */}
            {product.rating ? renderStars(product.rating) : null}

            <div className="price-row">
              <h2 className="price">₹ {product.price}</h2>
              {product.oldPrice && (
                <span className="old-price">₹ {product.oldPrice}</span>
              )}
            </div>

            <p>{product.description}</p>

            <div className="product-actions">
              <button className="ge-btn-gold" onClick={handleAddToCart}>
                Add To Cart
              </button>
              <button
                className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                onClick={handleToggleWishlist}
              >
                <i className={`bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"}`}></i>
              </button>
            </div>

            <div className="product-perks">
              <span><i className="bi bi-truck"></i> Free Shipping</span>
              <span><i className="bi bi-arrow-repeat"></i> Easy Returns</span>
              <span><i className="bi bi-shield-check"></i> Secure Payment</span>
            </div>

          </div>

        </section>

        {/* ---------- Reviews ---------- */}
        <section className="product-reviews">
          <div className="review-summary-head">
            <h2>Customer Reviews</h2>
            {averageRating && (
              <div className="review-summary-badge">
                {renderStars(Number(averageRating))}
                <span className="review-summary-count">
                  ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                </span>
              </div>
            )}
          </div>

          {currentUser ? (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <div className="ge-form-group">
                <label className="ge-label">Your Rating</label>
                <select
                  className="ge-form-control"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Good</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Below Average</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>

              <div className="ge-form-group">
                <label className="ge-label">Your Review</label>
                <textarea
                  className="ge-form-control"
                  rows="3"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share what you liked (or didn't) about this product"
                  required
                ></textarea>
              </div>

              <button type="submit" className="ge-btn-gold">
                Submit Review
              </button>
            </form>
          ) : (
            <p>
              <Link to="/login" className="ge-link-gold">
                Sign in
              </Link>{" "}
              to leave a review.
            </p>
          )}

          {reviewError && <p className="review-error">{reviewError}</p>}
          {reviewsLoading && <p>Loading reviews...</p>}

          {!reviewsLoading && reviews.length === 0 && (
            <p>No reviews yet. Be the first to review this product.</p>
          )}

          {!reviewsLoading && currentReviews.length > 0 && (
            <>
              <div className="review-list">
                {currentReviews.map((review) => (
                  <div className="review-card" key={review._id}>
                    <div className="review-avatar">
                      {getInitials(review.user?.name)}
                    </div>

                    <div className="review-card-body">
                      <div className="review-card-head">
                        <span className="review-author">
                          {review.user?.name || "Anonymous"}
                        </span>
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {renderStars(review.rating)}
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>

              {totalReviewPages > 1 && (
                <div className="review-pagination">
                  <button
                    type="button"
                    aria-label="Previous page"
                    onClick={goToPrevReviewPage}
                    disabled={reviewPage === 1}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>

                  <span className="review-page-info">
                    Page {reviewPage} of {totalReviewPages}
                  </span>

                  <button
                    type="button"
                    aria-label="Next page"
                    onClick={goToNextReviewPage}
                    disabled={reviewPage === totalReviewPages}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <RelatedProducts
        category={product.category?.name}
        currentId={product._id}
      />
    </>
  );
};

export default ProductDetails;
