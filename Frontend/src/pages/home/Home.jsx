import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../../features/products/productSlicer";
import { fetchRecentReviews } from "../../features/reviews/reviewSlicer";
import "./Home.css";

// real products have their category as a populated object ({ _id, name, ... }),
// not a plain string, so we compare against category.name
const getCategoryProducts = (products, categoryName) =>
  products.filter((product) => product.category?.name === categoryName);

// scrolling trust strip just under the navbar
const MARQUEE_ITEMS = [
  "Free Shipping Over ₹999",
  "100% Cruelty-Free",
  "Dermatologist Tested",
  "Clean Botanical Ingredients",
  "30-Day Easy Returns",
];

// simple trust numbers, shown right under the hero
const STATS = [
  { value: "50K+", label: "Happy Customers" },
  { value: "4.8", label: "Average Rating" },
  { value: "200+", label: "Products Crafted" },
  { value: "100%", label: "Cruelty Free" },
];

// static customer quotes
const TESTIMONIALS = [
  {
    name: "Ananya R.",
    text: "My skin has never felt this soft. The Vitamin C serum is an absolute game changer!",
  },
  {
    name: "Priya M.",
    text: "Finally a brand that keeps its promise — clean ingredients and real results.",
  },
  {
    name: "Sara K.",
    text: "The packaging feels so premium and the products smell amazing. Repeat customer for life.",
  },
];

// fills 5 stars based on how many the rating rounds to
const renderStars = (rating) => {
  const filled = Math.round(rating);

  return (
    <div className="ge-home-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`bi ${star <= filled ? "bi-star-fill" : "bi-star"}`}
        ></i>
      ))}
    </div>
  );
};

