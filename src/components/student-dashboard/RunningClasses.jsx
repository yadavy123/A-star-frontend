/** Running classes page - view enrolled classes with subject filter. */
import React, { useState, useEffect } from 'react'
import { runningClassesApi } from '../../api/runningClassesApi'
import Pagination from '../ui/Pagination'

const ENUM_TO_CATEGORY = { UNDERGRADUATE: 'IGCSE', POST_GRADUATE: 'AS Level', PROFESSIONAL: 'A Level', Undergraduate: 'IGCSE', 'Post-Graduate': 'AS Level', Professional: 'A Level' }

export default function RunningClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  const displayCategory = (c) => ENUM_TO_CATEGORY[c.category || c.level] || (c.category || c.level)

  const filtered = filterCategory === 'All' ? classes : classes.filter(c => displayCategory(c) === filterCategory)
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedClasses = filtered.slice(startIndex, startIndex + itemsPerPage)

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true)
        const res = await runningClassesApi.getAll()
        const data = res.data?.content || res.data?.data || res.data || []
        const active = Array.isArray(data)
          ? data.filter(c => c.status === 'ACTIVE' || c.status === 'Active' || c.status === 'active')
          : []
        setClasses(active)
      } catch {
        setClasses([])
      } finally {
        setLoading(false)
      }
    }
    fetchClasses()
  }, [])

  const categories = ['All', ...Array.from(new Set(classes.map(c => displayCategory(c)).filter(Boolean)))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-normal text-[#0a0b0d]" style={{ lineHeight: 1.15, letterSpacing: '-0.5px' }}>Running Classes</h2>
        <p className="text-[#7c828a] text-sm mt-1">Browse all currently active classes available for you</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Active', value: classes.length, color: 'border-blue-900', textColor: 'text-blue-900' },
          { label: 'IGCSE', value: classes.filter(c => displayCategory(c) === 'IGCSE').length, color: 'border-yellow-400', textColor: 'text-yellow-600' },
          { label: 'AS Level', value: classes.filter(c => displayCategory(c) === 'AS Level').length, color: 'border-orange-400', textColor: 'text-orange-600' },
          { label: 'A Level', value: classes.filter(c => displayCategory(c) === 'A Level').length, color: 'border-green-500', textColor: 'text-green-600' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white border border-[#dee1e6] rounded-[24px] p-5 border-l-4 ${stat.color}`}>
            <p className="text-xs font-semibold text-[#7c828a] mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="bg-white border border-[#dee1e6] rounded-[24px] p-4 flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-[12px] font-semibold text-sm transition-all ${
              filterCategory === cat
                ? 'bg-[#0052ff] text-white'
                : 'bg-[#f7f7f7] text-[#5b616e] hover:bg-[#dee1e6]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-[100px] h-12 w-12 border-t-2 border-b-2 border-[#0052ff] border-t-[#f59e0b]"></div>
            <p className="mt-4 text-lg font-semibold text-[#0a0b0d]">Loading classes...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-12 text-center">
          <p className="text-[#7c828a] text-lg">No active classes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedClasses.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white rounded-[24px] overflow-hidden transition-all duration-300 border border-[#dee1e6] hover:border-[#0052ff] flex flex-col"
            >
              {classItem.image && (
                <img
                  src={classItem.image}
                  alt={classItem.title || classItem.subject}
                  className="w-full h-36 object-cover"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              )}

              <div className="p-5 flex flex-col flex-1">
                <span className="inline-block bg-[#f0f5ff] text-[#0052ff] text-xs font-semibold px-3 py-1 rounded-[100px] mb-2 w-fit">
                  {(classItem.category || classItem.level)?.replace('_', ' ')}
                </span>

                <h3 className="text-base font-semibold text-[#0a0b0d] mb-2 leading-tight">
                  {classItem.title || classItem.subject}
                </h3>

                <p className="text-[#5b616e] text-xs mb-4 leading-relaxed line-clamp-2 flex-1">
                  {classItem.description}
                </p>

                <div className="space-y-1.5 text-xs text-[#5b616e] border-t border-[#dee1e6] pt-3 mb-3">
                  <p className="flex items-start gap-1.5">
                    <span className="font-semibold text-[#0a0b0d] shrink-0">📅 Schedule:</span>
                    <span>{classItem.schedule}</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="font-semibold text-[#0a0b0d] shrink-0">👥 Batch size:</span>
                    <span>{classItem.batchSize || classItem.students}</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="font-semibold text-[#0a0b0d] shrink-0">👨‍🏫 Instructor:</span>
                    <span>{classItem.instructorName || classItem.instructor}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#dee1e6]">
                  <span className={`px-3 py-1 rounded-[100px] text-xs font-semibold text-white ${classItem.status === 'ACTIVE' ? 'bg-[#28a745]' : 'bg-[#0052ff]'}`}>
                    {classItem.status}
                  </span>
                  <span className="text-xs text-[#28a745] font-semibold">● Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        alwaysShow={true}
      />
    </div>
  )
}
