import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../../features/products/productSlicer";
import { fetchCategories } from "../../features/catalog/catalogSlicer";
import {
  addToWishlist,
  fetchWishlist,
  removeWishlistItem,
} from "../../features/wishlist/wishlistSlicer";
import "./Shop.css";

const PRODUCTS_PER_PAGE = 20;

// renders 5 stars, filling however many the rating rounds to
const renderStars = (rating) => {
  const filled = Math.round(rating);

  return (
    <div className="ge-shop-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`bi ${star <= filled ? "bi-star-fill" : "bi-star"}`}
        ></i>
      ))}
    </div>
  );
};

const Shop = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.users);
  const { products, isLoading } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.catalog);
  const { items: wishlistItems, hasFetched: wishlistFetched } = useSelector(
    (state) => state.wishlist
  );

  // whether each filter accordion section is open or closed
  const [openFilters, setOpenFilters] = useState({
    availability: true,
    price: false,
  });

  // filter state
  const [selectedCategory, setSelectedCategory] = useState(null); // null = all categories
  const [availability, setAvailability] = useState({
    inStock: false,
    outOfStock: false,
  });
  const [priceRanges, setPriceRanges] = useState({
    under500: false,
    between500And1000: false,
    above1000: false,
  });
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser && !wishlistFetched) {
      dispatch(fetchWishlist());
    }
  }, [currentUser, wishlistFetched, dispatch]);

  const toggleFilter = (key) => {
    setOpenFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAvailability = (key) => {
    setAvailability((prev) => ({ ...prev, [key]: !prev[key] }));
    setCurrentPage(1);
  };

  const togglePriceRange = (key) => {
    setPriceRanges((prev) => ({ ...prev, [key]: !prev[key] }));
    setCurrentPage(1);
  };

  const handleCategoryClick = (categoryName) => {
    // clicking the same category again clears the filter
    setSelectedCategory((prev) => (prev === categoryName ? null : categoryName));
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const isProductWishlisted = (productId) =>
    wishlistItems.find(
      (item) => (item.product?._id || item.product) === productId
    );

  const handleToggleWishlist = async (e, productId) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please sign in to add items to your wishlist.");
      return;
    }

    const wishlistEntry = isProductWishlisted(productId);

    try {
      if (wishlistEntry) {
        await dispatch(removeWishlistItem(wishlistEntry._id)).unwrap();
      } else {
        await dispatch(addToWishlist(productId)).unwrap();
      }
    } catch (error) {
      alert(error);
    }
  };

  // ---------- Apply filters ----------

  let filteredProducts = [...products];

  // Category filter (category is a populated object, so we compare by name)
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category?.name === selectedCategory
    );
  }

  // Availability filter, using the product's real stock number
  const isAvailabilityFilterActive =
    availability.inStock || availability.outOfStock;

  if (isAvailabilityFilterActive) {
    filteredProducts = filteredProducts.filter((product) => {
      if (availability.inStock && product.stock > 0) return true;
      if (availability.outOfStock && product.stock === 0) return true;
      return false;
    });
  }

  // Price filter
  const isPriceFilterActive =
    priceRanges.under500 || priceRanges.between500And1000 || priceRanges.above1000;

  if (isPriceFilterActive) {
    filteredProducts = filteredProducts.filter((product) => {
      if (priceRanges.under500 && product.price < 500) return true;
      if (
        priceRanges.between500And1000 &&
        product.price >= 500 &&
        product.price <= 1000
      )
        return true;
      if (priceRanges.above1000 && product.price > 1000) return true;
      return false;
    });
  }

  // Sort
  if (sortBy === "priceLow") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (sortBy === "priceHigh") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  if (sortBy === "rating") {
    filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  // ---------- Pagination ----------

  const totalPages = Math.max(
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
    1
  );

  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE
  );

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const inStockCount = products.filter((product) => product.stock > 0).length;
  const outOfStockCount = products.filter((product) => product.stock === 0).length;
  const bestSeller = products[0];

  return (
    <section className="ge-shop-page">
      {/* Page banner */}
      <div className="ge-shop-hero">
        <span className="ge-eyebrow">The Full Collection</span>
        <h1>Shop All Products</h1>
        <p>Skincare, makeup, hair care and fragrance — all in one place.</p>
      </div>

      <div className="ge-shop-body">
        {/* Sidebar filters */}
        <aside className="ge-shop-filters">
          <h2 className="ge-shop-filters-title">Filter:</h2>

          <div className="ge-filter-section">
            <button
              type="button"
              className="ge-filter-head"
              onClick={() => toggleFilter("availability")}
            >
              Availability
              <i
                className={`bi ${
                  openFilters.availability ? "bi-chevron-up" : "bi-chevron-down"
                }`}
              ></i>
            </button>

            {openFilters.availability && (
              <div className="ge-filter-body">
                <label className="ge-filter-option">
                  <input
                    type="checkbox"
                    checked={availability.inStock}
                    onChange={() => toggleAvailability("inStock")}
                  />
                  In stock ({inStockCount})
                </label>
                <label className="ge-filter-option">
                  <input
                    type="checkbox"
                    checked={availability.outOfStock}
                    onChange={() => toggleAvailability("outOfStock")}
                  />
                  Out of stock ({outOfStockCount})
                </label>
              </div>
            )}
          </div>

          <div className="ge-filter-section">
            <button
              type="button"
              className="ge-filter-head"
              onClick={() => toggleFilter("price")}
            >
              Price
              <i
                className={`bi ${
                  openFilters.price ? "bi-chevron-up" : "bi-chevron-down"
                }`}
              ></i>
            </button>

            {openFilters.price && (
              <div className="ge-filter-body">
                <label className="ge-filter-option">
                  <input
                    type="checkbox"
                    checked={priceRanges.under500}
                    onChange={() => togglePriceRange("under500")}
                  />
                  Under ₹500
                </label>
                <label className="ge-filter-option">
                  <input
                    type="checkbox"
                    checked={priceRanges.between500And1000}
                    onChange={() => togglePriceRange("between500And1000")}
                  />
                  ₹500 - ₹1000
                </label>
                <label className="ge-filter-option">
                  <input
                    type="checkbox"
                    checked={priceRanges.above1000}
                    onChange={() => togglePriceRange("above1000")}
                  />
                  Above ₹1000
                </label>
              </div>
            )}
          </div>

          <div className="ge-filter-section">
            <h3 className="ge-filter-static-title">Category</h3>
            <ul className="ge-filter-category-list">
              {categories.map((category) => (
                <li key={category._id}>
                  <button
                    type="button"
                    className={selectedCategory === category.name ? "active" : ""}
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {bestSeller && (
            <div className="ge-filter-section">
              <h3 className="ge-filter-static-title">Best Sellers</h3>
              <Link
                to={`/product/${bestSeller._id}`}
                className="ge-best-seller-card"
              >
                <img src={bestSeller.image} alt={bestSeller.name} />
                <h4>{bestSeller.name}</h4>
                {bestSeller.rating && renderStars(bestSeller.rating)}
                <span className="ge-best-seller-price">₹ {bestSeller.price}</span>
              </Link>
            </div>
          )}
        </aside>

        {/* Product grid */}
        <div className="ge-shop-main">
          <div className="ge-shop-toolbar">
            <div className="ge-shop-view-toggle">
              <button
                type="button"
                className={viewMode === "grid" ? "active" : ""}
                aria-label="Grid view"
                onClick={() => setViewMode("grid")}
              >
                <i className="bi bi-grid-3x3-gap"></i>
              </button>
              <button
                type="button"
                className={viewMode === "list" ? "active" : ""}
                aria-label="List view"
                onClick={() => setViewMode("list")}
              >
                <i className="bi bi-list"></i>
              </button>
            </div>

            <div className="ge-shop-toolbar-right">
              <label className="ge-shop-sort">
                Sort by:
                <select value={sortBy} onChange={handleSortChange}>
                  <option value="featured">Featured</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </label>

              <span className="ge-shop-count">
                {filteredProducts.length} products
              </span>
            </div>
          </div>

          {isLoading && <p>Loading products...</p>}

          {!isLoading && products.length === 0 && (
            <p className="ge-shop-empty">
              No products have been added yet. Check back soon!
            </p>
          )}

          {!isLoading && products.length > 0 && currentProducts.length === 0 && (
            <p className="ge-shop-empty">No products match these filters.</p>
          )}

          {!isLoading && currentProducts.length > 0 && (
            <div className={`ge-shop-grid ${viewMode === "list" ? "ge-shop-grid-list" : ""}`}>
              {currentProducts.map((product) => {
                const discount = product.oldPrice
                  ? Math.round(
                      ((product.oldPrice - product.price) / product.oldPrice) * 100
                    )
                  : 0;
                const isWishlisted = Boolean(isProductWishlisted(product._id));

                return (
                  <Link
                    to={`/product/${product._id}`}
                    className="ge-shop-card"
                    key={product._id}
                  >
                    <div className="ge-shop-card-media">
                      <img src={product.image} alt={product.name} />
                      {discount > 0 && (
                        <span className="ge-shop-badge">{discount}%</span>
                      )}
                      <span
                        className={`ge-shop-wishlist-btn ${isWishlisted ? "active" : ""}`}
                        onClick={(e) => handleToggleWishlist(e, product._id)}
                      >
                        <i className={`bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"}`}></i>
                      </span>
                    </div>

                    <h3>{product.name}</h3>
                    {product.rating && renderStars(product.rating)}

                    <div className="ge-shop-price">
                      <span className="ge-price-new">₹ {product.price}</span>
                      {product.oldPrice && (
                        <span className="ge-price-old">₹ {product.oldPrice}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="ge-shop-pagination">
            <button
              type="button"
              aria-label="Previous page"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
            >
              <i className="bi bi-chevron-left"></i>
            </button>

            <span className="ge-shop-page-info">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              aria-label="Next page"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Shop;
