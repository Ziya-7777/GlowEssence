import { Link } from "react-router-dom";
import "./About.css";

const VALUES = [
  {
    icon: "bi-flower1",
    title: "Clean Ingredients",
    text: "Every formula starts with botanicals we'd be proud to put on our own skin.",
  },
  {
    icon: "bi-heart",
    title: "Cruelty-Free",
    text: "Never tested on animals — not at any stage, not anywhere in the world.",
  },
  {
    icon: "bi-recycle",
    title: "Sustainable Packaging",
    text: "Recyclable, refillable, and designed to leave less behind.",
  },
  {
    icon: "bi-patch-check",
    title: "Dermatologist Tested",
    text: "Gentle enough for sensitive skin, verified before it ever reaches you.",
  },
];

const STATS = [
  { value: "2019", label: "Founded" },
  { value: "50K+", label: "Happy Customers" },
  { value: "200+", label: "Products Crafted" },
  { value: "12", label: "Countries Shipped To" },
];

const About = () => {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="ge-about-hero">
        <span className="ge-eyebrow">Our Story</span>
        <h1>Beauty, made honestly.</h1>
        <p>
          GlowEssence was born from a simple idea — skincare and makeup
          should feel as good as they perform, without compromise.
        </p>
      </section>

      {/* ---------- Story ---------- */}
      <section className="ge-about-story">
        <div className="ge-about-story-text">
          <span className="ge-eyebrow">How We Started</span>
          <h2>From a kitchen counter to your daily routine</h2>
          <div className="ge-about-divider"></div>
          <p>
            It began with one frustration: too many beauty products promised
            everything and delivered very little, hiding behind long lists of
            ingredients no one could pronounce. So we started over — sourcing
            real botanicals, testing relentlessly, and refusing to ship
            anything we wouldn't use ourselves.
          </p>
          <p>
            Today, GlowEssence is a full skincare, makeup, hair care, and
            fragrance line — but the standard hasn't changed. Every product
            still has to earn its place on your shelf.
          </p>
          <Link to="/shop" className="ge-btn-gold">
            Explore Our Products
          </Link>
        </div>

        <div className="ge-about-story-stats">
          {STATS.map((stat) => (
            <div className="ge-about-stat" key={stat.label}>
              <h3>{stat.value}</h3>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Values ---------- */}
      <section className="ge-about-values">
        <div className="ge-about-section-head">
          <span className="ge-eyebrow">What We Stand For</span>
          <h2>Our Promise To You</h2>
          <div className="ge-about-divider"></div>
        </div>

        <div className="ge-about-values-grid">
          {VALUES.map((value) => (
            <div className="ge-about-value-card" key={value.title}>
              <span className="ge-about-value-icon">
                <i className={`bi ${value.icon}`}></i>
              </span>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="ge-about-cta">
        <h2>Ready to find your glow?</h2>
        <p>Discover skincare and makeup crafted for real, everyday radiance.</p>
        <Link to="/shop" className="ge-btn-gold">
          Shop the Collection
        </Link>
      </section>
    </>
  );
};

export default About;
