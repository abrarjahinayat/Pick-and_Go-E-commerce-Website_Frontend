"use client"
import React, { useState } from 'react'
import Container from '@/components/common/Container'
import Link from 'next/link'
import axios from 'axios'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'

const Page = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [notification, setNotification] = useState({ show: false, type: '', message: '' })
  const router = useRouter()

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message })
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' })
    }, 5000)
  }

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email.trim()) {
      setError('Email is required')
      showNotification('error', 'Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      showNotification('error', 'Invalid email format')
      return
    }

    setLoading(true)

    try {
      // Send OTP request to backend
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/auth/forgetpassword`,
        { email }
      ).then((response) => {
          console.log('OTP sent:', response.data)
          
          setSuccess(true)
          showNotification(
            'success',
            'OTP has been sent to your email! Please check your inbox.'
          )

          // Redirect to OTP verification page after 1 second
          setTimeout(() => {
            router.push(`/verifypasswordotp?email=${email}`)
          }, 1000)
   
      });

    } catch (err) {
      console.error('Forgot password error:', err)
      const errorMessage = err.response?.data?.message || 'Failed to send OTP. Please try again.'
      setError(errorMessage)
      showNotification('error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError('')
    setLoading(true)

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/auth/forgot-password`,
        { email }
      )

      showNotification('success', 'OTP has been resent to your email!')
    } catch (err) {
      console.error('Resend OTP error:', err)
      showNotification('error', 'Failed to resend OTP. Please try again.')
    } finally {
      setLoading(false)
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

            {!success ? (
              <>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Forgot Password?
                </h2>
                <p className="text-gray-600">
                  No worries! Enter your email and we'll send you an OTP to reset your password.
                </p>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Check Your Email
                </h2>
                <p className="text-gray-600">
                  We've sent an OTP to <span className="font-semibold text-gray-900">{email}</span>
                </p>
              </>
            )}
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {!success ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      className={`block w-full pl-10 pr-3 py-3 border ${
                        error ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                      placeholder="you@example.com"
                      disabled={loading}
                    />
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP'
                  )}
                </button>

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 text-center">
                    <strong>OTP sent successfully!</strong> Please check your email inbox and spam folder.
                  </p>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>Check your email for the OTP code</li>
                    <li>Enter the OTP on the reset password page</li>
                    <li>Create your new password</li>
                  </ol>
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Didn't receive the email?
                  </p>
                  <button
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Resending...' : 'Resend OTP'}
                  </button>
                </div>

                {/* Navigate to Reset Page */}
                <Link
                  href={`/reset-password?email=${encodeURIComponent(email)}`}
                  className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 text-center"
                >
                  Go to Reset Password
                </Link>

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-700 font-medium transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </Link>
                </div>
              </div>
            )}
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