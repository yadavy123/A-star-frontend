import { useEffect, useState } from 'react'
import { Building2, CheckCircle, Copy, CreditCard, Mail, MapPin, MessageCircle, Phone, QrCode, Shield, Smartphone } from 'lucide-react'

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

export default function FeePayment() {
  const [copiedField, setCopiedField] = useState('')
  const [qrAvailable, setQrAvailable] = useState(true)

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
      className="p-1.5 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors group touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
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
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className="flex items-center mt-0.5">
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

  return (
    <div className="w-full bg-white">
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-yellow-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-900 text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
              <Shield className="w-3.5 h-3.5" />
              Secure Payment
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900">Pay Fees Online</h1>
            <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
              Use bank transfer or scan the UPI QR code to pay your fees. All transactions are 100% secure.
            </p>
          </div>

          {/* Two Column Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

            {/* Bank Transfer */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100 p-6 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-blue-900/10 p-2.5 rounded-xl inline-flex">
                    <Building2 className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-900">Bank Transfer</h2>
                    <p className="text-amber-700 text-xs font-bold tracking-wider">NEFT / RTGS / IMPS</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <DetailRow icon={Building2} label="Bank" value={bankDetails.bankName} highlight />
                <DetailRow icon={CreditCard} label="Account Holder" value={bankDetails.accountName} highlight />
                <DetailRow label="Account Type" value={bankDetails.accountType} />
                <DetailRow label="Account Number" value={bankDetails.accountNumber} field="accountNumber" highlight />
                <DetailRow label="IFSC Code" value={bankDetails.ifscCode} field="ifscCode" highlight />
                <DetailRow label="MICR Code" value={bankDetails.micrCode} field="micrCode" />
                <DetailRow label="SWIFT Code" value={bankDetails.swiftCode} field="swiftCode" />
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-900 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-0.5">Branch</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{bankDetails.branch}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* UPI Payment */}
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100 p-6 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-blue-900/10 p-2.5 rounded-xl inline-flex">
                    <Smartphone className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-blue-900">UPI Payment</h2>
                    <p className="text-amber-700 text-xs font-bold tracking-wider">Scan & Pay Instantly</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-linear-to-br from-blue-50 to-yellow-50 rounded-2xl p-6 text-center mb-4">
                  <div className="inline-block bg-white rounded-xl p-4 shadow-md border-2 border-yellow-400">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 bg-white flex items-center justify-center rounded-lg relative overflow-hidden">
                      {qrAvailable ? (
                        <img src="/qr.jpeg" alt="UPI QR Code" className="w-full h-full object-contain" onError={() => setQrAvailable(false)} />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-blue-50 text-blue-900 px-4">
                          <QrCode className="w-12 h-12" />
                          <p className="text-xs font-semibold">QR not available</p>
                          <p className="text-[10px] text-blue-700">Place qr.jpeg in the public folder</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 font-semibold text-sm mt-4 mb-2">
                    Scan with any UPI app
                  </p>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                    <Shield className="w-3 h-3 text-blue-900" />
                    <span>100% Secure • Instant Confirmation</span>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-blue-900" />+91-886 191 9000</span>
                  <span className="flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5 text-green-600" />+91-807 398 2848</span>
                </div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
              <Shield className="w-3.5 h-3.5" />
              After payment, please send the transaction details to
              <a href="mailto:astarclasses@ixpoe.com" className="font-bold underline hover:text-blue-900">astarclasses@ixpoe.com</a>
              or WhatsApp
              <a href="https://wa.me/918073982848" target="_blank" rel="noreferrer" className="font-bold underline text-green-700 hover:text-green-800">+91-807 398 2848</a>
            </div>
          </div>

          {/* Animated Footer */}
          <div data-aos className="opacity-0 translate-y-4 transition-all duration-500 mt-10">
            <div className="rounded-xl border border-blue-100 bg-white shadow-sm p-6">
              <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-50 rounded-lg p-2.5 shrink-0">
                    <Building2 className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-900">A Star Classes</h3>
                    <p className="text-xs text-gray-600 mt-0.5">DronaVyas IXPOE Private Limited</p>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      No. 81, Ground Floor, Share Space 88, Borewell Road, Whitefield, Bangalore - 560066
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
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
