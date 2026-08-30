import { useState, useEffect } from 'react'
import { authFetch } from '../../constants/auth'
import { API_URL } from '../../constants/api'
import { UsersGroupIcon } from '../../assets/svgs'

const GENDER_COLORS = {
  Male: '#3D5A80',
  Female: '#B5392B',
  Other: '#D4982A',
  'Not specified': '#9E9587',
}

function AdminAnalytics({ addToast }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authFetch(`${API_URL}/admin/analytics`)
      .then(async res => {
        if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Failed to load analytics') }
        return res.json()
      })
      .then(d => setData(d))
      .catch(err => addToast(err.message, 'error'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="admin-analytics-loading">
        <div className="admin-spinner" />
        <p>Loading analytics...</p>
      </div>
    )
  }

  if (!data) return null

  const genderEntries = Object.entries(data.gender).filter(([, v]) => v > 0)
  const total = genderEntries.reduce((s, [, v]) => s + v, 0)

  // Build pie chart segments
  let cumulativePercent = 0
  const segments = genderEntries.map(([label, count]) => {
    const percent = (count / total) * 100
    const start = cumulativePercent
    cumulativePercent += percent
    return { label, count, percent, start, color: GENDER_COLORS[label] || '#999' }
  })

  // Build conic-gradient string
  const conicStops = segments.map(s =>
    `${s.color} ${s.start}% ${s.start + s.percent}%`
  ).join(', ')

  return (
    <div className="admin-analytics">
      <div className="analytics-layout">
        {/* Left — Stat Cards */}
        <div className="analytics-left">
          <div className="analytics-stat-card">
            <div className="analytics-stat-icon">
              <UsersGroupIcon />
            </div>
            <div className="analytics-stat-info">
              <span className="analytics-stat-value">{data.totalUsers}</span>
              <span className="analytics-stat-label">Total Registered Users</span>
            </div>
          </div>
          <div className="analytics-stat-card">
            <div className="analytics-stat-icon analytics-stat-icon-active">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div className="analytics-stat-info">
              <span className="analytics-stat-value">{data.activeUsers || 0}</span>
              <span className="analytics-stat-label">
                Active Now
                <span className="analytics-active-dot" />
              </span>
            </div>
          </div>
        </div>

        {/* Right — Gender Chart */}
        <div className="analytics-right">
          <h3 className="analytics-chart-title">Gender Distribution</h3>
          {total === 0 ? (
            <p className="analytics-empty">No user data available</p>
          ) : (
            <div className="analytics-chart-row">
              <div className="analytics-donut-wrapper">
                <div
                  className="analytics-donut"
                  style={{ background: `conic-gradient(${conicStops})` }}
                >
                  <div className="analytics-donut-hole">
                    <span className="analytics-donut-total">{total}</span>
                    <span className="analytics-donut-label">Users</span>
                  </div>
                </div>
              </div>
              <div className="analytics-legend">
                {segments.map(s => (
                  <div key={s.label} className="analytics-legend-item">
                    <span className="analytics-legend-dot" style={{ background: s.color }} />
                    <span className="analytics-legend-label">{s.label}</span>
                    <span className="analytics-legend-count">{s.count}</span>
                    <span className="analytics-legend-pct">{s.percent.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics
