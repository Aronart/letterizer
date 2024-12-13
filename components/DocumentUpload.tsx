import { useState } from 'react'
import { Button } from "@/components/ui"

export function DocumentUpload() {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload
      console.log(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      // Handle file upload
      console.log(e.target.files[0])
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <span className="mx-auto text-4xl">📤</span>
      <p className="mt-2 text-sm text-gray-600">Drag and drop your files here, or</p>
      <label htmlFor="file-upload" className="mt-2 cursor-pointer">
        <Button
          className="relative bg-white text-blue-500 border border-blue-500 hover:bg-blue-50 px-2 py-1 text-sm"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          Select files
        </Button>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          onChange={handleChange}
        />
      </label>
    </div>
  )
}

