import { useState, useEffect } from 'react'
import { isAuthenticated, fetchProfile } from '../constants/auth'
import { useToast } from './Toast'

const Banner = ({ text }) => {
  const [userName, setUserName] = useState('')
  const { addToast } = useToast()

  useEffect(() => {
    if (isAuthenticated()) {
      fetchProfile()
        .then(async res => {
          if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to load profile'); }
          return res.json();
        })
        .then(data => {
          if (data?.user?.name) setUserName(data.user.name.split(' ')[0])
        })
        .catch((err) => { setUserName(''); addToast(err.message, 'error'); })
    }
  }, [])

  if (!text) return null

  return (
    <div className="store-announcement">
      {/* 3D Megaphone */}
      <div className="ann-megaphone">
        <svg viewBox="0 0 110 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Sound arcs */}
          <path d="M10 25 Q3 35, 10 45" stroke="#E83A4F" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.5" />
          <path d="M17 18 Q7 35, 17 52" stroke="#E83A4F" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.65" />
          <path d="M24 12 Q11 35, 24 58" stroke="#D72638" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.8" />

          {/* Cone shadow (behind) */}
          <polygon points="36,24 78,10 78,58 36,44" fill="#9e1520" />
          {/* Cone body */}
          <polygon points="34,22 76,8 76,56 34,42" fill="url(#coneFace)" />
          {/* Cone highlight strip */}
          <polygon points="34,22 76,8 76,26 34,32" fill="rgba(255,255,255,0.12)" />

          {/* Mouth - back face (shadow) */}
          <rect x="77" y="7" width="14" height="54" rx="3" fill="#9e1520" />
          {/* Mouth - front face */}
          <rect x="76" y="5" width="14" height="54" rx="3" fill="url(#mouthFace)" />
          {/* Mouth top edge highlight */}
          <rect x="76" y="5" width="14" height="12" rx="3" fill="rgba(255,255,255,0.1)" />
          {/* Mouth inner ring */}
          <ellipse cx="83" cy="32" rx="4" ry="18" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

          {/* Handle shadow */}
          <rect x="32" y="26" width="8" height="18" rx="2" fill="#7a1018" />
          {/* Handle */}
          <rect x="30" y="24" width="8" height="18" rx="2" fill="url(#handleFace)" />

          {/* Bottom grip shadow */}
          <path d="M40 44 L40 70 L49 70 L49 52" fill="#7a1018" />
          {/* Bottom grip */}
          <path d="M38 42 L38 68 L47 68 L47 50" fill="url(#gripFace)" />
          {/* Grip highlight */}
          <path d="M38 42 L41 42 L41 68 L38 68" fill="rgba(255,255,255,0.08)" />

          <defs>
            <linearGradient id="coneFace" x1="34" y1="22" x2="34" y2="42">
              <stop offset="0%" stopColor="#EF4454" />
              <stop offset="100%" stopColor="#C21E30" />
            </linearGradient>
            <linearGradient id="mouthFace" x1="76" y1="5" x2="90" y2="5">
              <stop offset="0%" stopColor="#DA2A3C" />
              <stop offset="50%" stopColor="#EF4454" />
              <stop offset="100%" stopColor="#C21E30" />
            </linearGradient>
            <linearGradient id="handleFace" x1="30" y1="24" x2="38" y2="24">
              <stop offset="0%" stopColor="#C21E30" />
              <stop offset="100%" stopColor="#A0141E" />
            </linearGradient>
            <linearGradient id="gripFace" x1="38" y1="42" x2="47" y2="42">
              <stop offset="0%" stopColor="#DA2A3C" />
              <stop offset="100%" stopColor="#B01828" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 3D Ribbon body */}
      <div className="ann-ribbon">
        <div className="ann-ribbon-highlight"></div>
        <div className="ann-ribbon-shadow"></div>
        <span className="announcement-text">
          {userName ? `Hi ${userName}, ` : ''}{text}
        </span>
      </div>

      {/* V-cut tail with 3D split */}
      <div className="ann-ribbon-tail">
        <div className="ann-tail-top"></div>
        <div className="ann-tail-bottom"></div>
      </div>

      {/* Confetti stream from tail */}
      <div className="ann-papers-wrap">
        <div className="paper-bit pb1"></div>
        <div className="paper-bit pb2"></div>
        <div className="paper-bit pb3"></div>
        <div className="paper-bit pb4"></div>
        <div className="paper-bit pb5"></div>
        <div className="paper-bit pb6"></div>
      </div>
    </div>
  )
}

export default Banner
