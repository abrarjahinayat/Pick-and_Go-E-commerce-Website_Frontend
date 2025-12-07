"use client"
import React, { useState, useRef, useEffect } from 'react'
import Container from '@/components/common/Container'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Shield, ArrowLeft, CheckCircle, AlertCircle, Loader, Mail } from 'lucide-react'

const Page = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [notification, setNotification] = useState({ show: false, type: '', message: '' })

  const inputRefs = useRef([])

  
  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message })
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' })
    }, 5000)
  }

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    
    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('')
      setOtp(newOtp)
      inputRefs.current[5].focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const otpCode = otp.join('')

    
    
    // Validation
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits')
      showNotification('error', 'Please enter complete OTP')
      return
    }

    setLoading(true)
    setError('')

    console.log(otpCode)

    try {
      // Verify OTP with backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/auth/verifypasswordotp`,
        { 
          email,
          otp: otpCode 
        }
    )
    


      console.log('OTP verified:', response.data)
      
      showNotification('success', 'OTP verified successfully!')
      
      // Redirect to reset password page after 1 second
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}&verified=true`)
      }, 1000)
    } catch (err) {
      console.error('Verify OTP error:', err)
      const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again.'
      setError(errorMessage)
      showNotification('error', errorMessage)
      
      // Clear OTP on error
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0].focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    setResendLoading(true)
    setError('')

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/auth/forgot-password`,
        { email }
      )

      showNotification('success', 'OTP has been resent to your email!')
      setResendTimer(60)
      setCanResend(false)
    } catch (err) {
      console.error('Resend OTP error:', err)
      showNotification('error', 'Failed to resend OTP. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Container>
        {/* Notification Toast */}
        {notification.show && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div
              className={`flex items-center gap-3 p-4 rounded-lg shadow-lg max-w-md ${
                notification.type === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        )}

        <div className="max-w-md w-full mx-auto">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-2xl px-3 py-1 rounded-lg">
                P&G
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Pick & Go
              </span>
            </Link>

            <div className="mb-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-blue-600" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Verify OTP
            </h2>
            <p className="text-gray-600 mb-2">
              We've sent a 6-digit code to
            </p>
            <div className="flex items-center justify-center gap-2 text-gray-900">
              <Mail className="w-4 h-4" />
              <span className="font-semibold">{email}</span>
            </div>
          </div>

          {/* OTP Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* OTP Input Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Enter OTP Code
                </label>
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-2xl font-bold border-2 ${
                        error 
                          ? 'border-red-500' 
                          : digit 
                          ? 'border-blue-600 bg-blue-50' 
                          : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      disabled={loading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                {error && (
                  <p className="mt-3 text-sm text-red-600 flex items-center justify-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendLoading}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendLoading ? 'Resending...' : 'Resend OTP'}
                  </button>
                ) : (
                  <p className="text-sm text-gray-500">
                    Resend in <span className="font-semibold text-blue-600">{resendTimer}s</span>
                  </p>
                )}
              </div>

              {/* Back Button */}
              <div className="text-center pt-4 border-t border-gray-200">
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-700 font-medium transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Change Email
                </Link>
              </div>
            </form>
          </div>

          {/* Tips */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">💡 Tips:</h3>
            <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
              <li>Check your spam folder if you don't see the email</li>
              <li>OTP is valid for 10 minutes</li>
              <li>You can paste the 6-digit code directly</li>
            </ul>
          </div>

          {/* Additional Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <Link href="/support" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </Container>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Page