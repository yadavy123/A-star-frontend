import { useEffect, useState } from 'react'
import { Building2, CheckCircle, Copy, CreditCard, Mail, MapPin, MessageCircle, Phone, QrCode, Shield, Smartphone, ChevronDown, ChevronUp, IndianRupee, Loader2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { paymentApi, type PaymentReceipt } from '../api/paymentApi'
import qrCodeImg from '../assets/code.jpeg'

const bankDetails = {
  bankName: 'HDFC Bank',
  accountName: 'DRONAVYAS IXPOE PVT LTD',
  accountType: 'Current Account',
  accountNumber: '50200002163572',
  ifscCode: 'HDFC0002377',
  micrCode: '560240072',
  swiftCode: 'HDFCINBBBNG',
  branch: 'Old No 118, 1/1, Whitefield Main Rd, opposite Reliance Fresh, Dodsworth Layout, Whitefield, Bengaluru, Karnataka 560066',
  country: 'India',
  state: 'Karnataka',
  city: 'Bengaluru',
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function FeePayment() {
  const [copiedField, setCopiedField] = useState('')
  const [qrError, setQrError] = useState(false)
  const [showFullBranch, setShowFullBranch] = useState(false)

  const [amount, setAmount] = useState('')
  const [studentName, setStudentName] = useState('')
  const [email, setEmail] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null)

  const handlePayOnline = async () => {
    const amt = parseInt(amount.replace(/,/g, ''), 10)
    if (!amt || amt < 1) {
      toast.error('Please enter a valid amount (minimum ₹1).')
      return
    }
    if (!window.Razorpay) {
      toast.error('Payment gateway is loading. Please try again.')
      return
    }

    setPaymentLoading(true)
    try {
      const order = await paymentApi.createOrder(amt)
      if (!order.razorpayOrderId) {
        throw new Error('Failed to create payment order')
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_xxxxxxxxxxxx',
        amount: order.amount * 100,
        currency: order.currency,
        name: 'A Star Classes',
        description: 'Online Fee Payment',
        order_id: order.razorpayOrderId,
        prefill: {
          name: studentName || undefined,
          email: email || undefined,
        },
        theme: { color: '#1e3a8a' },
        handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
          try {
            const result = await paymentApi.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            )
            if (result.success) {
              const newReceipt: PaymentReceipt = {
                transactionId: response.razorpay_payment_id,
                amount: amt,
                currency: order.currency,
                status: 'completed',
                paidAt: new Date().toISOString(),
                studentName: studentName || undefined,
                email: email || undefined,
                paymentMethod: 'Razorpay',
              }
              paymentApi.saveLocalPayment(newReceipt)
              setReceipt(newReceipt)
              toast.success('Payment successful!')
            } else {
              toast.error(result.message || 'Payment verification failed.')
            }
          } catch {
            toast.error('Payment verification failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: function () {
            toast.error('Payment cancelled.')
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Unable to initiate payment. Please try again or use bank transfer.')
    } finally {
      setPaymentLoading(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(''), 2000)
    } catch {
      setCopiedField('')
    }
  }

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <button type="button" onClick={() => copyToClipboard(text, field)}
      className="p-1.5 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors group touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0"
      title="Copy to clipboard">
      {copiedField === field ? (
        <CheckCircle className="w-3.5 h-3.5 text-green-600" />
      ) : (
        <Copy className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-900" />
      )}
    </button>
  )

  const DetailRow = ({ label, value, field, icon: Icon, highlight = false }: {
    label: string; value: string; field?: string; icon?: typeof Building2; highlight?: boolean
  }) => (
    <div className={`flex items-start py-3 border-b border-gray-100 last:border-0 ${highlight ? 'bg-blue-50/70 -mx-3 px-3 rounded-lg' : ''}`}>
      {Icon && <Icon className="w-4 h-4 text-blue-900 mt-1 mr-3 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
        <div className="flex items-center gap-1">
          <p className={`text-sm font-semibold break-all ${highlight ? 'text-blue-900' : 'text-gray-900'}`}>{value}</p>
          {field && <CopyButton text={value} field={field} />}
        </div>
      </div>
    </div>
  )

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-4')
          entry.target.classList.add('opacity-100', 'translate-y-0')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15 })
    document.querySelectorAll('[data-aos]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const branchShort = bankDetails.branch.length > 60 ? bankDetails.branch.slice(0, 60) + '...' : bankDetails.branch

  return (
    <div className="w-full bg-white">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-900 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <Shield className="w-3.5 h-3.5" />
              Secure Payment
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900">Pay Fees Online</h1>
            <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
              Pay online via card, UPI, or net banking, or use bank transfer / UPI QR code. All transactions are 100% secure.
            </p>
          </div>

          {/* Receipt */}
          {receipt && (
            <div className="mb-8 bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 p-5 sm:p-6 text-center">
                <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" />
                <h2 className="text-xl font-bold text-green-800">Payment Successful!</h2>
                <p className="text-sm text-green-600">Your payment has been processed successfully.</p>
              </div>
              <div className="p-5 sm:p-6 space-y-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Transaction ID</span><span className="font-mono font-semibold">{receipt.transactionId}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Amount</span><span className="font-bold text-green-700">₹{receipt.amount.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Date</span><span>{new Date(receipt.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className="text-green-600 font-semibold">Completed</span></div>
                {receipt.studentName && <div className="flex justify-between text-sm"><span className="text-gray-500">Student</span><span>{receipt.studentName}</span></div>}
                <div className="pt-3 border-t border-gray-100 text-center">
                  <button type="button" onClick={() => setReceipt(null)} className="text-sm text-blue-900 hover:underline font-semibold">
                    Make another payment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Online Payment Card */}
          <div className="mb-8 bg-white rounded-2xl shadow-lg border border-blue-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-5 sm:p-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white/10 p-2.5 rounded-xl inline-flex">
                  <IndianRupee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Pay Online</h2>
                  <p className="text-blue-200 text-xs font-medium">Credit Card &bull; Debit Card &bull; UPI &bull; Net Banking</p>
                </div>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="sm:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Student Name <span className="text-gray-400">(optional)</span></label>
                  <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none text-sm" placeholder="Your name" />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-gray-400">(optional)</span></label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none text-sm" placeholder="email@example.com" />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Amount (₹) *</label>
                  <input type="text" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-900 focus:outline-none text-sm" placeholder="Enter amount" />
                </div>
              </div>
              <button type="button" onClick={handlePayOnline} disabled={paymentLoading || !amount}
                className="w-full bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-3.5 rounded-xl font-bold text-sm hover:from-blue-800 hover:to-indigo-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
                {paymentLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><ExternalLink className="w-4 h-4" /> Pay ₹{parseInt(amount) ? parseInt(amount).toLocaleString() : '0'} Now</>}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                <Shield className="w-3 h-3 inline mr-1" />Secured by Razorpay. Your payment information is encrypted.
              </p>
            </div>
          </div>

          {/* Two Column Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

            {/* Bank Transfer */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100 p-5 sm:p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-blue-900/10 p-2.5 rounded-xl inline-flex">
                    <Building2 className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-900">Bank Transfer</h2>
                    <p className="text-amber-700 text-xs font-bold tracking-wider">NEFT / RTGS / IMPS</p>
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <DetailRow icon={Building2} label="Bank" value={bankDetails.bankName} highlight />
                <DetailRow icon={CreditCard} label="Account Holder" value={bankDetails.accountName} highlight />
                <DetailRow label="Account Type" value={bankDetails.accountType} />
                <DetailRow label="Account Number" value={bankDetails.accountNumber} field="accountNumber" highlight />
                <DetailRow label="IFSC Code" value={bankDetails.ifscCode} field="ifscCode" highlight />
                <DetailRow label="MICR Code" value={bankDetails.micrCode} field="micrCode" />
                <DetailRow label="SWIFT Code" value={bankDetails.swiftCode} field="swiftCode" />
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-900 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-blue-900 mb-0.5">Branch</p>
                    <p className="text-xs text-gray-700 leading-relaxed break-words">
                      {showFullBranch ? bankDetails.branch : branchShort}
                    </p>
                    {bankDetails.branch.length > 60 && (
                      <button
                        type="button"
                        onClick={() => setShowFullBranch(!showFullBranch)}
                        className="mt-1 text-xs text-blue-900 font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        {showFullBranch ? 'Show less' : 'Show full address'} {showFullBranch ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* UPI Payment */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100 p-5 sm:p-6 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="bg-blue-900/10 p-2.5 rounded-xl inline-flex">
                    <Smartphone className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-900">UPI Payment</h2>
                    <p className="text-amber-700 text-xs font-bold tracking-wider">Scan & Pay Instantly</p>
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="bg-gradient-to-br from-blue-50 to-yellow-50 rounded-2xl p-4 sm:p-6 text-center mb-4">
                  <div className="inline-block bg-white rounded-xl p-3 sm:p-4 shadow-md border-2 border-yellow-400">
                    <div className="w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 bg-white flex items-center justify-center rounded-lg relative overflow-hidden mx-auto">
                      {!qrError ? (
                        <img src={qrCodeImg} alt="UPI QR Code"
                          className="w-full h-full object-contain"
                          onError={() => setQrError(true)} />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-blue-50 text-blue-900 p-3">
                          <QrCode className="w-10 h-10 sm:w-12 sm:h-12" />
                          <p className="text-xs font-semibold text-center">QR Code</p>
                          <p className="text-[10px] text-blue-700 text-center leading-relaxed">UPI ID:<br />astarclasses@upi</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 font-semibold text-sm mt-4 mb-2">
                    Scan with any UPI app
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                    <Shield className="w-3 h-3 text-blue-900" />
                    <span>100% Secure &bull; Instant Confirmation</span>
                  </div>
                </div>

                {/* Contact row — improved mobile layout */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs text-gray-600">
                  <a href="tel:+918861919000" className="flex items-center gap-1.5 hover:text-blue-900 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                    <span>+91-886 191 9000</span>
                  </a>
                  <span className="hidden sm:inline text-gray-300">|</span>
                  <a href="https://wa.me/918073982848" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-green-700 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span>+91-807 398 2848</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* After Payment Note */}
          <div className="mt-8 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 px-4 py-3 sm:py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span className="text-center sm:text-left">
                After payment, send the transaction details to
                <a href="mailto:astarclasses@ixpoe.com" className="font-bold underline hover:text-blue-900 ml-0.5">astarclasses@ixpoe.com</a>
                <span className="hidden sm:inline"> or </span>
                <span className="block sm:hidden"> or WhatsApp </span>
                <a href="https://wa.me/918073982848" target="_blank" rel="noreferrer" className="font-bold underline text-green-700 hover:text-green-800 ml-0.5">+91-807 398 2848</a>
              </span>
            </div>
          </div>

          {/* Animated Footer */}
          <div data-aos className="opacity-0 translate-y-4 transition-all duration-500 mt-8 sm:mt-10">
            <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-5 sm:p-6">
              <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-6 items-start">
                <div className="flex items-start gap-3 w-full md:w-auto">
                  <div className="bg-blue-50 rounded-lg p-2.5 shrink-0">
                    <Building2 className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900">A Star Classes</h3>
                    <p className="text-xs text-gray-600 mt-0.5">DronaVyas IXPOE Private Limited</p>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed max-w-xs">
                      No. 81, Ground Floor, Share Space 88, Borewell Road, Whitefield, Bangalore - 560066
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 w-full md:w-auto md:ml-auto">
                  <a href="tel:+918861919000" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Phone className="w-4 h-4 text-blue-900 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">Phone</p>
                      <p className="text-sm font-semibold text-gray-900">+91-886 191 9000</p>
                    </div>
                  </a>
                  <a href="https://wa.me/918073982848" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <MessageCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">WhatsApp</p>
                      <p className="text-sm font-semibold text-gray-900">+91-807 398 2848</p>
                    </div>
                  </a>
                  <a href="mailto:astarclasses@ixpoe.com" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Mail className="w-4 h-4 text-blue-900 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-500">Email</p>
                      <p className="text-sm font-semibold text-gray-900">astarclasses@ixpoe.com</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
