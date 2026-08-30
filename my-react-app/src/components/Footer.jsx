import { Link, useNavigate, useLocation } from 'react-router-dom';
import { footerText } from '../data/siteContent';

function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleLinkClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const id = href.slice(1);
      if (!isHomePage) {
        navigate('/', { state: { scrollTo: id } });
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer">
      <div className="footer-pattern"></div>
      <div className="footer-container">
        <div className="footer-grid">

          <div className="footer-brand">
            <h3>
              <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink: 0}}>
                <circle cx="18" cy="18" r="17" stroke="var(--kk-mustard)" strokeWidth="1.5" opacity="0.6"/>
                <path d="M18 4 C20 10, 24 14, 30 16 C24 18, 20 22, 18 28 C16 22, 12 18, 6 16 C12 14, 16 10, 18 4Z" fill="var(--kk-mustard)" opacity="0.8"/>
                <circle cx="18" cy="16" r="3" fill="var(--kk-cream)" opacity="0.9"/>
              </svg>
              {footerText.brandName}
            </h3>
            <p>{footerText.brandDescription}</p>
            <div className="social-links">
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/>
                 <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                 <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" title="WhatsApp">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
              <a href="mailto:tsrinivasulureddy333@gmail.com" title="Gmail">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/>
                 <path d="M22 4L12 13 2 4"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h4>{footerText.quickLinks.title}</h4>
            <ul>
              {footerText.quickLinks.links.map((link, i) => (
                <li key={i}>
                  {link.href.startsWith('/') ? (
                    <Link to={link.href}>{link.label}</Link>
                  ) : (
                    <a href={link.href} onClick={(e) => handleLinkClick(e, link.href)}>{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="footer-links">
            <h4>{footerText.customerCare.title}</h4>
            <ul>
              {footerText.customerCare.links.map((link, i) => (
                <li key={i}>
                  {link.href.startsWith('/') ? (
                    <Link to={link.href}>{link.label}</Link>
                  ) : (
                    <a href={link.href} onClick={(e) => handleLinkClick(e, link.href)}>{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-newsletter">
            <h4>{footerText.newsletter.title}</h4>
            <p>{footerText.newsletter.description}</p>
            <div className="newsletter-form">
              <input type="email" placeholder={footerText.newsletter.placeholder} />
              <button className="btn btn-primary">{footerText.newsletter.buttonText}</button>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p>{footerText.copyright}</p>
          <p className="footer-developer">
            Developed by Tharugu Srinivasulu Reddy &nbsp;|&nbsp;
            <a href="mailto:tsrinivasulureddy333@gmail.com" title="tsrinivasulureddy333@gmail.com"
             onClick={(e) => handleLinkClick(e, "mailto:tsrinivasulureddy333@gmail.com")}>
              Click here to contact
            </a>
          </p>
        </div>
        
      </div>
    </footer>
  );
}

export default Footer;
