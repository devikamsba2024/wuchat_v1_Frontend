# WSU Assistant

A clean, minimal chat interface for Wichita State University information and support.

## 🚀 Features

- **Interactive Chat Interface**: Full-featured chat UI with message history and quick prompts
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
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

This project carefully follows Wichita State University's brand guidelines while maintaining compliance:

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

**What we DON'T use:**
- Official WSU logos (Wheat, Flying W, WuShock mascot)
- Licensed Klavika font (using Titillium Web instead)
- Official wordmarks or trademarked materials

**What we DO use:**
- Generic "WU" letterform watermark (custom SVG, not trademarked)
- Official brand colors as specified on wichita.edu
- Typography that closely matches WSU's visual identity
- Design patterns inspired by the official website

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wubot
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

## 🔮 Future Enhancements

- [ ] Backend integration for real AI responses
- [ ] User authentication and chat history persistence
- [ ] Advanced search functionality
- [ ] Multi-language support
- [ ] Voice input/output capabilities
- [ ] Integration with WSU's official APIs

## 📄 License

This project is for educational and demonstration purposes. Please respect Wichita State University's intellectual property and brand guidelines.

---

**Disclaimer**: This is an unofficial project and is not affiliated with Wichita State University. For official university information, please visit the official website at [wichita.edu](https://www.wichita.edu).