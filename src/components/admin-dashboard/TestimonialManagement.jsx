import React, { useState, useEffect } from 'react';
import { Star, Trash2, Check, X, AlertCircle, Eye, Plus, Video, Music, FileText, Image as ImageIcon, Upload, Send, Save, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllTestimonials,
  approveTestimonial,
  rejectTestimonial,
  deleteTestimonial,
  setPrimaryTestimonial,
  submitTestimonial,
  updateTestimonial,
  createTestimonialAdmin,
  exportTestimonialsToCSV
} from '../../api/api/testimonialApi.js';
import ScrollableCard from './ScrollableCard'
import { getPublicTeachers } from '../../api/api/teacherApi';
import { uploadToCloudinary } from '../../utils/cloudinaryUpload';

export default function TestimonialManagement() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    text: '',
    mediaUrl: ''
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchTestimonials(0);
  }, [selectedStatus]);

  const fetchTeachers = async () => {
    try {
      const data = await getPublicTeachers();
      setTeachers(data?.content || (Array.isArray(data) ? data : []));
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchTestimonials = async (p = 0) => {
    setLoading(true);
    try {
      const data = await getAllTestimonials({ page: p, size: 10 });
      const testimonialList = data?.content || (Array.isArray(data) ? data : []);
      setTestimonials(testimonialList);
      setPage(data?.page ?? 0);
      setTotalPages(data?.totalPages ?? 0);
      setTotalElements(data?.totalElements ?? 0);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (p) => {
    if (p < 0 || p >= totalPages) return;
    fetchTestimonials(p);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024;
    
    if (file.size > maxSize) {
      toast.error(`File size too large. Max ${isImage ? '5MB' : '50MB'} allowed.`);
      return;
    }

    setMediaFile(file);
    setFormData(prev => ({ ...prev, type: 'URL' }));

    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.text && !mediaFile) {
      toast.error('Please provide at least text or media');
      return;
    }

    setActionLoading('submitting');
    try {
      let finalMediaUrl = formData.mediaUrl;

      if (mediaFile) {
        setUploading(true);
        const uploadedUrl = await uploadToCloudinary(mediaFile);
        finalMediaUrl = uploadedUrl;
        setUploading(false);
      }

      const payload = {
        text: formData.text,
        mediaUrl: finalMediaUrl
      };

      if (editingId) {
        await updateTestimonial(editingId, payload);
        toast.success('Testimonial updated successfully');
      } else {
        await createTestimonialAdmin(payload);
        toast.success('Testimonial added successfully');
      }

      setIsAdding(false);
      setEditingId(null);
      resetForm();
      fetchTestimonials(0);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error?.message || 'Failed to save testimonial');
    } finally {
      setActionLoading(null);
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      text: '',
      mediaUrl: ''
    });
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approveTestimonial(id);
      await fetchTestimonials(page);
      toast.success('Testimonial approved');
    } catch (error) {
      console.error('Error approving testimonial:', error);
      toast.error('Failed to approve testimonial');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await rejectTestimonial(id);
      await fetchTestimonials(page);
      toast.success('Testimonial rejected');
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
      toast.error('Failed to reject testimonial');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportTestimonialsToCSV();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `testimonials-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export started');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export testimonials');
    }
  };

  const handleSetPrimary = async (id, wasPrimary, testimonial) => {
    setActionLoading(id);
    try {
      if (wasPrimary) {
        await updateTestimonial(id, {
          text: testimonial.text || testimonial.message || testimonial.quote || testimonial.content || '',
          mediaUrl: testimonial.mediaUrl || testimonial.videoUrl || testimonial.image || '',
          primary: false
        });
        toast.success('Primary unset');
      } else {
        await setPrimaryTestimonial(id);
        toast.success('Testimonial set as primary');
      }
      await fetchTestimonials(page);
    } catch (error) {
      console.error('Error updating primary:', error);
      toast.error(wasPrimary ? 'Failed to unset primary' : 'Failed to set primary testimonial');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (t) => {
    const id = t.id || t._id;
    setEditingId(id);
    setFormData({
      text: t.text || t.message || t.quote || t.content || '',
      mediaUrl: t.mediaUrl || t.videoUrl || t.image || ''
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    setActionLoading(id);
    try {
      await deleteTestimonial(id);
      const remaining = testimonials.filter((t) => (t.id !== id && t._id !== id));
      if (remaining.length === 0 && page > 0) {
        fetchTestimonials(page - 1);
      } else {
        setTestimonials(remaining);
      }
      toast.success('Testimonial deleted');
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTestimonials =
    selectedStatus === 'all'
      ? testimonials
      : testimonials.filter((t) => t.status === selectedStatus);

  const pageNumbers = [];
  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(0);
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages - 2, page + 2);
    if (start > 1) pageNumbers.push('...');
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    if (end < totalPages - 2) pageNumbers.push('...');
    pageNumbers.push(totalPages - 1);
  }

  const statusBadge = (status) => {
    const s = 'APPROVED';
    const map = {
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
    };
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${map[s]}`}>
        Approved
      </span>
    );
  };

  const typeIcon = (type) => {
    switch (type) {
      case 'video': return <Video size={14} className="text-blue-600" />;
      case 'audio': return <Music size={14} className="text-purple-600" />;
      case 'image': return <ImageIcon size={14} className="text-green-600" />;
      default: return <FileText size={14} className="text-gray-600" />;
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white border-b-2 border-blue-900 rounded-xl p-6 mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-900">Testimonial Management</h1>
          <p className="text-gray-500 text-sm mt-1">Review, approve, and manage student testimonials</p>
        </div>
        <div className="flex items-center justify-end gap-3 max-sm:w-full max-sm:gap-1.5">
          <button 
            onClick={handleExport}
            className="max-sm:flex-1 sm:flex-none h-11 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-5 rounded-xl border-2 border-blue-900 bg-white text-blue-900 font-bold hover:bg-blue-50 transition-all shadow-sm text-[11px] sm:text-sm"
          >
            <Upload size={16} className="rotate-180 shrink-0" /> <span className="whitespace-nowrap">Export CSV</span>
          </button>
          {!isAdding && (
            <button 
              onClick={() => { setEditingId(null); resetForm(); setIsAdding(true); }}
              className="max-sm:flex-1 sm:flex-none h-11 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-5 rounded-xl bg-blue-900 text-white font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 text-[11px] sm:text-sm"
            >
              <Plus size={16} className="shrink-0" /> <span className="whitespace-nowrap">Add Testimonial</span>
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800 text-blue-900">
              {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h2>
            <button onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Testimonial Text</label>
                <textarea 
                  name="text" 
                  rows="5" 
                  required
                  value={formData.text} 
                  onChange={handleInputChange} 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none resize-none" 
                  placeholder="Enter the student's review text here..."
                ></textarea>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Media Upload (Image/Video/Audio)</label>
                  <div className="flex items-center gap-4">
                    {mediaPreview ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-900 shadow-sm">
                        <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-md"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                        <Upload size={24} />
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="flex flex-col items-center justify-center gap-1 px-4 py-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-100 transition-all group">
                        <ImageIcon size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
                        <span className="text-xs text-blue-700 font-bold uppercase tracking-tight">
                          {uploading ? 'Uploading...' : 'Choose Media File'}
                        </span>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*,video/*,audio/*"
                        onChange={handleMediaChange}
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Or Paste Media URL</label>
                  <input 
                    name="mediaUrl"
                    type="url"
                    value={formData.mediaUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                type="button" 
                onClick={() => { setIsAdding(false); setEditingId(null); resetForm(); }} 
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={actionLoading === 'submitting' || uploading}
                className="px-8 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition shadow-md flex items-center gap-2 disabled:opacity-70"
              >
                {actionLoading === 'submitting' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={18} />
                )}
                {editingId ? 'Update Testimonial' : 'Create Testimonial'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading testimonials...</p>
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <AlertCircle className="mx-auto mb-3 text-gray-400" size={40} />
          <p className="text-gray-600">
            No {selectedStatus !== 'all' ? selectedStatus : ''} testimonials found
          </p>
        </div>
      ) : (
        <ScrollableCard className="rounded-xl border border-gray-200 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-900 text-white text-left">
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Content Preview</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestimonials.map((t, idx) => {
                const id = t.id || t._id;
                
                return (
                  <tr key={id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{page * 10 + idx + 1}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium max-w-[300px]">
                      <span className="line-clamp-2">{t.text || t.message || t.quote || t.content}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        {t.primary && (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter w-fit">
                            Primary
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-start gap-2">
                        <button
                          onClick={() => handleSetPrimary(id, t.primary, t)}
                          disabled={actionLoading === id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 min-w-[118px] justify-center ${t.primary ? 'bg-indigo-600' : 'bg-indigo-400'} text-white rounded-lg hover:bg-indigo-500 transition-all disabled:opacity-50 text-[10px] font-bold shadow-sm whitespace-nowrap`}
                        >
                          <Star size={12} fill={t.primary ? "white" : "none"} /> {t.primary ? 'UNSET PRIMARY' : 'SET PRIMARY'}
                        </button>
                        <button
                          onClick={() => handleEdit(t)}
                          className="flex items-center gap-1.5 px-3 py-1.5 min-w-[60px] justify-center bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all text-[10px] font-bold shadow-sm whitespace-nowrap"
                        >
                          <Edit size={12} /> EDIT
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          disabled={actionLoading === id}
                          className="flex items-center gap-1.5 px-3 py-1.5 min-w-[72px] justify-center bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 text-[10px] font-bold shadow-sm whitespace-nowrap"
                        >
                          <Trash2 size={12} /> DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollableCard>
      )}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 bg-white rounded-xl border border-gray-200 shadow-sm mt-4">
          <div className="text-sm text-gray-500">
            Page {page + 1} of {totalPages} ({totalElements} total)
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            {pageNumbers.map((p, i) =>
              p === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                    p === page
                      ? 'bg-blue-900 text-white shadow'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p + 1}
                </button>
              )
            )}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {viewModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setViewModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-blue-900 uppercase tracking-tight">
                  {viewModal.name || viewModal.reviewerName || 'Anonymous Student'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase tracking-tighter">
                    {viewModal.role || viewModal.category || 'Student'}
                  </span>
                  {viewModal.subject && (
                    <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase tracking-tighter">
                      {viewModal.subject}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {statusBadge(viewModal.status)}
                {viewModal.primary && <div className="text-[9px] font-black text-indigo-600 mt-1 uppercase">Featured</div>}
              </div>
            </div>

            <div className="flex gap-1 mb-6 bg-yellow-50 w-fit px-3 py-1.5 rounded-full border border-yellow-100">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < (viewModal.rating || 5) ? 'fill-[#eab308] text-[#eab308]' : 'text-gray-300'}
                />
              ))}
              <span className="ml-2 text-xs font-bold text-yellow-700">{viewModal.rating || 5}/5 Rating</span>
            </div>

            <p className="text-gray-700 leading-relaxed mb-4">{viewModal.message || viewModal.content}</p>

            {viewModal.type === 'video' && (
              <div className="rounded-xl overflow-hidden bg-black aspect-video mb-4">
                <iframe 
                  src={viewModal.videoUrl || viewModal.content} 
                  className="w-full h-full" 
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {viewModal.type === 'image' && (
              <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200 mb-4">
                <img 
                  src={viewModal.image || viewModal.content} 
                  className="w-full h-auto max-h-[400px] object-contain mx-auto" 
                  alt="Testimonial Preview"
                />
              </div>
            )}

            {viewModal.type === 'audio' && (
              <div className="bg-purple-50 p-4 rounded-xl mb-4">
                <audio src={viewModal.audioUrl || viewModal.content} controls className="w-full" />
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={() => setViewModal(null)}
                className="px-6 py-2 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
