'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpDetails() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    immigrationDate: '',
    birthday: '',
    maritalStatus: '',
    occupation: '',
    germanLanguageLevel: '',
    residencePermitType: '',
    healthInsuranceStatus: '',
    taxIdNumber: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // Here you would typically send this data to your backend
    console.log("Detailed information submitted", formData)

    // Redirect to the paid user chat interface
    router.push('/chat')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Profile
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="immigrationDate" className="block text-sm font-medium text-gray-700">
                Date of Immigration to Germany
              </label>
              <input
                type="date"
                name="immigrationDate"
                id="immigrationDate"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.immigrationDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="birthday" className="block text-sm font-medium text-gray-700">
                Birthday
              </label>
              <input
                type="date"
                name="birthday"
                id="birthday"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.birthday}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">
                Marital Status
              </label>
              <select
                name="maritalStatus"
                id="maritalStatus"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.maritalStatus}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>

            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700">
                Occupation
              </label>
              <input
                type="text"
                name="occupation"
                id="occupation"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.occupation}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="germanLanguageLevel" className="block text-sm font-medium text-gray-700">
                German Language Level
              </label>
              <select
                name="germanLanguageLevel"
                id="germanLanguageLevel"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.germanLanguageLevel}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Proficient</option>
              </select>
            </div>

            <div>
              <label htmlFor="residencePermitType" className="block text-sm font-medium text-gray-700">
                Residence Permit Type
              </label>
              <input
                type="text"
                name="residencePermitType"
                id="residencePermitType"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.residencePermitType}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="healthInsuranceStatus" className="block text-sm font-medium text-gray-700">
                Health Insurance Status
              </label>
              <select
                name="healthInsuranceStatus"
                id="healthInsuranceStatus"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.healthInsuranceStatus}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="none">None</option>
              </select>
            </div>

            <div>
              <label htmlFor="taxIdNumber" className="block text-sm font-medium text-gray-700">
                Tax Identification Number (if available)
              </label>
              <input
                type="text"
                name="taxIdNumber"
                id="taxIdNumber"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.taxIdNumber}
                onChange={handleChange}
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Complete Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

