import React, { useState, useEffect, useCallback } from 'react';
import ScrollableCard from './ScrollableCard';
import Pagination from '../ui/Pagination';
import { getStudents, createStudent, deleteStudent, updateStudentStatus } from '../../api/api/studentApi';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', email: '', phone: '', password: '123456' };

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const itemsPerPage = 100;

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const res = await getStudents();
    setStudents(res.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(student.id).includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (form.phone && !/^[\d\s\-+()]{7,20}$/.test(form.phone)) errs.phone = 'Invalid phone number';
    if (!form.password.trim()) errs.password = 'Password is required';
    else if (form.password.length < 4) errs.password = 'Password must be at least 4 characters';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const newStudent = {
      id: `STU${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: 'active',
      enrollmentDate: new Date().toISOString().split('T')[0],
    };

    const res = await createStudent(newStudent);
    if (res.success) {
      toast.success('Student added successfully');
      setStudents(prev => [...prev, newStudent]);
    } else {
      toast.error(res.error || 'Failed to add student');
    }

    setShowAddModal(false);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setSaving(false);
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    await deleteStudent(id);
    setStudents(prev => prev.filter(s => s.id !== id));
    toast.success('Student deleted');
  };

  const handleStatusUpdate = async (id, newStatus) => {
    await updateStudentStatus(id, newStatus);
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const totalActive = students.filter(s => s.status === 'active').length;
  const totalInactive = students.filter(s => s.status === 'inactive').length;
  const totalPending = students.filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-blue-900">Student Management</h2>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Manage all registered students</p>
        </div>
        <button onClick={() => { setForm(EMPTY_FORM); setFormErrors({}); setShowAddModal(true); }}
          className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-white font-bold shadow-md hover:opacity-90 transition-all w-full md:w-auto bg-blue-900 text-sm sm:text-base">
          + Add New Student
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="bg-white rounded-xl shadow-md p-2 sm:p-3 border-l-4 border-blue-900">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Total Students</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900">{students.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-2 sm:p-3 border-l-4 border-green-600">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Active</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-700">{totalActive}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-2 sm:p-3 border-l-4 border-yellow-500">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Inactive</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600">{totalInactive}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-2 sm:p-3 border-l-4 border-amber-700">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Pending</h3>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-700">{totalPending}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-2 sm:p-3 md:p-2">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
              <input type="text" placeholder="Search by name, email, or ID..." value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 border-gray-100 focus:outline-none text-sm" />
              <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border-2 border-gray-100 focus:outline-none text-sm">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md">
            <ScrollableCard>
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b-2 border-gray-100" style={{ backgroundColor: '#fefce8' }}>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-blue-900 text-xs sm:text-sm">Student ID</th>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-blue-900 text-xs sm:text-sm">Name</th>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-blue-900 text-xs sm:text-sm">Email</th>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-blue-900 text-xs sm:text-sm">Phone</th>
                    <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-blue-900 text-xs sm:text-sm">Status</th>
                    <th className="text-right py-3 sm:py-4 px-3 sm:px-6 font-bold text-blue-900 text-xs sm:text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-16 text-gray-500 font-medium text-sm">
                        {searchTerm || filterStatus !== 'all' ? 'No students found matching your search.' : 'No students yet. Add your first student!'}
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student) => (
                      <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 sm:py-4 px-3 sm:px-6 font-mono text-xs sm:text-sm">{student.id}</td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 font-semibold text-xs sm:text-sm">{student.name}</td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm">{student.email}</td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm whitespace-nowrap">{student.phone || '-'}</td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6">
                          <select value={student.status || 'active'}
                            onChange={(e) => handleStatusUpdate(student.id, e.target.value)}
                            className="px-2 py-1 rounded text-xs sm:text-sm border border-gray-100">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2 flex-nowrap">
                            <button onClick={() => handleDeleteStudent(student.id)}
                              className="min-w-[88px] px-3 py-2 rounded-lg text-xs font-semibold text-white text-center hover:opacity-90 whitespace-nowrap"
                              style={{ backgroundColor: '#dc3545' }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </ScrollableCard>
            <div className="px-3 sm:px-6 pb-4">
              <Pagination currentPage={currentPage} totalPages={totalPages}
                onPageChange={setCurrentPage} totalItems={filteredStudents.length}
                itemsPerPage={itemsPerPage} alwaysShow={true} />
            </div>
          </div>
        </>
      )}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => { if (!saving) setShowAddModal(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 text-blue-900">Add New Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none ${formErrors.name ? 'border-red-500' : 'border-gray-200'}`} />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none ${formErrors.email ? 'border-red-500' : 'border-gray-200'}`} />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none ${formErrors.phone ? 'border-red-500' : 'border-gray-200'}`} />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password <span className="text-red-500">*</span></label>
                  <input type="password" value={form.password} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                    className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none ${formErrors.password ? 'border-red-500' : 'border-gray-200'}`} />
                  {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} disabled={saving}
                  className="flex-1 py-3 rounded-lg font-bold border-2 transition-all"
                  style={{ borderColor: '#dc3545', color: '#dc3545' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 rounded-lg text-white font-bold shadow-md hover:opacity-90 transition-all bg-blue-900 disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
