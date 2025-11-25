# WSU Assistant

A chat interface for Wichita State University information and support.

## 🚀 Features

- **Interactive Chat Interface**: Full-featured chat UI with message history and quick prompts
- **Dark Mode Support**: Automatic theme detection with manual toggle option
- **Accessibility**: WCAG 2.2 AA compliant with keyboard navigation and screen reader support
- **WSU Brand Compliance**: Carefully designed to match Wichita State University's visual identity
- **Minimal Interface**: Clean, focused design with no distractions

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🎨 Brand Guidelines

This project follows Wichita State University's brand guidelines while maintaining compliance:

### Colors
- **WSU Yellow**: #FFDB00 (Shocker Yellow)
- **WSU Black**: #27251F (Web black)
- **WSU White**: #FFFFFF

### Typography
- **Headings**: Titillium Web (web-safe alternative to Klavika)
- **Body Text**: Roboto
- **Fallbacks**: System fonts for optimal performance

### Important Brand Compliance Notes

⚠️ **This is an unofficial project** and is not affiliated with or endorsed by Wichita State University.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wuchat_v1_Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page with chat
│   └── globals.css        # Global styles and CSS variables
├── components/            # React components
│   ├── ui/               # shadcn/ui components (button, card, badge, etc.)
│   ├── SimpleChat.tsx    # Main chat interface component
│   ├── StructuredMessage.tsx  # Message display with structured data
│   ├── WuWatermark.tsx   # Custom WU watermark SVG
│   ├── Header.tsx        # Site header
│   └── Layout.tsx        # Main layout wrapper
└── lib/                  # Utility functions and API
    ├── api.ts            # Backend API integration
    └── utils.ts          # Tailwind class utilities
```

## 🎯 Key Components

### SimpleChat
The main chat interface component featuring:
- Real-time message exchange with backend API
- Message history with user/bot distinction
- Typing indicators
- Copy-to-clipboard functionality
- Source URL linking
- Mobile-responsive design
- Session and user management

### StructuredMessage
Displays bot responses with structured data:
- Deadline information with dates
- Confidence scores
- Source URLs as clickable links
- Markdown rendering with auto-linking

### Accessibility Features
- Skip-to-content links
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast mode support

## 🔧 Customization

### Styling Customization
The app uses CSS variables for easy theming. Key variables are defined in `src/app/globals.css`:

```css
:root {
  --wsu-yellow: #FFDB00;
  --wsu-black: #27251F;
  --wsu-white: #FFFFFF;
}
```

## 🔗 Backend Integration

The frontend is configured to communicate with a backend API for real AI responses:

- **API Endpoint**: `POST http://localhost:8501/api/ask`
- **Configuration**: Set `NEXT_PUBLIC_API_URL` environment variable (defaults to `http://localhost:8501`)
- **Error Handling**: Graceful fallback when backend is unavailable
- **Session Management**: Automatic session and user ID generation
- **Context Awareness**: Sends conversation history for better responses

## 🚀 Local Production Deployment

### Prerequisites
- Node.js 18+ installed
- Backend API running on port 8501 (or configure `NEXT_PUBLIC_API_URL`)

### Steps to Deploy Locally

1. **Build the production version:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

3. **Access the application:**
   - Open [http://localhost:3000](http://localhost:3000) in your browser
   - The app will connect to your backend API at `http://localhost:8501`

### Environment Configuration

Create a `.env.local` file in the root directory (optional, defaults are already set):

```env
NEXT_PUBLIC_API_URL=http://localhost:8501
```

### Running in Production Mode

The production build is optimized and includes:
- ✅ Minified JavaScript and CSS
- ✅ Optimized images and assets
- ✅ Static page generation where possible
- ✅ Production-ready error handling

### Port Configuration

- **Frontend**: Runs on port 3000 by default
- **Backend**: Configured to connect to port 8501

To change the frontend port:
```bash
PORT=8080 npm start
```

To change the backend URL, set the `NEXT_PUBLIC_API_URL` environment variable before building.

## 🐳 Docker Deployment

### Prerequisites
- Docker installed and running
- Backend API accessible (running on host machine or in another container)

### Building the Docker Image

Build the production image:

```bash
docker build -t wuchat .
```

This will:
- Install all dependencies
- Build the Next.js production bundle
- Create an optimized container image

### Running the Container

#### Basic Run (Backend on Host Machine)

For Mac/Windows (backend on host at `localhost:8501`):

```bash
docker run -d -p 3000:3000 \
  --name wuchat \
  -e NEXT_PUBLIC_API_URL=http://host.docker.internal:8501 \
  wuchat
```

For Linux (replace `192.168.1.100` with your host IP):

```bash
docker run -d -p 3000:3000 \
  --name wuchat \
  -e NEXT_PUBLIC_API_URL=http://192.168.1.100:8501 \
  --add-host=host.docker.internal:host-gateway \
  wuchat
```

#### Using Docker Compose (Recommended)

Create a `docker-compose.yml`:

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8501
    depends_on:
      - backend
    restart: unless-stopped

  backend:
    # Your backend service configuration here
    # Example:
    # image: your-backend-image
    # ports:
    #   - "8501:8501"
```

Then run:

```bash
docker-compose up -d
```

### Container Management

**View logs:**
```bash
docker logs wuchat
# or follow logs in real-time
docker logs -f wuchat
```

**Stop the container:**
```bash
docker stop wuchat
```

**Start the container:**
```bash
docker start wuchat
```

**Remove the container:**
```bash
docker rm -f wuchat
```

**Rebuild and restart:**
```bash
docker build -t wuchat .
docker rm -f wuchat
docker run -d -p 3000:3000 --name wuchat -e NEXT_PUBLIC_API_URL=http://host.docker.internal:8501 wuchat
```

### Testing the Container

After starting the container, verify it's running:

```bash
# Check container status
docker ps

# Test HTTP endpoint
curl http://localhost:3000

# Check environment variables
docker exec wuchat printenv NEXT_PUBLIC_API_URL
```

### Notes

- The container runs in production mode and serves the app on port `3000`
- `host.docker.internal` lets the container reach services running on your host machine (Mac/Windows)
- For Linux, use the host IP address or configure `--add-host=host.docker.internal:host-gateway`
- The container includes all necessary dependencies and is optimized for production use

## 🔮 Future Enhancements

- [x] Backend integration for real AI responses
- [ ] User authentication and chat history persistence
- [ ] Advanced search functionality
- [ ] Multi-language support
- [ ] Voice input/output capabilities
- [ ] Integration with WSU's official APIs

## 📄 License

This project is for educational and demonstration purposes. Please respect Wichita State University's intellectual property and brand guidelines.

---

