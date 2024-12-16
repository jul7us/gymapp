import fetch from 'node-fetch';

async function testApiEndpoints() {
  console.log('🔍 Testing API endpoints...');

  const endpoints = [
    { method: 'GET', url: '/api/get-workouts' },
    { method: 'GET', url: '/api/get-dates?type=push' },
    { method: 'GET', url: '/api/config' },
    { 
      method: 'POST', 
      url: '/api/save-workout',
      body: {
        type: 'Chest',
        exercise: 'Push-ups',
        weight: '0',
        date: '2024-03-21'
      }
    }
  ];

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`http://localhost:3000${endpoint.url}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: endpoint.method === 'POST' ? JSON.stringify(endpoint.body) : undefined
      });

      console.log(`✓ ${endpoint.method} ${endpoint.url}:`, res.ok ? 'success' : 'failed');
    } catch (error) {
      console.error(`✗ ${endpoint.method} ${endpoint.url}:`, error);
    }
  }
}

testApiEndpoints().catch(console.error); 