// Test script to simulate the exact frontend flow
const fs = require('fs');

const logFile = 'frontend-debug.log';
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(logFile, logMessage);
};

// Simulate the API response structure
async function simulateFrontendFlow() {
  log('='.repeat(80));
  log('SIMULATING FRONTEND FLOW');
  log('='.repeat(80));

  // Step 1: Make API call (simulating what frontend does)
  const url = 'http://localhost:8501/api/ask';
  const requestBody = {
    q: "Does WSU offer masters in Business Analytics",
    user_id: "test_user",
    session_id: "test_session",
    context: {}
  };

  log(`\n📤 Step 1: Making API call to ${url}`);
  
  let apiResponse;
  try {
    const httpResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    log(`📥 Step 2: Got response, status: ${httpResponse.status}`);
    
    if (!httpResponse.ok) {
      log(`❌ Response not OK: ${httpResponse.status}`);
      return;
    }

    const rawResponseText = await httpResponse.text();
    log(`📥 Step 3: Response text length: ${rawResponseText.length}`);
    
    const data = JSON.parse(rawResponseText);
    log(`📥 Step 4: Parsed JSON, keys: ${Object.keys(data).join(', ')}`);
    log(`📥 Step 5: data.answer type: ${typeof data.answer}`);
    log(`📥 Step 6: data.answer is string? ${typeof data.answer === 'string'}`);

    // Step 5: Simulate API layer parsing (from api.ts)
    log(`\n🔍 Step 7: Simulating API layer parsing...`);
    
    if (data.answer && typeof data.answer === 'string') {
      log(`✅ API Layer: Matched string format`);
      
      const apiResult = {
        status: 'OK',
        answer: {
          text: data.answer,
          confidence: 0.9
        },
        source: {
          url: data.sources && data.sources[0]?.source_file 
            ? `https://wichita.edu/${data.sources[0].source_file}` 
            : '',
          quote: data.sources && data.sources[0]?.text_snippet 
            ? data.sources[0].text_snippet 
            : ''
        }
      };
      
      log(`✅ API Layer: Created result object`);
      log(`✅ API Layer: result.answer.text exists? ${!!apiResult.answer.text}`);
      log(`✅ API Layer: result.answer.text: ${apiResult.answer.text.substring(0, 100)}...`);
      
      apiResponse = apiResult;
    } else {
      log(`❌ API Layer: Did not match string format`);
      log(`❌ API Layer: Falling back...`);
      apiResponse = {
        status: 'OK',
        answer: {
          text: 'No response received from backend',
          confidence: 0.5
        }
      };
    }

    // Step 6: Simulate component extraction (from SimpleChat.tsx)
    log(`\n🔍 Step 8: Simulating component extraction...`);
    log(`📥 Component receives: ${JSON.stringify(apiResponse, null, 2)}`);
    
    const componentResponse = apiResponse; // This is what component receives
    
    log(`📥 Component: componentResponse.status = ${componentResponse.status}`);
    log(`📥 Component: componentResponse.answer exists? ${!!componentResponse.answer}`);
    log(`📥 Component: componentResponse.answer type = ${typeof componentResponse.answer}`);
    log(`📥 Component: componentResponse.answer?.text = ${componentResponse.answer?.text}`);
    
    let extractedText = 
      componentResponse.answer?.text ||  // Primary: answer.text
      (typeof componentResponse.answer === 'string' ? componentResponse.answer : null) ||  // Fallback: answer is string
      componentResponse.data?.response ||  // Fallback: old format
      'No response received';
    
    log(`📥 Component: Extracted text = ${extractedText.substring(0, 100)}...`);
    log(`📥 Component: extractedText === "No response received"? ${extractedText === 'No response received'}`);
    
    if (extractedText === 'No response received') {
      log(`\n❌❌❌ COMPONENT EXTRACTION FAILED ❌❌❌`);
      log(`❌ componentResponse object keys: ${Object.keys(componentResponse).join(', ')}`);
      log(`❌ componentResponse.answer: ${JSON.stringify(componentResponse.answer, null, 2)}`);
    } else {
      log(`\n✅✅✅ SUCCESS! Component extracted text successfully ✅✅✅`);
      log(`✅ Final extractedText: ${extractedText.substring(0, 200)}...`);
    }

  } catch (error) {
    log(`\n❌❌❌ ERROR IN FLOW ❌❌❌`);
    log(`❌ Error: ${error.message}`);
    log(`❌ Stack: ${error.stack}`);
  }

  log('\n' + '='.repeat(80));
  log('FRONTEND FLOW TEST COMPLETE');
  log('='.repeat(80));
  log(`\n📄 Full log saved to: ${logFile}`);
}

simulateFrontendFlow().catch(console.error);

