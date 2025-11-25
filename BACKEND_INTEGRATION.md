# Backend Integration Guide

Updated: November 2025

The frontend now talks to the backend that you deployed on **`http://localhost:8501/api/ask`**. This document summarizes how the integration works today and what the backend needs to return for the UI to render rich answers.

---

## 1. API Configuration

| Setting | Value / Description |
| --- | --- |
| Default base URL | `http://localhost:8501` |
| Endpoint | `POST /api/ask` |
| Content-Type | `application/json` |
| Env override | `NEXT_PUBLIC_API_URL` |

Create `.env.local` (optional—defaults already match):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8501
```

---

## 2. Request Payload

The frontend sends the shape below. Note that the backend expects the **`q`** field instead of `message`.

```ts
interface ChatRequest {
  q: string;                     // user prompt (trimmed)
  user_id?: string;              // auto-generated in the browser
  session_id?: string;           // auto-generated per chat session
  context?: {
    user_name?: string;
    conversation_history?: ChatMessage[]; // last 10 messages
  };
}
```

Example call:

```bash
curl -X POST http://localhost:8501/api/ask \
  -H "Content-Type: application/json" \
  -d '{
    "q": "Does WSU offer Business Analytics?",
    "user_id": "user_demo",
    "session_id": "session_demo",
    "context": {
      "user_name": "Abcd",
      "conversation_history": []
    }
  }'
```

---

## 3. Expected Response Formats

The frontend can handle several shapes automatically. Preferred format:

```ts
{
  "answer": "Yes, Wichita State University (WSU) offers ...",
  "sources": [
    {
      "source_file": "academics_Degree-Programs.md",
      "text_snippet": "Business Analytics ..."
    }
  ],
  "session_id": "...",
  "user_id": "..."
}
```

Other accepted responses:

1. Legacy structured object (with `answer.text`)
2. `{ success: true, data: { response: "..." } }`
3. Error payloads (`success: false`, `status: 'error'`)

Regardless of format, the frontend eventually expects to render `result.answer.text`. If the backend returns a plain string, the API layer converts it automatically.

---

## 4. Structured Data Display

If you return the optional metadata, the UI highlights it:

```ts
"answer": {
  "fact_type": "deadline",
  "deadline_type": "final",
  "level": "undergraduate",
  "audience": "domestic",
  "date_iso": "2025-01-15",
  "timezone": "America/Chicago",
  "text": "...",
  "confidence": 0.95
},
"source": {
  "url": "https://wichita.edu/admissions/deadlines",
  "quote": "Final deadline ..."
}
```

- Deadlines show calendar cards with formatted dates.
- Confidence translates into color-coded badges.
- Source URLs become clickable hyperlinks in the chat bubble.

---

## 5. Error Handling & Fallbacks

| Situation | What the frontend does |
| --- | --- |
| Network failure / timeout | Shows friendly “please try again” message |
| Backend returns `status: 'error'` | Displays backend error text |
| Non-JSON / malformed payload | User-facing error + console stack |
| Missing `answer.text` | Displays safe fallback text |

All errors are now logged succinctly (console noise has been removed).

---

## 6. Session Behaviour

- Each tab/session gets a unique `session_id` and `user_id`.
- Conversation history (last 10 exchanges) is sent to the backend for added context.
- The “Reset chat” button regenerates IDs and clears history.

---

## 7. Testing Checklist

1. **Backend running on 8501**  
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8501
   ```
2. **Frontend dev server**  
   ```bash
   npm run dev
   ```
3. **Verify with curl** (see example above)  
4. **Check browser console** for any remaining warnings/errors.

### Docker end-to-end test

```bash
docker build -t wuchat .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://host.docker.internal:8501 \
  wuchat
```

Ensure the backend is reachable from inside the container (use `host.docker.internal` or the host IP).

---

## 8. Production Notes

1. Set `NEXT_PUBLIC_API_URL` to your production endpoint at build time.
2. Confirm CORS allows requests from the deployed frontend origin.
3. Monitor backend logs for malformed payloads—these now surface clearly.
4. Version the API if you plan breaking changes; the frontend can accept multiple formats, but explicit contracts are safer.

---

With this setup, the frontend stays responsive even if the backend changes its schema slightly, and the UI now surfaces clickable sources, structured deadlines, and fallback text when anything unexpected happens. Let me know if you need the backend contract tightened further (e.g., strict schema validation). 👍
