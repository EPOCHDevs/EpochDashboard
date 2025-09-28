const express = require('express')
const cors = require('cors')
const { createMockTearsheet, createMinimalTearsheet } = require('@epochlab/epoch-dashboard')

const app = express()
const PORT = 3001

// Enable CORS
app.use(cors())
app.use(express.json())

// API Endpoints
app.get('/api/tearsheet/:id', (req, res) => {
  const { id } = req.params
  const acceptHeader = req.headers['accept'] || ''

  console.log(`Fetching tearsheet for strategy: ${id}`)

  try {
    // Use different mock data based on strategy ID
    let tearsheet
    if (id === 'minimal') {
      tearsheet = createMinimalTearsheet()
    } else {
      tearsheet = createMockTearsheet(id)
    }

    // Return JSON (protobuf encoding would require additional setup)
    res.json(tearsheet)
  } catch (error) {
    console.error('Error creating tearsheet:', error)
    res.status(500).json({ error: 'Failed to generate tearsheet' })
  }
})

// Example tearsheet endpoint (for test-tearsheet page)
app.get('/api/tearsheet/example', (req, res) => {
  console.log('Fetching example tearsheet')

  try {
    const tearsheet = createMockTearsheet('example')
    res.json(tearsheet)
  } catch (error) {
    console.error('Error creating example tearsheet:', error)
    res.status(500).json({ error: 'Failed to generate example tearsheet' })
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`Test API server running at http://localhost:${PORT}`)
  console.log(`Available endpoints:`)
  console.log(`  - GET /api/tearsheet/:id (returns tearsheet data)`)
  console.log(`  - GET /api/tearsheet/example (returns example tearsheet)`)
  console.log(`  - GET /health (health check)`)
  console.log(`\nTry these URLs in your browser:`)
  console.log(`  - http://localhost:3000/dashboard/test-strategy`)
  console.log(`  - http://localhost:3000/dashboard/minimal`)
  console.log(`  - http://localhost:3000/dashboard/example`)
})