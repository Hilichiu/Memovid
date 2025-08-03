# Video Creator App

A beautiful, modern web application that turns your favorite photos into stunning videos with background music. Built with React, TypeScript, and FFmpeg.wasm for client-side video processing.

![Video Creator App](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.2-purple)
![FFmpeg.wasm](https://img.shields.io/badge/FFmpeg.wasm-0.12.15-red)

## ✨ Features

- 📸 **Photo Upload**: Select and reorder multiple photos
- 🎵 **Background Music**: Add audio with fade effects
- ⚡ **Client-side Processing**: Everything runs in your browser - completely private
- 🌓 **Dark/Light Theme**: Automatic theme switching
- 🌍 **Bilingual Support**: English and Traditional Chinese (zh-TW)
- 🎬 **Professional Effects**: Fade in/out effects for photos and audio
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🚀 **Fast Performance**: Built with Vite for optimal loading

## 🎯 Demo

Visit the live demo: [https://yourusername.github.io/video-creator-app](https://yourusername.github.io/video-creator-app)

## 🛠️ Technologies Used

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Video Processing**: FFmpeg.wasm
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/video-creator-app.git
cd video-creator-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

### Deploying to GitHub Pages

```bash
npm run deploy
```

## 📖 How to Use

1. **Upload Photos**: Click "Select Photos" to choose images from your device
2. **Reorder Photos**: Drag and drop photos to change their order
3. **Add Music**: Upload an audio file (optional)
4. **Customize Settings**:
   - Adjust photo duration
   - Enable fade effects
   - Choose fade positions (beginning/end or throughout)
   - Enable audio fade effects
5. **Create Video**: Click "Create Video" and wait for processing
6. **Download**: Save your generated video to your device

## 🔧 Configuration

### Changing Repository Name

If you want to use a different repository name:

1. Update `base` in `vite.config.ts`:
```typescript
base: '/your-repo-name/',
```

2. Update `homepage` in `package.json`:
```json
"homepage": "https://yourusername.github.io/your-repo-name",
```

### Supported File Formats

- **Images**: JPEG, PNG, WebP, GIF
- **Audio**: MP3, WAV, OGG, M4A

## 🌟 Features in Detail

### Video Processing
- Client-side video generation using FFmpeg.wasm
- 1080p HD output (1920x1080)
- Automatic aspect ratio handling
- Professional fade effects

### User Interface
- Modern, clean design with Tailwind CSS
- Responsive layout for all screen sizes
- Dark mode support
- Intuitive drag-and-drop interface

### Privacy & Security
- No data uploaded to servers
- All processing happens locally in your browser
- Your photos and videos never leave your device

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) for client-side video processing
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful styling
- [Lucide React](https://lucide.dev/) for the clean icons
- [Vite](https://vitejs.dev/) for the blazing fast build tool
