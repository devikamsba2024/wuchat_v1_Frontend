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
│   └── page.tsx           # Landing page with chat
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── WuWatermark.tsx   # Custom WU watermark SVG
│   ├── ChatWindow.tsx    # Main chat interface
│   ├── ChatMessage.tsx   # Individual message component
│   ├── PromptChips.tsx   # Quick prompt buttons
│   ├── Header.tsx        # Site header
│   └── Layout.tsx        # Main layout wrapper
└── lib/                  # Utility functions
    └── utils.ts          # Tailwind class utilities
```

## 🎯 Key Components

### WuWatermark
Custom SVG component that renders a subtle "WU" watermark on the landing page. Designed to be non-intrusive and not use any trademarked materials.

### ChatWindow
The main chat interface featuring:
- Message history with user/bot distinction
- Typing indicators
- Quick prompt chips
- Copy-to-clipboard functionality
- Mobile-responsive design

### Accessibility Features
- Skip-to-content links
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast mode support

## 🔧 Customization

### Adding New Chat Prompts
Edit the `defaultPrompts` array in `src/components/PromptChips.tsx`:

```typescript
const defaultPrompts = [
  'Application deadlines',
  'Scholarships',
  'Campus map',
  'Contact OneStop',
  // Add your custom prompts here
];
```

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

