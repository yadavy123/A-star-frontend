/** Fee payment page with course selection, invoice, and payment history. */
import React, { useState } from 'react'
import Pagination from '../ui/Pagination'

export default function FeePayment() {
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedFee, setSelectedFee] = useState(null)
  const [feePage, setFeePage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const itemsPerPage = 100

  const feeStructure = [
    {
      id: 1,
      course: 'Mathematics Advanced',
      amount: 15000,
      dueDate: 'Feb 28, 2026',
      status: 'pending',
      term: 'Term 2'
    },
    {
      id: 2,
      course: 'Physics Fundamentals',
      amount: 12000,
      dueDate: 'Feb 28, 2026',
      status: 'pending',
      term: 'Term 2'
    },
    {
      id: 3,
      course: 'Chemistry Basics',
      amount: 10000,
      dueDate: 'Jan 15, 2026',
      status: 'paid',
      term: 'Term 1',
      paidOn: 'Jan 10, 2026'
    },
    {
      id: 4,
      course: 'Computer Science',
      amount: 18000,
      dueDate: 'Jan 15, 2026',
      status: 'paid',
      term: 'Term 1',
      paidOn: 'Jan 12, 2026'
    }
  ]

  const paymentHistory = [
    {
      id: 'PAY-2026-001',
      course: 'Chemistry Basics',
      amount: 10000,
      date: 'Jan 10, 2026',
      method: 'Credit Card',
      status: 'success'
    },
    {
      id: 'PAY-2026-002',
      course: 'Computer Science',
      amount: 18000,
      date: 'Jan 12, 2026',
      method: 'UPI',
      status: 'success'
    },
    {
      id: 'PAY-2025-015',
      course: 'Mathematics Advanced',
      amount: 15000,
      date: 'Dec 15, 2025',
      method: 'Bank Transfer',
      status: 'success'
    }
  ]

  const pendingAmount = feeStructure.filter(f => f.status === 'pending').reduce((acc, f) => acc + f.amount, 0)
  const paidAmount = feeStructure.filter(f => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0)

  // Pagination for Fee Structure
  const feeTotalPages = Math.ceil(feeStructure.length / itemsPerPage)
  const feeStartIndex = (feePage - 1) * itemsPerPage
  const paginatedFeeStructure = feeStructure.slice(feeStartIndex, feeStartIndex + itemsPerPage)

  // Pagination for Payment History
  const historyTotalPages = Math.ceil(paymentHistory.length / itemsPerPage)
  const historyStartIndex = (historyPage - 1) * itemsPerPage
  const paginatedPaymentHistory = paymentHistory.slice(historyStartIndex, historyStartIndex + itemsPerPage)

  const handlePayNow = (fee) => {
    setSelectedFee(fee)
    setShowPaymentModal(true)
  }

  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    alert('Payment processed successfully!')
    setShowPaymentModal(false)
    setSelectedFee(null)
  }

  const handleDownload = (payment) => {
    alert(`Downloading receipt for ${payment.id} — ${payment.course}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-normal text-[#0a0b0d]" style={{ lineHeight: 1.15, letterSpacing: '-0.5px' }}>Fee Payment</h2>
        <p className="text-[#5b616e] mt-2">Manage your course fees and payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4" style={{ borderLeftColor: '#dc3545' }}>
          <h3 className="text-sm font-semibold text-[#5b616e] mb-2">Pending Payment</h3>
          <p className="text-3xl font-bold" style={{ color: '#dc3545' }}>₹{pendingAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4" style={{ borderLeftColor: '#28a745' }}>
          <h3 className="text-sm font-semibold text-[#5b616e] mb-2">Paid This Term</h3>
          <p className="text-3xl font-bold" style={{ color: '#28a745' }}>₹{paidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6 border-l-4" style={{ borderLeftColor: '#1e3a8a' }}>
          <h3 className="text-sm font-semibold text-[#5b616e] mb-2">Total Courses</h3>
          <p className="text-3xl font-bold" style={{ color: '#1e3a8a' }}>{feeStructure.length}</p>
        </div>
      </div>

      {/* Current Fee Structure */}
      <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6">
        <h3 className="text-base font-semibold text-[#0a0b0d] mb-6">Current Fee Structure</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#dee1e6]">
                <th className="text-left py-3 px-4 font-semibold text-[#5b616e]">Course</th>
                <th className="text-left py-3 px-4 font-semibold text-[#5b616e]">Term</th>
                <th className="text-left py-3 px-4 font-semibold text-[#5b616e]">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-[#5b616e]">Due Date</th>
                <th className="text-left py-3 px-4 font-semibold text-[#5b616e]">Paid On</th>
                <th className="text-left py-3 px-4 font-semibold text-[#5b616e]">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-[#5b616e]">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFeeStructure.map((fee) => (
                <tr key={fee.id} className="border-b border-[#dee1e6] hover:bg-[#f7f7f7]">
                  <td className="py-3 px-4 font-semibold text-[#0a0b0d]">{fee.course}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-[100px] text-xs font-semibold text-white" style={{ backgroundColor: '#0052ff' }}>
                      {fee.term}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold" style={{ color: '#0052ff' }}>₹{fee.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-[#5b616e]">{fee.dueDate}</td>
                  <td className="py-3 px-4 text-sm text-[#5b616e]">{fee.paidOn || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className="px-3 py-1 rounded-[100px] text-xs font-semibold text-white"
                      style={{ backgroundColor: fee.status === 'paid' ? '#28a745' : '#dc3545' }}
                    >
                      {fee.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {fee.status === 'pending' ? (
                      <button
                        onClick={() => handlePayNow(fee)}
                        className="px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
                        style={{ height: 44, lineHeight: 1.15 }}
                      >
                        Pay Now
                      </button>
                    ) : (
                      <span className="text-sm font-semibold" style={{ color: '#28a745' }}>Paid ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={feePage}
          totalPages={feeTotalPages}
          onPageChange={setFeePage}
          totalItems={feeStructure.length}
          itemsPerPage={itemsPerPage}
          alwaysShow={true}
        />
      </div>

      {/* Payment History */}
      <div className="bg-white border border-[#dee1e6] rounded-[24px] p-6">
        <h3 className="text-base font-semibold text-[#0a0b0d] mb-6">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#dee1e6]">
                <th className="text-left py-3 px-4 font-semibold text-[#5b616e]">Transaction ID</th>
                <th className="text-left py-3 px-4 font-semibold text-[#5b616e]">Course</th>
                <th className="text-left py-3 px-4 font-semibold text-[#5b616e]">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-[#5b616e]">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-[#5b616e]">Method</th>
                <th className="text-left py-3 px-4 font-semibold text-[#5b616e]">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPaymentHistory.map((payment) => (
                <tr key={payment.id} className="border-b border-[#dee1e6] hover:bg-[#f7f7f7]">
                  <td className="py-3 px-4 font-mono text-sm text-[#5b616e]">{payment.id}</td>
                  <td className="py-3 px-4 text-[#5b616e]">{payment.course}</td>
                  <td className="py-3 px-4 font-bold" style={{ color: '#28a745' }}>₹{payment.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-[#5b616e]">{payment.date}</td>
                  <td className="py-3 px-4 text-[#5b616e]">{payment.method}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDownload(payment)}
                      className="px-4 py-2 rounded-[12px] text-sm font-semibold border bg-white transition-all hover:bg-[#f0f5ff]"
                      style={{ borderColor: '#0052ff', color: '#0052ff' }}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={historyPage}
          totalPages={historyTotalPages}
          onPageChange={setHistoryPage}
          totalItems={paymentHistory.length}
          itemsPerPage={itemsPerPage}
          alwaysShow={true}
        />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedFee && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-white border border-[#dee1e6] rounded-[24px] p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold mb-6 text-[#0a0b0d]">Payment Details</h2>
            
            <div className="mb-6 p-4 rounded-[12px]" style={{ backgroundColor: '#f0f5ff' }}>
              <h3 className="font-semibold text-lg mb-2 text-[#0a0b0d]">{selectedFee.course}</h3>
              <p className="text-3xl font-bold" style={{ color: '#0052ff' }}>₹{selectedFee.amount.toLocaleString()}</p>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#5b616e] mb-2">Payment Method</label>
                <select
                  className="w-full border border-[#dee1e6] rounded-[12px] focus:outline-none focus:border-[#0052ff]"
                  style={{ height: 48, padding: '14px 16px' }}
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 rounded-[100px] font-semibold border transition-all bg-white hover:bg-[#f7f7f7]"
                  style={{ borderColor: '#dee1e6', color: '#5b616e', height: 44, lineHeight: 1.15 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-5 py-3 bg-[#0052ff] text-white text-sm font-semibold rounded-[100px] hover:bg-[#003ecc] transition"
                  style={{ height: 44, lineHeight: 1.15 }}
                >
                  Proceed to Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
