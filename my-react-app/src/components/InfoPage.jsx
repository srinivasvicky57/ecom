import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchInfo } from '../constants/api';
import { ShippingIcon, ReturnsIcon, SizeGuideIcon, FaqIcon } from '../assets/svgs';
import Loader from './Loader';

const SECTION_META = {
  shipping: {
    desc: 'Delivery timelines, charges & tracking',
    icon: <ShippingIcon />,
  },
  returns: {
    desc: 'Return policy, exchanges & refunds',
    icon: <ReturnsIcon />,
  },
  'size-guide': {
    desc: 'Measurements, charts & fitting tips',
    icon: <SizeGuideIcon />,
  },
  faq: {
    desc: 'Common queries answered',
    icon: <FaqIcon />,
  },
};

function InfoPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [section, setSection] = useState(null);
  const [allSections, setAllSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetchInfo()
      .then(all => {
        const current = all.find(s => s.type === type);
        if (!current) { setError(true); return; }
        setSection(current);
        setAllSections(all.filter(s => s.type !== type));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [type]);

  const meta = SECTION_META[type];

  if (loading) {
    return <Loader message="Loading..." />;
  }

  if (error || !section || !meta) {
    return (
      <div className="info-page">
        <div className="info-not-found">
          <h2>Page not found</h2>
          <p>The information page you're looking for doesn't exist.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="info-page">
      {/* Hero banner */}
      <div className="info-hero">
        <div className="info-hero-pattern"></div>
        <button className="info-back" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="info-hero-content">
          <span className="info-icon">{meta.icon}</span>
          <h1 className="info-title">{section.title}</h1>
          <p className="info-subtitle">{section.content.length} topics covered</p>
        </div>
      </div>

      <div className="info-body">
        {section.content.length > 0 ? (
          <div className="info-content">
            {section.content.map((item, i) => (
              <div key={i} className="info-card" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="info-card-index">{String(i + 1).padStart(2, '0')}</div>
                <div className="info-card-body">
                  <h3 className="info-card-heading">{item.heading}</h3>
                  {item.text && <p className="info-card-text">{item.text}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--kk-text-light)', padding: '40px 0' }}>
            No content available yet.
          </p>
        )}

        {/* Ornamental divider */}
        <div className="info-divider">
          <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
            <path d="M0 10 Q15 0, 30 10 Q45 20, 60 10" stroke="#C8933E" strokeWidth="1" opacity="0.4"/>
            <circle cx="30" cy="10" r="3" fill="#8B1A1A" opacity="0.25"/>
            <circle cx="10" cy="10" r="1.5" fill="#C8933E" opacity="0.3"/>
            <circle cx="50" cy="10" r="1.5" fill="#C8933E" opacity="0.3"/>
          </svg>
        </div>

        {/* Quick nav to other info sections */}
        {allSections.length > 0 && (
          <div className="info-nav">
            <h3 className="info-nav-title">Explore More</h3>
            <div className="info-nav-links">
              {allSections.map(s => {
                const m = SECTION_META[s.type];
                if (!m) return null;
                return (
                  <button key={s.type} className="info-nav-card" onClick={() => navigate(`/info/${s.type}`)}>
                    <span className="info-nav-icon">{m.icon}</span>
                    <span className="info-nav-text">
                      <span className="info-nav-label">{s.title}</span>
                      <span className="info-nav-desc">{m.desc}</span>
                    </span>
                    <span className="info-nav-arrow">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InfoPage;