// a row of product cards, reused for every category section below.
// the very first item in each row gets a small "Bestseller" badge.
const ProductGrid = ({ items }) => {
  if (items.length === 0) {
    return <p className="ge-home-empty">No products in this category yet.</p>;
  }

  return (
    <div className="ge-home-grid">
      {items.map((product, index) => (
        <Link
          to={`/product/${product._id}`}
          className="ge-home-card"
          key={product._id}
        >
          <div className="ge-home-card-media">
            <img src={product.image} alt={product.name} />
            {index === 0 && <span className="ge-home-badge">Bestseller</span>}
            <span className="ge-home-card-cta" aria-hidden="true">
              <i className="bi bi-eye"></i>
            </span>
          </div>

          <h3>{product.name}</h3>
          {/* real products don't have a rating field yet, so only show
              stars when one actually exists */}
          {product.rating && renderStars(product.rating)}

          <div className="ge-home-price">
            <span className="ge-price-new">₹ {product.price}</span>
            {product.oldPrice && (
              <span className="ge-price-old">₹ {product.oldPrice}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

// carousel of customer reviews - shows real submitted reviews when
// there are any, otherwise falls back to the static quotes above so
// the section never looks empty on a fresh database
const TestimonialCarousel = ({ reviews }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides =
    reviews.length > 0
      ? reviews.map((review) => ({
          name: review.user?.name || "Verified Buyer",
          text: review.comment,
          rating: review.rating,
          product: review.product?.name,
        }))
      : TESTIMONIALS.map((testimonial) => ({ ...testimonial, rating: 5 }));

  // keep the index valid if the underlying review list ever shrinks
  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [slides.length, activeIndex]);

  // auto-advance every 6 seconds
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const active = slides[activeIndex];

  if (!active) return null;

  return (
    <div className="ge-testimonial-carousel">
      <div className="ge-testimonial-carousel-track">
        <div className="ge-testimonial-card ge-testimonial-card-active" key={activeIndex}>
          <i className="bi bi-quote"></i>
          {renderStars(active.rating)}
          <p>"{active.text}"</p>
          <span className="ge-testimonial-name">
            {active.name}
            {active.product && (
              <span className="ge-testimonial-product"> · {active.product}</span>
            )}
          </span>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="ge-testimonial-carousel-controls">
          <button
            type="button"
            aria-label="Previous review"
            onClick={goToPrev}
            className="ge-testimonial-arrow"
          >
            <i className="bi bi-chevron-left"></i>
          </button>

          <div className="ge-testimonial-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to review ${index + 1}`}
                className={`ge-testimonial-dot ${index === activeIndex ? "active" : ""}`}
                onClick={() => setActiveIndex(index)}
              ></button>
            ))}
          </div>

          <button
            type="button"
            aria-label="Next review"
            onClick={goToNext}
            className="ge-testimonial-arrow"
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

// a decorative wavy divider that sits between two sections
const WaveDivider = ({ flip }) => (
  <div className={`ge-wave-divider ${flip ? "ge-wave-divider-flip" : ""}`}>
    <svg viewBox="0 0 1200 80" preserveAspectRatio="none">
      <path d="M0,40 C300,90 900,-10 1200,40 L1200,80 L0,80 Z"></path>
    </svg>
  </div>
);

const Home = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.users);
  const { currentSeller } = useSelector((state) => state.seller);
  const { products } = useSelector((state) => state.product);
  const { recentItems: recentReviews } = useSelector((state) => state.reviews);

  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchRecentReviews());
  }, [dispatch]);

  const skincare = getCategoryProducts(products, "Skincare");
  const makeup = getCategoryProducts(products, "Makeup");
  const hairAndFragrance = [
    ...getCategoryProducts(products, "Hair Care"),
    ...getCategoryProducts(products, "Fragrance"),
  ];

  return (
    <>
      {/* ---------- Scrolling trust strip ---------- */}
      <div className="ge-marquee">
        <div className="ge-marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
            <span key={index}>
              <i className="bi bi-gem"></i> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- Hero ---------- */}
      <section className="ge-hero">
        <video
          className="ge-hero-video"
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
        ></video>
        <div className="ge-hero-overlay"></div>

        <span className="ge-hero-orb ge-hero-orb-1"></span>
        <span className="ge-hero-orb ge-hero-orb-2"></span>

        <div className="ge-hero-text">
          <span className="ge-eyebrow ge-fade-in ge-delay-1">
            Clean Beauty, Naturally You
          </span>

          <h1 className="ge-fade-in ge-delay-2">Let your glow speak for itself.</h1>

          <p className="ge-fade-in ge-delay-3">
            Discover skincare and makeup crafted with botanical
            ingredients — gentle on your skin, kind to the planet.
          </p>

          <div className="ge-hero-actions ge-fade-in ge-delay-4">
            <Link to="/shop" className="ge-btn-gold ge-btn-shine">
              Shop the Collection
            </Link>

            {/* only show "Sign In" to a visitor who hasn't logged in yet
                (neither as a regular user nor as a seller) */}
            {!currentUser && !currentSeller && (
              <Link to="/login" className="ge-btn-outline ge-btn-outline-light">
                Sign In
              </Link>
            )}
          </div>

          <div className="ge-hero-perks ge-fade-in ge-delay-5">
            <span><i className="bi bi-flower1"></i> Cruelty-Free</span>
            <span><i className="bi bi-patch-check"></i> Dermatologist Tested</span>
            <span><i className="bi bi-truck"></i> Free Shipping</span>
          </div>
        </div>

      </section>

      {/* ---------- Trust stats ---------- */}
      <section className="ge-stats">
        {STATS.map((stat) => (
          <div className="ge-stat" key={stat.label}>
            <h3>{stat.value}</h3>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      {/* ---------- Skincare ---------- */}
      <section className="ge-home-section">
        <div className="ge-home-section-head">
          <span className="ge-eyebrow">Best Sellers</span>
          <h2>Radiant Skin Starts Here</h2>
          <div className="ge-home-divider"></div>
          <p>
            Discover our luxurious skincare collection designed to cleanse,
            nourish, and rejuvenate your skin — crafted for every glow.
          </p>
        </div>

        <ProductGrid items={skincare} />
      </section>

      {/* ---------- Makeup ---------- */}
      <section className="ge-home-banner ge-home-banner-makeup">
        <WaveDivider />
        <div className="ge-home-banner-content">
          <span className="ge-eyebrow">Color Story</span>
          <h2>Makeup</h2>
          <p>Effortless color, made to express your own confidence.</p>
          <Link to="/shop" className="ge-btn-outline ge-btn-outline-light">
            Shop Makeup
          </Link>
        </div>
        <WaveDivider flip />
      </section>
      <section className="ge-home-section">
        <ProductGrid items={makeup} />
      </section>

      {/* ---------- Hair Care & Fragrance ---------- */}
      <section className="ge-home-banner ge-home-banner-fragrance">
        <WaveDivider />
        <div className="ge-home-banner-content">
          <span className="ge-eyebrow">Finishing Touches</span>
          <h2>Hair &amp; Fragrance</h2>
          <p>Details that make your routine unmistakably yours.</p>
          <Link to="/shop" className="ge-btn-outline ge-btn-outline-light">
            Shop Now
          </Link>
        </div>
        <WaveDivider flip />
      </section>
      <section className="ge-home-section">
        <ProductGrid items={hairAndFragrance} />
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="ge-home-section ge-testimonials">
        <div className="ge-home-section-head">
          <span className="ge-eyebrow">Loved By Thousands</span>
          <h2>What Our Customers Say</h2>
          <div className="ge-home-divider"></div>
        </div>

        <TestimonialCarousel reviews={recentReviews} />
      </section>

      {/* ---------- Newsletter ---------- */}
      <section className="ge-newsletter">
        <div className="ge-newsletter-content">
          <span className="ge-eyebrow">Stay In The Glow</span>
          <h2>Get 10% Off Your First Order</h2>
          <p>Join our newsletter for exclusive drops, tips, and offers.</p>

          <form
            className="ge-newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email address"
              required
            />
            <button type="submit" className="ge-btn-gold">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
};

export default Home;