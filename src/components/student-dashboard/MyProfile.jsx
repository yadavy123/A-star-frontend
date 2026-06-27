/** Student profile management - edit personal info, change password, manage contacts. */
import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function MyProfile({ studentData }) {
  const { updateProfile, changePassword } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [passwordChanging, setPasswordChanging] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    assignmentReminders: true,
    gradeUpdates: true,
    classReminders: true
  })
  
  const [formData, setFormData] = useState({
    name: studentData.name,
    email: studentData.email,
    phone: studentData.phone || '+91 98765 43210',
    address: 'Mumbai, Maharashtra, India',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pincode: '400001',
    dateOfBirth: '2003-05-15',
    guardianName: 'Mr. Rajesh Sharma',
    guardianPhone: '+91 98765 43211',
    educationLevel: 'Undergraduate',
    institution: 'Mumbai University',
    semester: '4th Semester',
    major: 'Computer Science'
  })

  const [originalFormData, setOriginalFormData] = useState({ ...formData })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    const result = updateProfile({
      fullName: formData.name,
      email: formData.email,
      phone: formData.phone
    })
    
    if (result.success) {
      setOriginalFormData({ ...formData })
      setIsEditing(false)
      alert('✅ Profile updated successfully!')
    } else {
      alert('❌ Failed to update profile. Please try again.')
    }
  }

  const handleCancel = () => {
    setFormData({ ...originalFormData })
    setIsEditing(false)
  }

  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      alert('⚠️ Please fill all required password fields')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('⚠️ New passwords do not match!')
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert('⚠️ Password must be at least 6 characters long')
      return
    }

    setPasswordChanging(true)
    const payload = { newPassword: passwordData.newPassword }
    if (passwordData.currentPassword) payload.oldPassword = passwordData.currentPassword
    const result = await changePassword(payload)
    setPasswordChanging(false)
    
    if (result.success) {
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      alert('✅ Password changed successfully!')
    } else {
      alert('❌ ' + (result.message || 'Failed to change password'))
    }
  }

  const handleSaveNotifications = () => {
    setShowNotificationModal(false)
    alert('✅ Notification preferences updated!')
  }

  const handleDeactivateAccount = () => {
    if (confirm('⚠️ Are you sure you want to deactivate your account? This action cannot be undone.')) {
      if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
        alert('Account deactivation requested. Please contact support to complete this process.')
      }
    }
  }

  const handleChangePhoto = () => {
    alert('📸 Photo upload feature coming soon! You can upload your profile picture here.')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-normal text-[#0a0b0d]" style={{ lineHeight: 1.15, letterSpacing: '-0.5px' }}>My Profile</h2>
          <p className="text-[#5b616e] text-sm">Manage your personal information and settings</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
            style={{ height: 44, lineHeight: 1.15 }}
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-5 py-3 bg-[#05b169] text-white text-sm font-semibold rounded-[100px] hover:bg-[#048c55] transition"
              style={{ height: 44, lineHeight: 1.15 }}
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-5 py-3 border border-[#dee1e6] text-[#0a0b0d] text-sm font-semibold rounded-[100px] hover:bg-[#f7f7f7] transition"
              style={{ height: 44, lineHeight: 1.15 }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-[24px] border border-[#dee1e6] p-8">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-28 h-28 rounded-full flex items-center justify-center font-semibold text-white text-4xl bg-[#0052ff]">
            {studentData.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <h3 className="text-3xl font-normal text-[#0a0b0d] mb-2" style={{ lineHeight: 1.15, letterSpacing: '-0.5px' }}>
              {formData.name}
            </h3>
            <p className="text-[#5b616e] mb-2 text-sm">Student ID: {studentData.studentId}</p>
            <p className="text-[#5b616e] mb-2 text-sm">{formData.email}</p>
            <div className="flex gap-2 mt-4">
              <span className="px-4 py-2 rounded-[100px] text-sm font-semibold bg-[#f7f7f7] text-[#0a0b0d]">
                {formData.educationLevel}
              </span>
              <span className="px-4 py-2 rounded-[100px] text-sm font-semibold bg-[#f7f7f7] text-[#0a0b0d]">
                {formData.semester}
              </span>
            </div>
          </div>
          <button
            onClick={handleChangePhoto}
            className="px-5 py-3 border border-[#dee1e6] text-[#0a0b0d] text-sm font-semibold rounded-[100px] hover:bg-[#f7f7f7] transition"
            style={{ height: 44, lineHeight: 1.15 }}
          >
            Change Photo
          </button>
        </div>

        {/* Personal Information */}
        <div className="border-t border-[#dee1e6] pt-6">
          <h4 className="text-base font-semibold text-[#0a0b0d] mb-6">Personal Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                />
              ) : (
                <p className="px-4 py-3 rounded-[12px] bg-[#f7f7f7] text-[#0a0b0d] text-sm" style={{ height: 48, lineHeight: '48px', padding: '0 16px' }}>{formData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Email Address</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                />
              ) : (
                <p className="px-4 py-3 rounded-[12px] bg-[#f7f7f7] text-[#0a0b0d] text-sm" style={{ height: 48, lineHeight: '48px', padding: '0 16px' }}>{formData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                />
              ) : (
                <p className="px-4 py-3 rounded-[12px] bg-[#f7f7f7] text-[#0a0b0d] text-sm" style={{ height: 48, lineHeight: '48px', padding: '0 16px' }}>{formData.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                />
              ) : (
                <p className="px-4 py-3 rounded-[12px] bg-[#f7f7f7] text-[#0a0b0d] text-sm" style={{ height: 48, lineHeight: '48px', padding: '0 16px' }}>{formData.dateOfBirth}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                />
              ) : (
                <p className="px-4 py-3 rounded-[12px] bg-[#f7f7f7] text-[#0a0b0d] text-sm" style={{ height: 48, lineHeight: '48px', padding: '0 16px' }}>{formData.address}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">City</label>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                />
              ) : (
                <p className="px-4 py-3 rounded-[12px] bg-[#f7f7f7] text-[#0a0b0d] text-sm" style={{ height: 48, lineHeight: '48px', padding: '0 16px' }}>{formData.city}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">State</label>
              {isEditing ? (
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                />
              ) : (
                <p className="px-4 py-3 rounded-[12px] bg-[#f7f7f7] text-[#0a0b0d] text-sm" style={{ height: 48, lineHeight: '48px', padding: '0 16px' }}>{formData.state}</p>
              )}
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="border-t border-[#dee1e6] pt-6 mt-8">
          <h4 className="text-base font-semibold text-[#0a0b0d] mb-6">Academic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Education Level</label>
              {isEditing ? (
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, lineHeight: 1.2 }}
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                  <option value="Diploma">Diploma</option>
                </select>
              ) : (
                <p className="px-4 py-3 rounded-[12px] bg-[#f7f7f7] text-[#0a0b0d] text-sm" style={{ height: 48, lineHeight: '48px', padding: '0 16px' }}>{formData.educationLevel}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Institution</label>
              {isEditing ? (
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                />
              ) : (
                <p className="px-4 py-3 rounded-[12px] bg-[#f7f7f7] text-[#0a0b0d] text-sm" style={{ height: 48, lineHeight: '48px', padding: '0 16px' }}>{formData.institution}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Current Semester</label>
              {isEditing ? (
                <input
                  type="text"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                />
              ) : (
                <p className="px-4 py-3 rounded-[12px] bg-[#f7f7f7] text-[#0a0b0d] text-sm" style={{ height: 48, lineHeight: '48px', padding: '0 16px' }}>{formData.semester}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Major/Field of Study</label>
              {isEditing ? (
                <input
                  type="text"
                  name="major"
                  value={formData.major}
                  onChange={handleInputChange}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                />
              ) : (
                <p className="px-4 py-3 rounded-[12px] bg-[#f7f7f7] text-[#0a0b0d] text-sm" style={{ height: 48, lineHeight: '48px', padding: '0 16px' }}>{formData.major}</p>
              )}
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="border-t border-[#dee1e6] pt-6 mt-8">
          <h4 className="text-base font-semibold text-[#0a0b0d] mb-6">Guardian Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Guardian Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleInputChange}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                />
              ) : (
                <p className="px-4 py-3 rounded-[12px] bg-[#f7f7f7] text-[#0a0b0d] text-sm" style={{ height: 48, lineHeight: '48px', padding: '0 16px' }}>{formData.guardianName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Guardian Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                />
              ) : (
                <p className="px-4 py-3 rounded-[12px] bg-[#f7f7f7] text-[#0a0b0d] text-sm" style={{ height: 48, lineHeight: '48px', padding: '0 16px' }}>{formData.guardianPhone}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-[24px] border border-[#dee1e6] p-6">
        <h4 className="text-base font-semibold text-[#0a0b0d] mb-6">Account Settings</h4>
        <div className="space-y-4">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="w-full px-5 py-4 rounded-[12px] text-left font-semibold text-sm border border-[#dee1e6] bg-[#f7f7f7] text-[#0a0b0d] hover:bg-white transition"
            style={{ height: 52, lineHeight: 1.15 }}
          >
            Change Password
          </button>
          <button
            onClick={() => setShowNotificationModal(true)}
            className="w-full px-5 py-4 rounded-[12px] text-left font-semibold text-sm border border-[#dee1e6] bg-[#f7f7f7] text-[#0a0b0d] hover:bg-white transition"
            style={{ height: 52, lineHeight: 1.15 }}
          >
            Notification Preferences
          </button>
          <button
            onClick={handleDeactivateAccount}
            className="w-full px-5 py-4 rounded-[12px] text-left font-semibold text-sm border border-[#dee1e6] bg-[#f7f7f7] text-[#cf202f] hover:bg-white transition"
            style={{ height: 52, lineHeight: 1.15 }}
          >
            Deactivate Account
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-white rounded-[24px] w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-[#dee1e6] p-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0a0b0d]">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-[#5b616e] hover:text-[#0a0b0d] text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Current Password <span className="font-normal normal-case text-[#a8acb3]">(optional — leave blank for OTP accounts)</span></label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                  placeholder="Leave blank if you use OTP login"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                  placeholder="Enter new password"
                />
                <p className="text-xs text-[#7c828a] mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7c828a] uppercase tracking-wider mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 text-sm text-[#0a0b0d] border border-[#dee1e6] rounded-[12px] outline-none focus:border-[#0052ff] transition"
                  style={{ height: 48, padding: '14px 16px', lineHeight: 1.2 }}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={passwordChanging}
                  className="flex-1 px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition disabled:opacity-50"
                  style={{ height: 44, lineHeight: 1.15 }}
                >
                  {passwordChanging ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  className="flex-1 px-5 py-3 border border-[#dee1e6] text-[#0a0b0d] text-sm font-semibold rounded-[100px] hover:bg-[#f7f7f7] transition"
                  style={{ height: 44, lineHeight: 1.15 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Preferences Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowNotificationModal(false)}>
          <div className="bg-white rounded-[24px] w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-[#dee1e6] p-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#0a0b0d]">Notification Preferences</h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-[#5b616e] hover:text-[#0a0b0d] text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-[12px] border border-[#dee1e6]">
                <span className="font-semibold text-sm text-[#0a0b0d]">Email Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#dee1e6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#05b169]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-[12px] border border-[#dee1e6]">
                <span className="font-semibold text-sm text-[#0a0b0d]">Push Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#dee1e6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#05b169]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 rounded-[12px] border border-[#dee1e6]">
                <span className="font-semibold text-sm text-[#0a0b0d]">SMS Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#dee1e6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#05b169]"></div>
                </label>
              </div>

              <div className="border-t border-[#dee1e6] pt-4 mt-4">
                <h4 className="font-semibold text-sm text-[#0a0b0d] mb-3">Notification Types</h4>

                <div className="flex items-center justify-between p-3 rounded-[12px] border border-[#dee1e6] mb-2">
                  <span className="text-sm text-[#5b616e]">Assignment Reminders</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.assignmentReminders}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, assignmentReminders: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#dee1e6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#05b169]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-[12px] border border-[#dee1e6] mb-2">
                  <span className="text-sm text-[#5b616e]">Grade Updates</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.gradeUpdates}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, gradeUpdates: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#dee1e6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#05b169]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 rounded-[12px] border border-[#dee1e6]">
                  <span className="text-sm text-[#5b616e]">Class Reminders</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.classReminders}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, classReminders: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#dee1e6] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#05b169]"></div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveNotifications}
                  className="flex-1 px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
                  style={{ height: 44, lineHeight: 1.15 }}
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="flex-1 px-5 py-3 border border-[#dee1e6] text-[#0a0b0d] text-sm font-semibold rounded-[100px] hover:bg-[#f7f7f7] transition"
                  style={{ height: 44, lineHeight: 1.15 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
