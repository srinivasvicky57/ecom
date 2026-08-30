import { useState, useEffect } from "react";
import { testimonialsText } from "../data/siteContent";

const STATIC_TESTIMONIALS = [
  {
    id: "t1",
    name: "Priya Sharma",
    text: "The Kalamkari silk saree I ordered is absolutely stunning! The hand-painted motifs are so intricate and the colors are vibrant. I received so many compliments at the wedding.",
    rating: 5,
    avatar: "PS",
  },
  {
    id: "t2",
    name: "Anitha Reddy",
    text: "Beautiful dupatta with traditional peacock designs. The fabric quality is excellent and the craftsmanship is truly remarkable. Will definitely order again!",
    rating: 4.5,
    avatar: "AR",
  },
  {
    id: "t3",
    name: "Lakshmi Devi",
    text: "Ordered the pen Kalamkari kurti and it exceeded my expectations. The natural dye colors are earthy and elegant. Packaging was also very neat and arrived on time.",
    rating: 5,
    avatar: "LD",
  },
  {
    id: "t4",
    name: "Meena Kumari",
    text: "The block-printed cotton saree is perfect for daily wear. Lightweight, comfortable, and the Kalamkari patterns make it look so classy. Great value for money.",
    rating: 4,
    avatar: "MK",
  },
  {
    id: "t5",
    name: "Divya Nair",
    text: "I am in love with the Machilipatnam style dress material. The temple border design is unique and the fabric drapes beautifully. Excellent customer service too!",
    rating: 4.5,
    avatar: "DN",
  },
];

function useCardsPerPage() {
  const getCount = () => (window.innerWidth >= 1200 ? 6 : 4);
  const [count, setCount] = useState(getCount);
  useEffect(() => {
    const onResize = () => setCount(getCount());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return count;
}

function Testimonials() {
  const testimonials = STATIC_TESTIMONIALS;
  const cardsPerPage = useCardsPerPage();
  const totalPages = Math.ceil(testimonials.length / cardsPerPage);
  const needsCarousel = testimonials.length > cardsPerPage;
  const [currentPage, setCurrentPage] = useState(0);

  // Reset to page 0 if resizing changes page count
  useEffect(() => {
    if (currentPage >= totalPages) setCurrentPage(0);
  }, [totalPages, currentPage]);

  const visibleCards = needsCarousel
    ? testimonials.slice(
        currentPage * cardsPerPage,
        (currentPage + 1) * cardsPerPage,
      )
    : testimonials;

  const goToPrev = () =>
    setCurrentPage((p) => (p === 0 ? totalPages - 1 : p - 1));
  const goToNext = () =>
    setCurrentPage((p) => (p === totalPages - 1 ? 0 : p + 1));

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(
          <svg key={i}  className="star filled" width="11" height="11" viewBox="0 0 24 24"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="currentColor"
            />
          </svg>,
        );
      } else if (i - rating < 1) {
        stars.push(
          <svg
            key={i}
            className="star half"
            width="11"
            height="11"
            viewBox="0 0 24 24"
          >
            <defs>
              <linearGradient id={`t-half-${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#d5d0c8" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#t-half-${i})`}
            />
          </svg>,
        );
      } else {
        stars.push(
          <svg
            key={i}
            className="star empty"
            width="11"
            height="11"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="currentColor"
            />
          </svg>,
        );
      }
    }
    return stars;
  };

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-badge">{testimonialsText.badge}</span>
          <h2 className="section-title">{testimonialsText.title}</h2>
          <p className="section-subtitle">{testimonialsText.subtitle}</p>
        </div>

        <div className="testimonials-carousel-wrapper">
          <div className="testimonials-grid">
            {visibleCards.map((t) => (
              <div key={t.id} className="testimonial-card">
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-stars">{renderStars(t.rating)}</div>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.avatar}</div>
                  <span className="author-name">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {needsCarousel && (
          <div className="carousel-nav">
            <button
              className="carousel-btn"
              onClick={goToPrev}
              aria-label="Previous testimonials"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="carousel-center">
              <div className="carousel-dots">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`carousel-dot ${i === currentPage ? "active" : ""}`}
                    onClick={() => setCurrentPage(i)}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>
              <span className="carousel-page-info">
                <span className="current-page">{currentPage + 1}</span> /{" "}
                {totalPages}
              </span>
            </div>
            <button
              className="carousel-btn"
              onClick={goToNext}
              aria-label="Next testimonials"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Testimonials;
