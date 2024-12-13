'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Select } from "@/components/ui"

export default function SignUpDetails() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    maritalStatus: '',
    occupation: '',
    germanLanguageLevel: '',
    residencePermit: '',
    healthInsuranceStatus: '',
    taxIdNumber: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulating API call
      console.log("Detailed information submitted", formData)
      router.push('/chat')
    } catch (error) {
      console.error("Error submitting form:", error)
      setErrors({ submit: 'An error occurred while submitting the form. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5dc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-[#1e2837]">
          Complete Your Profile
        </h2>
      </div>

      <Card className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-[#e6e6c8] border-[#1e2837]">
        <CardHeader>
          <CardTitle className="text-[#1e2837]">Sign Up Details</CardTitle>
          <CardDescription className="text-[#1e2837]">Please fill in your information to complete the sign-up process.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-[#1e2837]">
                First Name
              </label>
              <Input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="bg-[#f5f5dc] text-[#1e2837] border-[#1e2837]"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-[#1e2837]">
                Last Name
              </label>
              <Input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="bg-[#f5f5dc] text-[#1e2837] border-[#1e2837]"
              />
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-[#1e2837]">
                Date of Birth
              </label>
              <Input
                type="date"
                name="dateOfBirth"
                id="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="bg-[#f5f5dc] text-[#1e2837] border-[#1e2837]"
              />
            </div>

            <div>
              <label htmlFor="nationality" className="block text-sm font-medium text-[#1e2837]">
                Nationality
              </label>
              <Input
                type="text"
                name="nationality"
                id="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="bg-[#f5f5dc] text-[#1e2837] border-[#1e2837]"
              />
            </div>

            <div>
              <label htmlFor="maritalStatus" className="block text-sm font-medium text-[#1e2837]">
                Marital Status
              </label>
              <Select
                name="maritalStatus"
                id="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                className="bg-[#f5f5dc] text-[#1e2837] border-[#1e2837]"
              >
                <option value="">Select...</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </Select>
            </div>

            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-[#1e2837]">
                Occupation
              </label>
              <Input
                type="text"
                name="occupation"
                id="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="bg-[#f5f5dc] text-[#1e2837] border-[#1e2837]"
              />
            </div>

            <div>
              <label htmlFor="germanLanguageLevel" className="block text-sm font-medium text-[#1e2837]">
                German Language Level
              </label>
              <Select
                name="germanLanguageLevel"
                id="germanLanguageLevel"
                value={formData.germanLanguageLevel}
                onChange={handleChange}
                className="bg-[#f5f5dc] text-[#1e2837] border-[#1e2837]"
              >
                <option value="">Select...</option>
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Proficient</option>
              </Select>
            </div>

            <div>
              <label htmlFor="residencePermit" className="block text-sm font-medium text-[#1e2837]">
                Residence Permit
              </label>
              <Select
                name="residencePermit"
                id="residencePermit"
                value={formData.residencePermit}
                onChange={handleChange}
                className="bg-[#f5f5dc] text-[#1e2837] border-[#1e2837]"
              >
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </div>

            <div>
              <label htmlFor="healthInsuranceStatus" className="block text-sm font-medium text-[#1e2837]">
                Health Insurance Status
              </label>
              <Select
                name="healthInsuranceStatus"
                id="healthInsuranceStatus"
                value={formData.healthInsuranceStatus}
                onChange={handleChange}
                className="bg-[#f5f5dc] text-[#1e2837] border-[#1e2837]"
              >
                <option value="">Select...</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="none">None</option>
              </Select>
            </div>

            <div>
              <label htmlFor="taxIdNumber" className="block text-sm font-medium text-[#1e2837]">
                Tax Identification Number (if available)
              </label>
              <Input
                type="text"
                name="taxIdNumber"
                id="taxIdNumber"
                value={formData.taxIdNumber}
                onChange={handleChange}
                className="bg-[#f5f5dc] text-[#1e2837] border-[#1e2837]"
              />
            </div>

            {errors.submit && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {errors.submit}</span>
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full bg-[#1e2837] text-[#f5f5dc] hover:bg-[#2a3749]"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Complete Sign Up'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

