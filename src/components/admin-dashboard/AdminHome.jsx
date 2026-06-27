import React, { useMemo } from 'react';
import { Users, BookOpen, GraduationCap, FileText, DollarSign, MessageSquare, ClipboardList, Bell, BarChart2, Star, HelpCircle, FlaskConical, Newspaper, Folder } from 'lucide-react';

const getStats = () => {
  try {
    const students = JSON.parse(localStorage.getItem('icfy_admin_students') || localStorage.getItem('icfy_users') || '[]').filter(u => u.role !== 'admin')
    const payments = JSON.parse(localStorage.getItem('feePayments') || '[]')
    const classes = JSON.parse(localStorage.getItem('icfy_running_classes') || '[]')
    const demoRequests = JSON.parse(localStorage.getItem('icfy_demo_requests') || '[]')
    const homework = JSON.parse(localStorage.getItem('icfy_homework') || '[]')
    const announcements = JSON.parse(localStorage.getItem('icfy_announcements') || '[]')
    const enrollments = JSON.parse(localStorage.getItem('runningClassEnrollments') || '[]')
    const totalRevenue = payments.reduce((s, p) => s + Number(p.feeAmount || p.amount || 0), 0)
    const pendingDemos = demoRequests.filter(r => r.status === 'pending').length
    const pendingEnrollments = enrollments.filter(e => e.status === 'Pending').length
    return { students: students.length, payments: payments.length, classes: classes.filter(c => c.status === 'Active').length, totalRevenue, demoRequests: demoRequests.length, homework: homework.length, announcements: announcements.length, pendingDemos, pendingEnrollments }
  } catch { return { students: 0, payments: 0, classes: 0, totalRevenue: 0, demoRequests: 0, homework: 0, announcements: 0, pendingDemos: 0, pendingEnrollments: 0 } }
}

export default function AdminHome({ setCurrentView }) {
  const stats = useMemo(getStats, [])

  const statCards = [
    // { label: 'Total Students', value: stats.students, color: '#1e3a8a', bg: '#eff6ff', id: 'students' },
    // { label: 'Active Classes', value: stats.classes, color: '#1e3a8a', bg: '#eff6ff', id: 'running-classes' },
    { label: 'Total Payments', value: stats.payments, color: '#28a745', bg: '#f0fff4', id: 'fee-payment' },
    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: '#28a745', bg: '#f0fff4', id: 'fee-payment' },
    { label: 'Demo Requests', value: stats.demoRequests, color: stats.pendingDemos > 0 ? '#ffc107' : '#1e3a8a', bg: '#fefce8', id: 'demo-requests' },
    { label: 'Pending Enrollments', value: stats.pendingEnrollments, color: stats.pendingEnrollments > 0 ? '#dc3545' : '#1e3a8a', bg: '#fff5f5', id: 'running-classes' },
    // { label: 'Homework Tasks', value: stats.homework, color: '#1e3a8a', bg: '#eff6ff', id: 'homework' },
    // { label: 'Announcements', value: stats.announcements, color: '#eab308', bg: '#fefce8', id: 'announcements' },
  ]

  const menuCards = [
    { id: 'students', label: 'Students', icon: Users, description: 'View & manage registered students' },
    { id: 'courses', label: 'Courses', icon: BookOpen, description: 'Create & manage course catalog' },
    { id: 'running-classes', label: 'Running Classes', icon: GraduationCap, description: 'Manage active classes & enrollments' },
    { id: 'fee-payment', label: 'Fee Payments', icon: DollarSign, description: 'Track payment records from frontend' },
    { id: 'demo-requests', label: 'Demo Requests', icon: FileText, description: 'Manage demo class bookings' },
    { id: 'contact-requests', label: 'Contact Requests', icon: MessageSquare, description: 'Manage website contact inquiries' },
    // { id: 'homework', label: 'Homework', icon: ClipboardList, description: 'Assign & manage homework tasks' },
    // { id: 'practice-tests', label: 'Practice Tests', icon: FlaskConical, description: 'Create & manage tests' },
    // { id: 'announcements', label: 'Announcements', icon: Bell, description: 'Post announcements to students' },
    { id: 'questions', label: 'Q&A Management', icon: HelpCircle, description: 'Answer student questions' },
    { id: 'categories', label: 'Categories', icon: Folder, description: 'Manage categories' },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare, description: 'View & respond to reviews' },
    { id: 'testimonials', label: 'Testimonials', icon: Star, description: 'Moderate testimonial submissions' },
    { id: 'blog', label: 'Blog', icon: Newspaper, description: 'Manage blog posts & subscribers' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Admin alerts & notifications' },
    { id: 'profile', label: 'My Profile', icon: BarChart2, description: 'View & edit admin profile' },
  ]

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
      <div className="mb-8">
        <h1 className="text-[32px] font-normal text-[#0a0b0d]" style={{ lineHeight: 1.13, letterSpacing: '-0.4px' }}>Admin Dashboard</h1>
        <p className="text-[#5b616e] text-sm mt-1" style={{ lineHeight: 1.5 }}>Welcome back! Here's a live overview of A Star Classes.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <button key={s.label} onClick={() => setCurrentView(s.id)}
            className="rounded-[24px] border border-[#dee1e6] p-[24px] text-left hover:bg-[#f7f7f7] transition-all bg-white">
            <p className="text-[12px] font-semibold text-[#7c828a] mb-1 uppercase tracking-wide" style={{ lineHeight: 1.5 }}>{s.label}</p>
            <p className="text-[32px] font-normal text-[#0a0b0d]" style={{ lineHeight: 1.0, letterSpacing: '-1px' }}>{s.value}</p>
          </button>
        ))}
      </div>

      <h2 className="text-[18px] font-semibold mb-[20px] text-[#0a0b0d]" style={{ lineHeight: 1.33 }}>Management Sections</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {menuCards.map(card => (
          <button key={card.id} onClick={() => setCurrentView(card.id)}
            className="bg-white rounded-[24px] border border-[#dee1e6] p-[24px] text-left hover:border-[#0052ff] transition-all">
            <div className="p-2 rounded-[12px] mb-3 w-fit bg-[#f7f7f7]">
              <card.icon className="w-5 h-5 text-[#0052ff]" />
            </div>
            <h3 className="font-semibold text-sm mb-1 text-[#0a0b0d]" style={{ lineHeight: 1.25 }}>{card.label}</h3>
            <p className="text-xs text-[#5b616e]" style={{ lineHeight: 1.5 }}>{card.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
