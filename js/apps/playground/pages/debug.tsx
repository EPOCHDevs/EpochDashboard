import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    const loadProtos = async () => {
      try {
        // Import all proto modules
        const commonModule = await import('@epochlab/epoch-protos/common')
        const tableModule = await import('@epochlab/epoch-protos/table_def')
        const chartModule = await import('@epochlab/epoch-protos/chart_def')
        const tearsheetModule = await import('@epochlab/epoch-protos/tearsheet')

        // Check default exports
        const commonDefault = commonModule.default
        const tableDefault = tableModule.default

        setDebugInfo({
          common: {
            keys: Object.keys(commonModule),
            hasEpochProto: !!commonModule.epoch_proto,
            defaultKeys: commonDefault ? Object.keys(commonDefault) : [],
            defaultHasEpochProto: !!(commonDefault?.epoch_proto),
            defaultEpochProtoKeys: commonDefault?.epoch_proto ? Object.keys(commonDefault.epoch_proto) : [],
          },
          table: {
            keys: Object.keys(tableModule),
            hasEpochProto: !!tableModule.epoch_proto,
            defaultKeys: tableDefault ? Object.keys(tableDefault) : [],
            defaultHasEpochProto: !!(tableDefault?.epoch_proto),
            defaultEpochProtoKeys: tableDefault?.epoch_proto ? Object.keys(tableDefault.epoch_proto) : [],
          },
          chart: {
            keys: Object.keys(chartModule),
            hasEpochProto: !!chartModule.epoch_proto,
          },
          tearsheet: {
            keys: Object.keys(tearsheetModule),
            hasEpochProto: !!tearsheetModule.epoch_proto,
          }
        })
      } catch (error) {
        setDebugInfo({ error: (error as Error).message })
      }
    }

    loadProtos()
  }, [])

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Proto Package Debug</h1>
      <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  )
}