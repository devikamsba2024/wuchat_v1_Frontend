// Debug script to test API calls and log everything
const fs = require('fs');

async function debugAPI() {
  const logFile = 'api-debug.log';
  const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(logFile, logMessage);
  };

  log('='.repeat(80));
  log('STARTING API DEBUG TEST');
  log('='.repeat(80));

  const url = 'http://localhost:8501/api/ask';
  const requestBody = {
    q: "Does WSU offer masters in Business Analytics",
    user_id: "test_user",
    session_id: "test_session",
    context: {}
  };

  log(`\n📤 Making request to: ${url}`);
  log(`📤 Request body: ${JSON.stringify(requestBody, null, 2)}`);

  try {
    log('\n📥 Starting fetch...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    log(`\n📥 Response status: ${response.status} ${response.statusText}`);
    log(`📥 Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}`);

    if (!response.ok) {
      log(`\n❌ Response not OK! Status: ${response.status}`);
      const errorText = await response.text();
      log(`❌ Error response: ${errorText}`);
      return;
    }

    const contentType = response.headers.get('content-type');
    log(`\n📥 Content-Type: ${contentType}`);

    const responseText = await response.text();
    log(`\n📥 Response text length: ${responseText.length}`);
    log(`📥 Response text (first 1000 chars): ${responseText.substring(0, 1000)}`);

    let data;
    try {
      data = JSON.parse(responseText);
      log(`\n✅ JSON parsed successfully`);
    } catch (parseError) {
      log(`\n❌ JSON parse error: ${parseError.message}`);
      log(`❌ Response text: ${responseText}`);
      return;
    }

    log(`\n📥 Parsed data keys: ${Object.keys(data).join(', ')}`);
    log(`📥 data.answer type: ${typeof data.answer}`);
    log(`📥 data.answer value: ${data.answer ? data.answer.substring(0, 200) : 'null/undefined'}`);
    log(`📥 data.answer is string? ${typeof data.answer === 'string'}`);
    log(`📥 data.sources exists? ${!!data.sources}`);
    log(`📥 data.sources length: ${data.sources?.length || 0}`);

    // Simulate the parsing logic
    log(`\n🔍 Testing parsing logic...`);
    
    if (data.success === false) {
      log(`⚠️ Matched: data.success === false`);
    } else if (data.status === 'error') {
      log(`⚠️ Matched: data.status === 'error'`);
    } else if (data.answer && typeof data.answer === 'string') {
      log(`✅✅✅ MATCHED: answer is string format ✅✅✅`);
      log(`✅ Answer length: ${data.answer.length}`);
      
      const result = {
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
      
      log(`\n✅✅✅ PARSED RESULT ✅✅✅`);
      log(`✅ result.status: ${result.status}`);
      log(`✅ result.answer exists? ${!!result.answer}`);
      log(`✅ result.answer.text exists? ${!!result.answer.text}`);
      log(`✅ result.answer.text: ${result.answer.text.substring(0, 200)}...`);
      log(`\n✅ Full result: ${JSON.stringify(result, null, 2)}`);
      
      // Test component extraction
      log(`\n🔍 Testing component extraction...`);
      const responseText_extracted = result.answer?.text || 'No response received';
      log(`✅ Component would extract: ${responseText_extracted.substring(0, 200)}...`);
      log(`✅ Extraction successful? ${responseText_extracted !== 'No response received'}`);
      
    } else if (data.success && data.data) {
      log(`⚠️ Matched: old format (data.success && data.data)`);
    } else if (data.answer && typeof data.answer === 'object') {
      log(`⚠️ Matched: answer is object format`);
    } else {
      log(`❌❌❌ NO FORMAT MATCHED - FALLING BACK ❌❌❌`);
      log(`❌ Full data: ${JSON.stringify(data, null, 2)}`);
    }

  } catch (error) {
    log(`\n❌❌❌ ERROR OCCURRED ❌❌❌`);
    log(`❌ Error type: ${error.constructor.name}`);
    log(`❌ Error message: ${error.message}`);
    log(`❌ Error stack: ${error.stack}`);
  }

  log('\n' + '='.repeat(80));
  log('DEBUG TEST COMPLETE');
  log('='.repeat(80));
  log(`\n📄 Full log saved to: ${logFile}`);
}

debugAPI().catch(console.error);

