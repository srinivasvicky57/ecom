import { useState } from 'react'

function getBirthdayLabel(daysUntil) {
    if (daysUntil === 0) return { text: 'Today 🎂', className: 'birthday-today' }
    if (daysUntil === 1) return { text: 'Tomorrow', className: 'birthday-tomorrow' }
    if (daysUntil <= 7) return { text: `In ${daysUntil} days`, className: 'birthday-this-week' }
    if (daysUntil <= 30) return { text: `In ${daysUntil} days`, className: 'birthday-this-month' }
    return { text: `In ${daysUntil} days`, className: 'birthday-later' }
}

function formatDOB(dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getTurningAge(dateStr) {
    const dob = new Date(dateStr)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) return age
    return age + (today.getMonth() === dob.getMonth() && today.getDate() === dob.getDate() ? 0 : 1)
}

const BIRTHDAY_GROUPS = [
    { key: 'today', title: '🎂 Today', filter: b => b.daysUntil === 0 },
    { key: 'tomorrow', title: '📅 Tomorrow', filter: b => b.daysUntil === 1 },
    { key: 'thisWeek', title: '🗓️ This Week', filter: b => b.daysUntil >= 2 && b.daysUntil <= 7 },
    { key: 'thisMonth', title: '📆 This Month', filter: b => b.daysUntil > 7 && b.daysUntil <= 30 },
    { key: 'later', title: '🔮 Upcoming', filter: b => b.daysUntil > 30 },
]

function AdminBirthdayWishes({ birthdays, loading, addToast }) {

    const sendBirthDayWIsh = (user) => {
//         const phone = `91${user.phone.replace(/\D/g, '').slice(-10)}`
//         const message = encodeURIComponent(
//             `🎂✨ *Happy Birthday, ${user.name}!* ✨🎂

// Wishing you a day filled with joy, love, and beautiful moments!

// May this new year of your life bring you happiness, good health, and all the success you deserve. 🌸🎉

// As a token of our love, enjoy *special birthday discounts* curated just for you — explore our latest collection today!

// With warm wishes,
// *Team MS Vastravarna* 🪷
// _Where tradition meets elegance_`
//         )
//         window.open(`https://wa.me/${phone}?text=${message}`, '_blank')

console.log( `🎂✨ *Happy Birthday, ${user.name}!* ✨🎂

Wishing you a day filled with joy, love, and beautiful moments!

May this new year of your life bring you happiness, good health, and all the success you deserve. 🌸🎉

As a token of our love, enjoy *special birthday discounts* curated just for you — explore our latest collection today!

With warm wishes,
*Team MS Vastravarna* 🪷
_Where tradition meets elegance_`);

    }


    const todayCount = birthdays.filter(b => b.daysUntil === 0).length
    const weekCount = birthdays.filter(b => b.daysUntil <= 7).length
    const monthCount = birthdays.filter(b => b.daysUntil <= 30).length

    return (
        <div className="profile-tab-content">
            <h3 className="profile-tab-title">🎂 Customer Birthdays</h3>
            {loading ? (
                <div className="admin-analytics-loading" style={{ padding: '2rem' }}>
                    <div className="admin-spinner" />
                    <p>Loading birthdays...</p>
                </div>
            ) : birthdays.length === 0 ? (
                <p className="analytics-empty">No customers with birthdays on record</p>
            ) : (
                <>
                    {/* Summary Stats */}
                    <div className="birthday-summary">
                        <div className="birthday-summary-card birthday-summary-today">
                            <span className="birthday-summary-icon">🎂</span>
                            <span className="birthday-summary-count">{todayCount}</span>
                            <span className="birthday-summary-label">Today</span>
                        </div>
                        <div className="birthday-summary-card birthday-summary-week">
                            <span className="birthday-summary-icon">🗓️</span>
                            <span className="birthday-summary-count">{weekCount}</span>
                            <span className="birthday-summary-label">This Week</span>
                        </div>
                        <div className="birthday-summary-card birthday-summary-month">
                            <span className="birthday-summary-icon">📆</span>
                            <span className="birthday-summary-count">{monthCount}</span>
                            <span className="birthday-summary-label">This Month</span>
                        </div>
                        <div className="birthday-summary-card birthday-summary-total">
                            <span className="birthday-summary-icon">👥</span>
                            <span className="birthday-summary-count">{birthdays.length}</span>
                            <span className="birthday-summary-label">Total</span>
                        </div>
                    </div>

                    {/* Grouped Birthday Lists */}
                    <div className="birthday-list">
                        {BIRTHDAY_GROUPS.map(group => {
                            const items = birthdays.filter(group.filter)
                            if (items.length === 0) return null
                            return (
                                <div key={group.key} className="birthday-group">
                                    <div className="birthday-group-header">
                                        <span className="birthday-group-title">{group.title}</span>
                                        <span className="birthday-group-count">{items.length}</span>
                                    </div>
                                    {items.map((b, i) => {
                                        const label = getBirthdayLabel(b.daysUntil)
                                        const turningAge = getTurningAge(b.dateOfBirth)
                                        return (
                                            <div
                                                key={b.userId}
                                                className={`birthday-card ${label.className}`}
                                                style={{ animationDelay: `${i * 0.06}s` }}
                                            >
                                                <div className="birthday-card-left">
                                                    <div className="birthday-avatar">
                                                        {b.name ? b.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div className="birthday-info">
                                                        <span className="birthday-name">{b.name}</span>
                                                        <span className="birthday-dob">
                                                            {formatDOB(b.dateOfBirth)}
                                                            <span className="birthday-age"> · Turning {turningAge}</span>
                                                        </span>
                                                        <span className="birthday-phone">
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                                                            </svg>
                                                            {b.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="birthday-card-right">
                                                    <span className={`birthday-badge ${label.className}`}>{label.text}</span>
                                                    <div className="birthday-actions">
                                                        <button
                                                            className="birthday-send-btn"
                                                            onClick={() => sendBirthDayWIsh(b)}
                                                            title={`Send WhatsApp wishes to ${b.name}`}
                                                        >
                                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                                            Wish
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}

export default AdminBirthdayWishes
