#!/usr/bin/env node

/**
 * Simple test script to verify backend API integration
 * Run with: node test-api.js
 */

const API_URL = 'http://localhost:8000';

async function testAPI() {
  console.log('🧪 Testing WSU Assistant Backend API Integration...\n');

  const testCases = [
    {
      name: 'Basic message test',
      request: {
        message: 'Tell me about admissions',
        user_id: 'test_user_123',
        session_id: 'test_session_456',
        context: {
          user_name: 'Test User',
          conversation_history: []
        }
      }
    },
    {
      name: 'Context-aware test',
      request: {
        message: 'What programs do you offer?',
        user_id: 'test_user_123',
        session_id: 'test_session_456',
        context: {
          user_name: 'Test User',
          conversation_history: [
            {
              id: '1',
              content: 'Hello',
              isUser: true,
              timestamp: new Date().toISOString()
            }
          ]
        }
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    
    try {
      const response = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(testCase.request),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log(`✅ Success: ${data.response}`);
      console.log(`   Status: ${data.status}`);
      console.log(`   Session ID: ${data.session_id || 'N/A'}`);
      console.log('');
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      console.log(`   This is expected if the backend is not running.`);
      console.log('');
    }
  }

  console.log('🔍 Test Summary:');
  console.log('- If you see errors, make sure your backend is running on http://localhost:8000');
  console.log('- The frontend will gracefully handle backend unavailability');
  console.log('- Check the BACKEND_INTEGRATION.md file for detailed setup instructions');
}

// Run the test
testAPI().catch(console.error);
