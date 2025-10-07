import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function AnalyticsFormPage() {
  const router = useRouter()
  const [campaignId, setCampaignId] = useState('')
  const [userId, setUserId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!campaignId.trim()) {
      alert('Please enter a Campaign ID')
      return
    }

    if (!userId.trim()) {
      alert('Please enter a User ID')
      return
    }

    setIsSubmitting(true)

    // Navigate to unified-dashboard page with parameters
    router.push({
      pathname: '/unified-dashboard',
      query: {
        campaignId: campaignId.trim(),
        userId: userId.trim()
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-primary p-4">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary-white mb-2">
            Campaign Dashboard Configuration
          </h1>
          <p className="text-secondary-ashGrey">
            Enter Campaign ID to view performance overview and trade analytics
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-secondary-darkGray border border-secondary-mildCementGrey rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campaign ID Input */}
            <div>
              <label htmlFor="campaignId" className="block text-sm font-medium text-secondary-ashGrey mb-2">
                Campaign ID
              </label>
              <input
                type="text"
                id="campaignId"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                placeholder="Enter campaign ID (e.g., campaign-001)"
                className="w-full rounded-md border border-secondary-mildCementGrey bg-secondary-darkGray text-primary-white px-4 py-3 focus:border-territory-blue focus:ring-1 focus:ring-territory-blue transition-all placeholder:text-secondary-ashGrey"
                required
              />
              <p className="mt-1 text-xs text-secondary-ashGrey">
                The unique identifier for the trading campaign to analyze
              </p>
            </div>

            {/* User ID Input */}
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-secondary-ashGrey mb-2">
                User ID
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="716b2510-e0a1-7047-9392-6d5591415ea7"
                className="w-full rounded-md border border-secondary-mildCementGrey bg-secondary-darkGray text-primary-white px-4 py-3 focus:border-territory-blue focus:ring-1 focus:ring-territory-blue transition-all placeholder:text-secondary-ashGrey"
                required
              />
              <p className="mt-1 text-xs text-secondary-ashGrey">
                User ID for authentication (required UUID format)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting
                    ? 'bg-secondary-mildCementGrey text-secondary-ashGrey cursor-not-allowed'
                    : 'bg-territory-blue text-primary-white hover:bg-territory-blue/80'
                }`}
              >
                {isSubmitting ? 'Loading...' : 'View Dashboard'}
              </button>

              <Link href="/" className="flex-1">
                <button
                  type="button"
                  className="w-full py-3 px-6 rounded-lg font-medium bg-secondary-charcoal border border-secondary-mildCementGrey text-secondary-ashGrey hover:bg-secondary-mildCementGrey/30 transition-all duration-200"
                >
                  Cancel
                </button>
              </Link>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-territory-blue/10 border border-territory-blue/30 rounded-lg">
            <h3 className="text-sm font-bold text-territory-blue mb-2">Quick Tips:</h3>
            <ul className="space-y-1 text-xs text-secondary-ashGrey">
              <li>• Ensure your backend API server is running on http://localhost:9000</li>
              <li>• Backend URL is configured in .env.local file</li>
              <li>• The Campaign ID should match an existing campaign in your system</li>
              <li>• The dashboard includes Performance Overview AND Trade Analytics views</li>
              <li>• Switch between views using the tab controls at the top</li>
            </ul>
          </div>
        </div>

        {/* Recent Campaigns (Optional - for convenience) */}
        <div className="mt-8 bg-secondary-darkGray border border-secondary-mildCementGrey rounded-lg p-6">
          <h3 className="text-sm font-bold text-secondary-ashGrey mb-3">Example Campaign IDs:</h3>
          <div className="flex flex-wrap gap-2">
            {['campaign-001', 'backtest-2024-01', 'live-trading-btc', 'test-campaign-123'].map((exampleId) => (
              <button
                key={exampleId}
                type="button"
                onClick={() => setCampaignId(exampleId)}
                className="px-3 py-1 text-xs bg-secondary-charcoal border border-secondary-mildCementGrey rounded-md text-secondary-ashGrey hover:bg-secondary-mildCementGrey/30 hover:text-primary-white transition-all"
              >
                {exampleId}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}