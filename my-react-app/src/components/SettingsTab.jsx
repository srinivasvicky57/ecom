import { useState, useRef } from 'react'
import { changePassword, updateProfile } from '../constants/auth'

const profileValidators = {
  name: (val) => {
    if (!val.trim()) return 'Name is required';
    if (!/^[a-zA-Z\s]+$/.test(val)) return 'Name should contain only alphabets';
    return '';
  },
  phone: (val) => {
    if (!val.trim()) return 'Phone number is required';
    if (!/^\d{10}$/.test(val)) return 'Phone number must be exactly 10 digits';
    return '';
  },
};

const profileFilters = {
  name: (val) => val.replace(/[^a-zA-Z\s]/g, ''),
  phone: (val) => val.replace(/\D/g, '').slice(0, 10),
};

const validatePassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length < 4) return 'Password must be at least 4 characters';
  return '';
};

function SettingsTab({ user, setUserDetails, addToast }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user.name,
     phone: user.phone, 
     dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
      gender: user.gender || '' })
  const [errors, setErrors] = useState({})
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', verifyPassword: '' })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordLoading, setPasswordLoading] = useState(false)
  const nameRef = useRef(null)

  const handleChange = (field, rawValue) => {
    const val = profileFilters[field] ? profileFilters[field](rawValue) : rawValue
    setForm(prev => ({ ...prev, [field]: val }))
    const err = profileValidators[field]?.(val) || ''
    setErrors(prev => ({ ...prev, [field]: err }))
  }

  const handleEdit = () => {
    setForm({ name: user.name, phone: user.phone, dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '', gender: user.gender || '' })
    setErrors({})
    setEditing(true)
    setTimeout(() => nameRef.current?.focus(), 50)
  }

  const handleCancel = () => {
    setEditing(false)
    setErrors({})
  }

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
    setPasswordErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}
    if (!passwordForm.currentPassword) newErrors.currentPassword = 'Current password is required'
    else if (passwordForm.currentPassword.length < 4) newErrors.currentPassword = 'Password must be at least 4 characters'
    const newPasswordError = validatePassword(passwordForm.newPassword)
    if (newPasswordError) newErrors.newPassword = newPasswordError
    if (!passwordForm.verifyPassword) newErrors.verifyPassword = 'Please verify your password'
    else if (passwordForm.newPassword !== passwordForm.verifyPassword) newErrors.verifyPassword = 'Passwords do not match'
    if (Object.keys(newErrors).length) { setPasswordErrors(newErrors); return }

    setPasswordLoading(true)
    try {
      const res = await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update password')
      addToast(data.message, 'success')
      setPasswordForm({ currentPassword: '', newPassword: '', verifyPassword: '' })
      setPasswordErrors({})
      setShowPasswordForm(false)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSave = (e) => {
    e.preventDefault()
    const newErrors = {}
    for (const field of ['name', 'phone']) {
      const err = profileValidators[field](form[field])
      if (err) newErrors[field] = err
    }
    if (Object.keys(newErrors).length) { setErrors(newErrors); return }

    updateProfile({ name: form.name, phone: form.phone, dateOfBirth: form.dateOfBirth || null, gender: form.gender || null })
      .then(async res => {
        if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Update failed') }
        return res.json()
      })
      .then(data => {
        if (data.user) setUserDetails(data.user)
        addToast('Profile updated successfully', 'success')
        setEditing(false)
      })
      .catch(err => addToast(err.message, 'error'))
  }

  return (
    <div className="profile-tab-content">
      <h3 className="profile-tab-title">Account Settings</h3>
      <div className="settings-section">

        <div className="settings-group">
          <h4 className="settings-group-title">Update Profile</h4>
          <form className="profile-update-form" onSubmit={handleSave}>
            <div className="profile-form-row">
              <label className="profile-form-label">Full Name</label>
              <input
                ref={nameRef}
                className={`profile-form-input${errors.name ? ' profile-form-error' : ''}`}
                name="name"
                value={editing ? form.name : user.name}
                readOnly={!editing}
                onChange={(e) => handleChange('name', e.target.value)}
              />
              {errors.name && <span className="profile-field-error">{errors.name}</span>}
            </div>
            
            <div className="profile-form-row">
              <label className="profile-form-label">Email Address</label>
              <input className="profile-form-input" name="email" value={user.email} />
            </div>
            <div className="profile-form-row">
              <label className="profile-form-label">Phone Number</label>
              <input
                className={`profile-form-input${errors.phone ? ' profile-form-error' : ''}`}
                name="phone"
                type="tel"
                maxLength={10}
                value={editing ? form.phone : user.phone}
                readOnly={!editing}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              {errors.phone && <span className="profile-field-error">{errors.phone}</span>}
            </div>
            <div className="profile-form-row">
              <label className="profile-form-label">Date of Birth</label>
              <input
                className="profile-form-input"
                name="dateOfBirth"
                type="date"
                value={editing ? form.dateOfBirth : (user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '')}
                readOnly={!editing}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              />
            </div>
            <div className="profile-form-row">
              <label className="profile-form-label">Gender</label>
              {editing ? (
                <select
                  className="profile-form-input"
                  name="gender"
                  value={form.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <input
                  className="profile-form-input"
                  value={user.gender || ''}
                  readOnly
                />
              )}
            </div>
            {editing ? (
              <div className="profile-form-actions">
                <button type="submit" className="settings-action-btn profile-save-btn">Save Changes</button>
                <button type="button" className="settings-action-btn" onClick={handleCancel}>Cancel</button>
              </div>
            ) : (
              <button type="button" className="settings-action-btn profile-save-btn" onClick={handleEdit}>Update</button>
            )}
          </form>
        </div>

        <div className="settings-group">
          <h4 className="settings-group-title">Account Actions</h4>
          <button
            type="button"
            className="settings-action-btn"
            onClick={() => { setShowPasswordForm(prev => !prev); setPasswordErrors({}) }}
          >
            Change Password
          </button>
          {showPasswordForm && (
            <form className="change-password-form" onSubmit={handlePasswordSubmit}>
              {[
                ['currentPassword', 'Enter existing password'],
                ['newPassword', 'Enter new password'],
                ['verifyPassword', 'Verify new password'],
              ].map(([field, label]) => (
                <div className="profile-form-row" key={field}>
                  <label className="profile-form-label">{label}</label>
                  <input
                    className={`profile-form-input${passwordErrors[field] ? ' profile-form-error' : ''}`}
                    type="password"
                    value={passwordForm[field]}
                    onChange={(e) => handlePasswordChange(field, e.target.value)}
                  />
                  {passwordErrors[field] && <span className="profile-field-error">{passwordErrors[field]}</span>}
                </div>
              ))}
              <div className="profile-form-actions">
                <button type="submit" className="settings-action-btn profile-save-btn" disabled={passwordLoading}>
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
                <button type="button" className="settings-action-btn" onClick={() => setShowPasswordForm(false)}>Cancel</button>
              </div>
            </form>
          )}
          {/* <button className="settings-action-btn settings-action-danger">Delete Account</button> */}
        </div>
      </div>
    </div>
  )
}

export default SettingsTab
