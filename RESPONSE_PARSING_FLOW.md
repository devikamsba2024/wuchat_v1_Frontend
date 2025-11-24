# Frontend Response Parsing Flow

## Overview
This document explains how the frontend parses the backend API response and displays it in the UI.

## Step-by-Step Flow

### 1. Backend Response Format
The backend returns:
```json
{
  "answer": "Yes, Wichita State University (WSU) offers a Master of Science in Business Analytics...",
  "sources": [
    {
      "source_file": "academics_Degree-Programs.md",
      "text_snippet": "Business Analytics :\n— Minor:\nBusiness Analytics...",
      ...
    }
  ],
  "query": "Does WSU offer masters in Business Analytics",
  "user_id": "test",
  "session_id": "test"
}
```

### 2. API Layer (`src/lib/api.ts`)

#### Step 2.1: Receive Response
```typescript
const data = await response.json();
// data = { answer: "Yes, WSU...", sources: [...], ... }
```

#### Step 2.2: Check Response Format
The code checks multiple formats in order:

**Format 1: Error Response**
```typescript
if (data.success === false) {
  // Returns error message
}
```

**Format 2: New Backend Format (STRING answer)** ✅ **THIS IS YOUR CURRENT FORMAT**
```typescript
if (data.answer && typeof data.answer === 'string') {
  return {
    status: 'OK',
    answer: {
      text: data.answer,  // Converts string to object
      confidence: 0.9
    },
    source: {
      url: data.sources[0]?.source_file ? `https://wichita.edu/${data.sources[0].source_file}` : '',
      quote: data.sources[0]?.text_snippet || ''
    }
  };
}
```

**Format 3: Old Backend Format**
```typescript
if (data.success && data.data) {
  // Handles { success: true, data: { response: "..." } }
}
```

**Format 4: Answer Object Format**
```typescript
if (data.answer && typeof data.answer === 'object') {
  // Handles { answer: { text: "...", ... } }
}
```

**Format 5: Fallback**
```typescript
// Tries to extract text from any field
const responseText = data.answer || data.data?.response || data.response || JSON.stringify(data);
```

### 3. Component Layer (`src/components/SimpleChat.tsx`)

#### Step 3.1: Receive API Response
```typescript
const response = await chatAPI.sendMessage(currentInput, context);
// response = { status: 'OK', answer: { text: "...", confidence: 0.9 }, source: {...} }
```

#### Step 3.2: Extract Text
```typescript
let responseText = response.answer?.text || 'No response received';
// responseText = "Yes, Wichita State University (WSU) offers..."
```

**⚠️ PROBLEM POINT**: If `response.answer` is `undefined` or `response.answer.text` is `undefined`, 
it defaults to `'No response received'`

#### Step 3.3: Create Message
```typescript
const botMessage: MessageWithData = {
  ...createChatMessage(responseText, false, 'delivered'),
  answer: response.answer,  // { text: "...", confidence: 0.9 }
  source: response.source   // { url: "...", quote: "..." }
};
```

### 4. Display Layer (`src/components/StructuredMessage.tsx`)

#### Step 4.1: Render Content
```typescript
<ReactMarkdown>{content}</ReactMarkdown>
// content = "Yes, Wichita State University (WSU) offers..."
```

#### Step 4.2: Display Structured Data (if available)
```typescript
{answer && (
  // Shows confidence, deadlines, etc.
)}
```

## Current Issue: "No response received"

### Why it happens:
1. **Line 183 in SimpleChat.tsx**: 
   ```typescript
   let responseText = response.answer?.text || 'No response received';
   ```
   
2. If `response.answer` is `undefined` or `response.answer.text` is `undefined`, 
   it shows "No response received"

### Debugging Steps:
1. Check browser console for:
   - `=== BACKEND RESPONSE DEBUG ===` logs
   - `✅ Matched: answer is string format` or `⚠️ Falling back to fallback handler`
   - `✅ Returning result:` with the full response

2. Verify the API is returning the correct format:
   - Backend should return: `{ answer: "string", sources: [...] }`
   - API layer should convert to: `{ status: 'OK', answer: { text: "string", ... } }`
   - Component should receive: `response.answer.text` as a string

## Expected Flow for Your Backend:

```
Backend Response:
{ answer: "Yes, WSU...", sources: [...] }
         ↓
API Layer (api.ts line 154):
if (data.answer && typeof data.answer === 'string') {
  return { answer: { text: data.answer, ... } }
}
         ↓
Component (SimpleChat.tsx line 183):
responseText = response.answer?.text
         ↓
Display:
<ReactMarkdown>{responseText}</ReactMarkdown>
```

## Debugging Commands:

1. **Check browser console** for debug logs
2. **Verify API response**:
   ```bash
   curl -X POST http://localhost:8501/api/ask \
     -H "Content-Type: application/json" \
     -d '{"q": "test", "user_id": "test", "session_id": "test"}'
   ```
3. **Check if response is being parsed correctly** by looking at console logs

