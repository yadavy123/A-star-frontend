import React, { useState, useEffect } from 'react'
import { Lock, Mail, Phone, MapPin, Save, X, Eye, EyeOff, Upload } from 'lucide-react'
import { getMe, changePassword } from '../../api/api/accountApi.js'
import toast from 'react-hot-toast'

export default function AdminProfile({ adminData }) {
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: adminData.name || '',
    email: adminData.email || '',
    phone: '',
    address: '',
    position: adminData.role || 'Administrator'
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMe();
        setLastLogin(data.lastLogin || null);
        setFormData({
          name: data.name || adminData.name || '',
          email: data.email || adminData.email || '',
          phone: data.mobile || '+91 98765 43210',
          address: data.address || 'New Delhi, India',
          position: data.role || adminData.role || 'Administrator'
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [adminData]);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordLoading, setPasswordLoading] = useState(false)

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [lastLogin, setLastLogin] = useState(null)

  const formatLastLogin = (utcDate) => {
    if (!utcDate) return 'N/A';
    try {
      const d = new Date(utcDate);
      const dateStr = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
      return `${dateStr}, ${timeStr} IST`;
    } catch {
      return 'N/A';
    }
  }

  const [stats, setStats] = useState({
    totalStudents: 1542,
    totalCourses: 24,
    totalTeachers: 18,
    activeClasses: 12
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('Please fill all required fields')
      return
    }
    alert('Profile updated successfully!')
    setIsEditing(false)
  }

  const handleUpdatePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill all required password fields')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setPasswordLoading(true)
    try {
      const payload = { newPassword: passwordData.newPassword }
      if (passwordData.currentPassword) payload.oldPassword = passwordData.currentPassword
      await changePassword(payload)
      toast.success('Password updated successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowChangePasswordForm(false)
    } catch (error) {
      const errMsg = error?.message || error?.error || 'Failed to update password. Please try again.'
      toast.error(errMsg)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 30
      })
    }, 300)

    const reader = new FileReader()
    reader.onload = (event) => {
      setProfileImage(event.target.result)
      setTimeout(() => {
        setUploadProgress(0)
        alert('Profile picture uploaded successfully!')
      }, 1000)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-[32px] font-normal text-[#0a0b0d]" style={{ lineHeight: 1.13, letterSpacing: '-0.4px' }}>Admin Profile</h2>
        <p className="text-[#5b616e] text-sm mt-1" style={{ lineHeight: 1.5 }}>Manage your admin account and settings</p>
      </div>

      <div className="bg-white rounded-[24px] border border-[#dee1e6] p-[32px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8 pb-8 border-b border-[#dee1e6]">
          <div className="flex items-center gap-6">
            <div className="relative group">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center font-semibold text-white text-4xl bg-[#0052ff]"
                >
                  {adminData.name.charAt(0)}
                </div>
              )}

              <label
                htmlFor="profile-image-input"
                className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <div className="text-center">
                  <Upload size={24} className="text-white mx-auto mb-1" />
                  <span className="text-white text-xs font-semibold">Change</span>
                </div>
              </label>

              <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute bottom-0 left-0 right-0 rounded-full h-1 bg-[#eef0f3]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      backgroundColor: '#05b169',
                      width: `${uploadProgress}%`
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-normal text-[#0a0b0d]" style={{ lineHeight: 1.0, letterSpacing: '-1px' }}>{adminData.name}</h3>
              <p className="text-[#5b616e]" style={{ lineHeight: 1.5 }}>{formData.position}</p>
              <p className="text-sm text-[#7c828a]" style={{ lineHeight: 1.5 }}>ID: {adminData.adminId}</p>
              <p className="text-xs text-[#a8acb3] mt-1" style={{ lineHeight: 1.5 }}>Hover on photo to change</p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-5 py-3 rounded-[100px] text-white font-semibold hover:opacity-90 transition-all ${isEditing ? 'bg-[#cf202f]' : 'bg-[#0052ff]'}`}
            style={{ height: 44, lineHeight: 1.15 }}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#0a0b0d] mb-2" style={{ lineHeight: 1.25 }}>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-[16px] py-[14px] rounded-[12px] border focus:outline-none transition-all text-[16px] text-[#0a0b0d]"
                style={{
                  height: 48,
                  lineHeight: 1.5,
                  borderColor: isEditing ? '#0052ff' : '#dee1e6',
                  backgroundColor: isEditing ? 'white' : '#f7f7f7'
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0a0b0d] mb-2" style={{ lineHeight: 1.25 }}>Email (Read-only)</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-[16px] py-[14px] rounded-[12px] border border-[#dee1e6] bg-[#f7f7f7] text-[16px] text-[#0a0b0d]"
                style={{ height: 48, lineHeight: 1.5 }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0a0b0d] mb-2" style={{ lineHeight: 1.25 }}>Phone Number *</label>
              <div className="flex items-center gap-2">
                <Phone size={20} className="text-[#0052ff]" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="flex-1 px-[16px] py-[14px] rounded-[12px] border focus:outline-none transition-all text-[16px] text-[#0a0b0d]"
                  style={{
                    height: 48,
                    lineHeight: 1.5,
                    borderColor: isEditing ? '#0052ff' : '#dee1e6',
                    backgroundColor: isEditing ? 'white' : '#f7f7f7'
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0a0b0d] mb-2" style={{ lineHeight: 1.25 }}>Position *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-[16px] py-[14px] rounded-[12px] border focus:outline-none transition-all text-[16px] text-[#0a0b0d]"
                style={{
                  height: 48,
                  lineHeight: 1.5,
                  borderColor: isEditing ? '#0052ff' : '#dee1e6',
                  backgroundColor: isEditing ? 'white' : '#f7f7f7'
                }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#0a0b0d] mb-2" style={{ lineHeight: 1.25 }}>Address *</label>
              <div className="flex items-start gap-2">
                <MapPin size={20} className="mt-3 text-[#0052ff]" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="flex-1 px-[16px] py-[14px] rounded-[12px] border focus:outline-none transition-all text-[16px] text-[#0a0b0d]"
                  style={{
                    height: 48,
                    lineHeight: 1.5,
                    borderColor: isEditing ? '#0052ff' : '#dee1e6',
                    backgroundColor: isEditing ? 'white' : '#f7f7f7'
                  }}
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-6 border-t border-[#dee1e6]">
              <button
                onClick={handleSaveProfile}
                className="flex-1 px-5 py-3 rounded-[100px] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all bg-[#0052ff]"
                style={{ height: 44, lineHeight: 1.15 }}
              >
                <Save size={20} /> Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-5 py-3 rounded-[100px] bg-[#eef0f3] text-[#0a0b0d] font-semibold flex items-center justify-center gap-2 hover:bg-[#dee1e6] transition-all"
                style={{ height: 44, lineHeight: 1.15 }}
              >
                <X size={20} /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-[#dee1e6] p-[32px]">
        <h3 className="text-[18px] font-semibold mb-6 text-[#0a0b0d]" style={{ lineHeight: 1.33 }}>
          Security Settings
        </h3>

        <div className="space-y-4">
          <button
            onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}
            className="w-full px-5 py-3 rounded-[100px] text-white font-semibold flex items-center justify-between hover:opacity-90 transition-all bg-[#0052ff]"
            style={{ height: 44, lineHeight: 1.15 }}
          >
            <span className="flex items-center gap-2">
              <Lock size={20} /> Change Password
            </span>
            <span>{showChangePasswordForm ? '▲' : '▼'}</span>
          </button>

          {showChangePasswordForm && (
            <div className="mt-4 p-[24px] bg-[#f7f7f7] rounded-[24px] border border-[#dee1e6]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0a0b0d] mb-2" style={{ lineHeight: 1.25 }}>Current Password <span className="font-normal text-[#7c828a]">(optional)</span></label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-[16px] py-[14px] rounded-[12px] border border-[#dee1e6] pr-10 focus:outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10 text-[16px] text-[#0a0b0d]"
                      style={{ height: 48, lineHeight: 1.5 }}
                      placeholder="Leave blank if you use OTP login"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-3 text-[#7c828a]"
                    >
                      {showPasswords.current ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0a0b0d] mb-2" style={{ lineHeight: 1.25 }}>New Password *</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-[16px] py-[14px] rounded-[12px] border border-[#dee1e6] pr-10 focus:outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10 text-[16px] text-[#0a0b0d]"
                      style={{ height: 48, lineHeight: 1.5 }}
                      placeholder="Enter new password (min. 8 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-3 text-[#7c828a]"
                    >
                      {showPasswords.new ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0a0b0d] mb-2" style={{ lineHeight: 1.25 }}>Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-[16px] py-[14px] rounded-[12px] border border-[#dee1e6] pr-10 focus:outline-none focus:border-[#0052ff] focus:ring-2 focus:ring-[#0052ff]/10 text-[16px] text-[#0a0b0d]"
                      style={{ height: 48, lineHeight: 1.5 }}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-3 text-[#7c828a]"
                    >
                      {showPasswords.confirm ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpdatePassword}
                    disabled={passwordLoading}
                    className="flex-1 px-5 py-3 rounded-[100px] text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 bg-[#0052ff]"
                    style={{ height: 44, lineHeight: 1.15 }}
                  >
                    {passwordLoading ? 'Updating...' : <><Save size={20} /> Update Password</>}
                  </button>
                  <button
                    onClick={() => {
                      setShowChangePasswordForm(false)
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                    className="flex-1 px-5 py-3 rounded-[100px] bg-[#eef0f3] text-[#0a0b0d] font-semibold flex items-center justify-center gap-2 hover:bg-[#dee1e6] transition-all"
                    style={{ height: 44, lineHeight: 1.15 }}
                  >
                    <X size={20} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-[#dee1e6] p-[32px]">
        <h3 className="text-[18px] font-semibold mb-6 text-[#0a0b0d]" style={{ lineHeight: 1.33 }}>
          Account Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-[#5b616e] font-semibold mb-1" style={{ lineHeight: 1.25 }}>Admin ID</p>
            <p className="text-lg font-semibold text-[#0a0b0d]">{adminData.adminId}</p>
          </div>
          <div>
            <p className="text-sm text-[#5b616e] font-semibold mb-1" style={{ lineHeight: 1.25 }}>Role</p>
            <p className="text-lg font-semibold text-[#0a0b0d]">{adminData.role}</p>
          </div>
          <div>
            <p className="text-sm text-[#5b616e] font-semibold mb-1" style={{ lineHeight: 1.25 }}>Account Status</p>
            <span className="inline-block px-[12px] py-[4px] rounded-[100px] text-xs font-semibold bg-[#f7f7f7] text-[#05b169]">
              Active
            </span>
          </div>
          <div>
            <p className="text-sm text-[#5b616e] font-semibold mb-1" style={{ lineHeight: 1.25 }}>Member Since</p>
            <p className="text-lg font-semibold text-[#0a0b0d]">January 2024</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-[#5b616e] font-semibold mb-1" style={{ lineHeight: 1.25 }}>Last Login</p>
            <p className="text-lg font-semibold text-[#0a0b0d]">{formatLastLogin(lastLogin)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
