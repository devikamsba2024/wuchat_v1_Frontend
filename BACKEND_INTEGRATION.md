# Backend Integration Guide

## Overview
The WSU Assistant frontend is now configured to communicate with a backend API at `http://localhost:8000/api/ask`.

## API Configuration

### Environment Variables
The API URL can be configured using environment variables:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Default Configuration
- **Default API URL**: `http://localhost:8000`
- **Endpoint**: `POST /api/ask`
- **Content-Type**: `application/json`

## API Request Format

The frontend sends requests in the following format:

```typescript
interface ChatRequest {
  message: string;           // User's message
  user_id?: string;         // Unique user identifier
  session_id?: string;      // Session identifier for conversation continuity
  context?: {
    user_name?: string;     // User's name if provided
    conversation_history?: ChatMessage[]; // Last 10 messages for context
  };
}
```

## API Response Format

The backend should respond with:

```typescript
interface ChatResponse {
  status: 'OK' | 'error';
  answer?: {
    fact_type?: string;        // Type of information (e.g., 'deadline')
    deadline_type?: string;    // Type of deadline (e.g., 'final')
    level?: string;           // Academic level (e.g., 'undergraduate')
    audience?: string;        // Target audience (e.g., 'domestic')
    date_iso?: string;        // ISO date string
    timezone?: string;        // Timezone information
    text: string;             // Main response text
    confidence?: number;      // Confidence score (0-1)
  };
  source?: {
    url: string;              // Source URL
    quote: string;            // Relevant quote from source
  };
  session_id?: string;        // Session identifier
  user_id?: string;          // User identifier
  error_message?: string;     // Error message if status is 'error'
}
```

## Example API Call

```bash
curl -X POST http://localhost:8000/api/ask \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the admission deadlines?",
    "user_id": "user_123",
    "session_id": "session_456",
    "context": {
      "user_name": "John",
      "conversation_history": []
    }
  }'
```

## Example Response

```json
{
  "status": "OK",
  "answer": {
    "fact_type": "deadline",
    "deadline_type": "final",
    "level": "undergraduate", 
    "audience": "domestic",
    "date_iso": "2025-01-15",
    "timezone": "America/Chicago",
    "text": "The final deadline for undergraduate admissions is January 15, 2025.",
    "confidence": 0.95
  },
  "source": {
    "url": "https://wichita.edu/admissions/deadlines",
    "quote": "Final deadline for Fall 2025: January 15, 2025"
  }
}
```

## Structured Data Display

The frontend automatically formats structured responses:

1. **Deadline Information**: Special formatting for admission deadlines with dates and details
2. **Confidence Indicators**: Visual badges showing response confidence levels
3. **Source Attribution**: Clickable links to source URLs with relevant quotes
4. **Fact Type Recognition**: Different display styles based on information type

## Error Handling

The frontend includes comprehensive error handling:

1. **Network Errors**: Shows user-friendly error messages
2. **API Errors**: Displays backend error messages
3. **Fallback Responses**: Provides default responses when backend is unavailable
4. **Retry Functionality**: Users can retry failed messages
5. **Confidence Warnings**: Alerts users when information confidence is low

## Session Management

- **Session IDs**: Automatically generated for each conversation
- **User IDs**: Unique identifiers for each user
- **Session Reset**: Clears session when user starts a new chat
- **Context Preservation**: Sends conversation history for context

## Testing the Integration

1. **Start the backend server** on `http://localhost:8000`
2. **Start the frontend** with `npm run dev`
3. **Test the chat** by sending messages
4. **Check browser console** for any API errors

## Development Notes

- The frontend gracefully handles backend unavailability
- Mock responses are used during name collection phase
- Real API calls are made only for regular conversation
- All API calls include proper error handling and user feedback

## Production Deployment

For production deployment:

1. Update `NEXT_PUBLIC_API_URL` to your production API endpoint
2. Ensure CORS is properly configured on your backend
3. Test the integration thoroughly before going live
4. Monitor API response times and error rates
