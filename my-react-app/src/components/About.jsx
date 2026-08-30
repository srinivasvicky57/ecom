import { aboutText } from '../data/siteContent';
import { FeatureIcon, AboutMandala } from '../assets/svgs';

function About() {
  return (
    <section id="about" className="about-section">
      <div className="kalamkari-border-top" />
      <div className="section-container">
        <div className="about-grid">
          <AboutContent />
          <AboutVisual />
        </div>
      </div>
    </section>
  );
}

function AboutContent() {
  return (
    <div className="about-content">
      <span className="section-badge">{aboutText.badge}</span>
      <h2 className="section-title">{aboutText.title}</h2>
      {aboutText.description.map((text, i) => (
        <p key={i} dangerouslySetInnerHTML={{ __html: text }} />
      ))}
      <div className="about-features">
        {aboutText.features.map((feat, i) => (
          <div className="feature" key={i}>
            <div className="feature-icon-wrapper">
              <FeatureIcon color={feat.iconColor} icon={feat.icon} showDiamond={i === 0} />
            </div>
            <div>
              <h4>{feat.title}</h4>
              <p>{feat.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutVisual() {
  return (
    <div className="about-visual">
      <div className="about-showcase">
        <div className="showcase-main">
          <div className="showcase-circle">
            <AboutMandala />
            <div className="showcase-text">
              <span className="showcase-number">{aboutText.showcase.number}</span>
              <span className="showcase-label">{aboutText.showcase.label}</span>
            </div>
          </div>
        </div>
        <div className="about-image-grid">
          {aboutText.imageCards.map((card, i) => (
            <div key={i} className={`about-img-card${card.large ? ' large' : ''}`}>
              <div className="about-img-placeholder">{card.icon}</div>
              <span>{card.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default About;
