'use client'

import React from 'react'

const XRangeTest: React.FC = () => {
  console.log('XRangeTest component rendered')

  return (
    <div className="p-4 text-primary-white">
      <h2 className="text-xl mb-4">XRange Test Component</h2>
      <p>If you see this, the component is loading correctly.</p>
      <p className="text-sm text-secondary-ashGrey mt-2">Check console for logs.</p>
    </div>
  )
}

export default XRangeTest