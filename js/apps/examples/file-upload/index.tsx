import React, { useState } from 'react'
import { TearsheetDashboard, readTearsheetFile, type TearSheet } from '@epochlab/epoch-dashboard'
import { Upload, AlertCircle } from 'lucide-react'
import '@epochlab/epoch-dashboard/styles'

export default function FileUploadExample() {
  const [tearsheet, setTearsheet] = useState<TearSheet | null>(null)
  const [error, setError] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string>('')

  const handleFileUpload = async (file: File) => {
    setError('')

    if (!file) {
      setError('No file selected')
      return
    }

    try {
      const data = await readTearsheetFile(file)
      setTearsheet(data)
      setFileName(file.name)
    } catch (err) {
      console.error('Error processing file:', err)
      setError(`Failed to load file: ${err}`)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  if (!tearsheet) {
    return (
      <div className="min-h-screen bg-primary-bluishDarkGray flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-white mb-4">
              File Upload Example
            </h1>
            <p className="text-secondary-ashGrey text-lg">
              Upload a tearsheet file to see the dashboard
            </p>
          </div>

          <div
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-all
              ${isDragging
                ? 'border-territory-blue bg-territory-blue/10'
                : 'border-secondary-mildCementGrey bg-secondary-darkGray hover:border-territory-blue/50'
              }
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              accept=".pb,.proto,.bin,.json"
              onChange={handleFileInputChange}
              className="hidden"
              id="file-upload"
            />

            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-16 h-16 mx-auto mb-4 text-territory-blue" />
              <p className="text-xl font-medium text-primary-white mb-2">
                Drop your tearsheet file here
              </p>
              <p className="text-secondary-ashGrey mb-4">
                or click to browse
              </p>
              <p className="text-sm text-secondary-mildAshGrey">
                Supports: .pb, .proto, .bin, .json
              </p>
            </label>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-territory-alert/10 border border-territory-alert/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-territory-alert flex-shrink-0 mt-0.5" />
              <p className="text-territory-alert">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-bluishDarkGray">
      <div className="p-8">
        <div className="max-w-[1920px] mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-white">
                File Upload Dashboard
              </h1>
              <p className="text-secondary-ashGrey text-sm mt-1">
                Loaded: {fileName}
              </p>
            </div>

            <button
              onClick={() => {
                setTearsheet(null)
                setFileName('')
                setError('')
              }}
              className="px-4 py-2 bg-secondary-darkGray border border-secondary-mildCementGrey text-secondary-ashGrey rounded-lg hover:bg-secondary-mildCementGrey/30 hover:text-primary-white transition-all duration-200"
            >
              Upload New File
            </button>
          </div>

          <div className="h-[calc(100vh-160px)]">
            <TearsheetDashboard
              tearsheet={tearsheet}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}