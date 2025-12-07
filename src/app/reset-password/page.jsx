"use client"
import React, { useState } from 'react'
import Container from '@/components/common/Container'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader, KeyRound } from 'lucide-react'

const Page = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const verified = searchParams.get('verified') === 'true'

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [notification, setNotification] = useState({ show: false, type: '', message: '' })

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message })
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' })
    }, 5000)
  }

  const checkPasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    return strength
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    if (name === 'newPassword') {
      setPasswordStrength(checkPasswordStrength(value))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      showNotification('error', 'Please fix the errors in the form')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/auth/resetpassword`,
        {
          email,
          password: formData.newPassword
        }
      )

      console.log('Password reset successful:', response.data)
      
      showNotification('success', 'Password reset successfully!')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      console.error('Reset password error:', err)
      const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.'
      setErrors({ submit: errorMessage })
      showNotification('error', errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak'
    if (passwordStrength <= 3) return 'Medium'
    return 'Strong'
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
                <KeyRound className="w-10 h-10 text-blue-600" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Reset Password
            </h2>
            <p className="text-gray-600">
              Create a new secure password for your account
            </p>
            {email && (
              <p className="text-sm text-gray-500 mt-2">
                for <span className="font-semibold text-gray-700">{email}</span>
              </p>
            )}
          </div>

          {/* Verification Warning */}
          {!verified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  Please verify your OTP before resetting password
                </p>
              </div>
              <Link
                href={`/verify-otp?email=${encodeURIComponent(email)}`}
                className="text-sm text-yellow-700 underline mt-2 inline-block"
              >
                Go to OTP Verification
              </Link>
            </div>
          )}

          {/* Reset Password Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-12 py-3 border ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.newPassword}
                  </p>
                )}

                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Password Strength:</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength <= 1 ? 'text-red-600' : 
                        passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {getStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-12 py-3 border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                    placeholder="Re-enter new password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Password Requirements:</h4>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={formData.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}>
                      {formData.newPassword.length >= 6 ? '✓' : '○'}
                    </span>
                    At least 6 characters (letters, numbers, or mix)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={formData.newPassword === formData.confirmPassword && formData.confirmPassword.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                      {formData.newPassword === formData.confirmPassword && formData.confirmPassword.length > 0 ? '✓' : '○'}
                    </span>
                    Passwords match
                  </li>
                </ul>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !verified}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Remember your password?{' '}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Back to Login
                  </Link>
                </p>
              </div>
            </form>
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