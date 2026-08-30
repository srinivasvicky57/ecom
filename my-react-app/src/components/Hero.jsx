import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paisley, Lotus, Peacock, Mango, Mandala, SmallFlower, TinyPaisley, TinyLotus } from '../assets/svgs';
import { fetchBanner } from '../constants/api';
import Banner from './Banner';

function Hero() {
  const navigate = useNavigate()
  const [bannerData, setBannerData] = useState(null)

  useEffect(() => {
    fetchBanner()
      .then(data => setBannerData(data))
      .catch(() => setBannerData(null))
  }, [])

  const badge = bannerData?.badge || 'Handcrafted with Love'
  const titleHighlight = bannerData?.title || 'MS Vastravarna'
  const titleLine1 = bannerData?.subheading || 'Every piece is a canvas, Every weave a legacy.'
  const titleLine2 = bannerData?.tagline || 'The ultimate kalamkari fashion house'
  const subtitle = bannerData?.description || 'Rediscover ancient traditions through contemporary silhouettes. Shop our signature hand-crafted collection.'
  const stats = [
    { value: bannerData?.products ? `${bannerData.products}+` : '0', label: 'Artisan Products' },
    { value: bannerData?.artisans ? `${bannerData.artisans}+` : '0', label: 'Master Artisans' },
    { value: bannerData?.happyCustomers ? `${bannerData.happyCustomers.toLocaleString()}+` : '0', label: 'Happy Customers' },
  ]

  return (
    <section id="home" className="hero">
      
      {/* Soft radial glows */}
      <div className="hero-overlay"></div>

      {/* Small floating Kalamkari design motifs */}
      <div className="hero-motifs">
        <Paisley className="motif motif-1" />
        <Lotus className="motif motif-2" />
        <Peacock className="motif motif-3" />
        <Mango className="motif motif-4" />
        <Mandala className="motif motif-5" />
        <SmallFlower className="motif motif-6" />
        <TinyPaisley className="motif motif-7" />
        <TinyLotus className="motif motif-8" />
      </div>

      <div className="hero-content">
        <Banner text={bannerData?.text} />
        <div className="hero-badge-wrapper">
          <span className="hero-badge">
            <span className="hero-badge-dot"></span>
            {badge}
            <span className="hero-badge-dot"></span>
          </span>
        </div>
        <h1 className="hero-title">
          <span className="hero-title-line">{titleLine1}</span>
          <span className="hero-highlight">{titleHighlight}</span>
          <span className="hero-title-line2">{titleLine2}</span>
        </h1>
        <p className="hero-subtitle">{subtitle}</p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-glow" onClick={() => navigate('/products')}>
            <span>Shop Collection</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginLeft: '8px'}}>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <a href="#about" className="btn btn-outline-dark">Our Story</a>
        </div>
        <div className="hero-divider">
          <span className="divider-ornament">
            <svg width="40" height="20" viewBox="0 0 40 20" fill="none">
              <path d="M0 10 Q10 0, 20 10 Q30 20, 40 10" stroke="#C8933E" strokeWidth="1" opacity="0.4"/>
              <circle cx="20" cy="10" r="2.5" fill="#8B1A1A" opacity="0.3"/>
            </svg>
          </span>
        </div>
        <div className="hero-stats">
          {stats.map((stat, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div className="stat-separator"></div>}
              <div className="stat">
                <span className="stat-number">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

    </section>
  );
}

export default Hero;
