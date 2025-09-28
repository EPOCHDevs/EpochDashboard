import { useState, useRef } from 'react'
import { Upload, FileJson, X, AlertCircle, CheckCircle, Bug } from 'lucide-react'
import { TearsheetDashboard, TearSheet, TearSheetClass } from '@epochlab/epoch-dashboard'

export default function TestTearsheetPage() {
  const [tearsheet, setTearsheet] = useState<TearSheet | null>(null)
  const [error, setError] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string>('')
  const [debugMode, setDebugMode] = useState<boolean>(false)
  const [refreshKey, setRefreshKey] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processTearsheetData = (data: TearSheet, name: string) => {
    try {
      // Add timestamp to ensure fresh data processing
      const timestamp = new Date().toISOString()
      console.log(`🔄 Processing new tearsheet: ${name} at ${timestamp}`)

      setTearsheet(data)
      setFileName(`${name} (${timestamp.split('T')[1].split('.')[0]})`)
      setRefreshKey(timestamp) // Force component refresh
      setError('')
    } catch (err) {
      setError(`Failed to process tearsheet: ${err}`)
    }
  }

  const handleFileUpload = async (file: File) => {
    // Clear any existing state first to prevent caching issues
    setTearsheet(null)
    setFileName('')
    setError('')

    if (!file) {
      setError('No file selected')
      return
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    try {
      if (fileExtension === 'pb' || fileExtension === 'proto' || fileExtension === 'bin') {
        // Handle ONLY protobuf binary file - NO JSON!
        const buffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(buffer)
        const data = TearSheetClass.decode(uint8Array)
        processTearsheetData(data as TearSheet, file.name)
      } else {
        setError('Unsupported file format. Please upload a .pb/.proto/.bin file (Proto only, no JSON)')
      }
    } catch (err) {
      console.error('Error processing file:', err)
      setError(`Failed to load proto file: ${err}`)
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
      // Force re-upload even if same filename by clearing input first
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 100)
      handleFileUpload(file)
    }
  }

  const clearTearsheet = () => {
    setTearsheet(null)
    setFileName('')
    setRefreshKey('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const toggleDebugMode = () => {
    setDebugMode(!debugMode)
    if (!debugMode) {
      console.log('🔍 Debug mode enabled - Check console for detailed component data loading information')
    } else {
      console.log('🔍 Debug mode disabled')
    }
  }

  const loadExampleData = async () => {
    try {
      const response = await fetch('/api/tearsheet/example')
      if (!response.ok) {
        throw new Error(`Failed to fetch example: ${response.status}`)
      }

      // Always expect protobuf binary - NO JSON!
      const buffer = await response.arrayBuffer()
      const uint8Array = new Uint8Array(buffer)
      const data = TearSheetClass.decode(uint8Array) as TearSheet

      processTearsheetData(data, 'example-tearsheet.pb')
    } catch (err) {
      setError(`Failed to load example data: ${err}`)
    }
  }

  return (
    <div className="min-h-screen bg-primary-bluishDarkGray">
      {!tearsheet ? (
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-primary-white mb-4">
                Test Tearsheet Dashboard
              </h1>
              <p className="text-secondary-ashGrey text-lg">
                Upload a tearsheet file to test the dashboard visualization
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
                ref={fileInputRef}
                type="file"
                accept=".pb,.proto,.bin"
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
                  Proto only: .pb, .proto, .bin
                </p>
              </label>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-territory-alert/10 border border-territory-alert/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-territory-alert flex-shrink-0 mt-0.5" />
                <p className="text-territory-alert">{error}</p>
              </div>
            )}

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-secondary-mildCementGrey" />
              <span className="text-secondary-ashGrey">OR</span>
              <div className="flex-1 h-px bg-secondary-mildCementGrey" />
            </div>

            <button
              onClick={loadExampleData}
              className="mt-8 w-full py-3 px-6 bg-territory-blue/20 border border-territory-blue/30 text-territory-blue rounded-lg hover:bg-territory-blue/30 transition-all duration-200 font-medium"
            >
              Load Example Tearsheet
            </button>
          </div>
        </div>
      ) : (
        <div className="p-8">
          <div className="max-w-[1920px] mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileJson className="w-6 h-6 text-territory-blue" />
                <div>
                  <h1 className="text-2xl font-bold text-primary-white">
                    Tearsheet Viewer
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-territory-success" />
                    <p className="text-secondary-ashGrey text-sm">
                      {fileName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleDebugMode}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-200 ${
                    debugMode
                      ? 'bg-territory-cyan/20 border-territory-cyan/30 text-territory-cyan'
                      : 'bg-secondary-darkGray border-secondary-mildCementGrey text-secondary-ashGrey hover:bg-secondary-mildCementGrey/30 hover:text-primary-white'
                  }`}
                >
                  <Bug className="w-4 h-4" />
                  <span>Debug</span>
                </button>

                <button
                  onClick={clearTearsheet}
                  className="flex items-center gap-2 px-4 py-2 bg-secondary-darkGray border border-secondary-mildCementGrey text-secondary-ashGrey rounded-lg hover:bg-secondary-mildCementGrey/30 hover:text-primary-white transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <div className="h-[calc(100vh-160px)]">
              <TearsheetDashboard
                key={refreshKey} // Force component refresh on new uploads
                tearsheet={tearsheet}
                className="h-full"
                debug={debugMode}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}