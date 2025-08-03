# Memovid

A beautiful, modern web application that turns your favorite photos into stunning videos with background music. Transform your memories into cinematic experiences with client-side video processing.

![Memovid](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.2-purple)
![FFmpeg.wasm](https://img.shields.io/badge/FFmpeg.wasm-0.12.15-red)

## ✨ Features

- 📸 **Photo Upload**: Select and reorder multiple photos with ease
- 🎵 **Background Music**: Add audio with professional fade effects
- ⚡ **Client-side Processing**: Everything runs in your browser - completely private
- 🌓 **Dark/Light Theme**: Automatic theme switching
- 🌍 **Bilingual Support**: English and Traditional Chinese (zh-TW)
- 🎬 **Professional Effects**: Fade in/out effects for photos and audio
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🚀 **Fast Performance**: Built with Vite for optimal loading
- 🎥 **HD Quality**: Generate beautiful 1080p videos

## 🎯 Live Demo

Visit Memovid: [https://hilichiu.github.io/memovid](https://hilichiu.github.io/memovid)

> **Turn your memories into movies - all in your browser!**

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
git clone https://github.com/yourusername/memovid.git
cd memovid
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

## 📖 How to Use Memovid

1. **📷 Upload Your Memories**: Click "Select Photos" to choose your favorite images
2. **🔄 Arrange Your Story**: Drag and drop photos to create the perfect sequence
3. **🎵 Add Soundtrack**: Upload an audio file to set the mood (optional)
4. **⚙️ Customize Your Video**:
   - Adjust how long each photo appears
   - Enable beautiful fade effects
   - Choose fade positions (beginning/end or throughout)
   - Add audio fade effects for professional touch
5. **🎬 Create Your Memovid**: Click "Generate Video" and watch the magic happen
6. **💾 Save & Share**: Download your HD video and share your memories

## 🔧 Configuration

### Changing Repository Name

If you want to use a different repository name:

1. Update `base` in `vite.config.ts`:
```typescript
base: '/memovid/',
```

2. Update `homepage` in `package.json`:
```json
"homepage": "https://yourusername.github.io/memovid",
```

### Supported File Formats

- **Images**: JPEG, PNG, WebP, GIF
- **Audio**: MP3, WAV, OGG, M4A

## 🌟 Why Choose Memovid?

### 🎥 Professional Video Creation
- Client-side video generation using FFmpeg.wasm
- Stunning 1080p HD output (1920x1080)
- Automatic aspect ratio handling with smart cropping
- Cinematic fade effects for professional results

### 🎨 Beautiful User Experience
- Modern, intuitive design with Tailwind CSS
- Responsive layout that works on any device
- Dark mode support for comfortable viewing
- Smooth drag-and-drop interface

### 🔒 Privacy First
- **No uploads required** - everything stays on your device
- All processing happens locally in your browser
- Your photos and videos never leave your computer
- No registration or account needed

### 🌍 Accessible to Everyone
- Bilingual interface (English & Traditional Chinese)
- Works on any modern browser
- No software installation required
- Completely free to use

## 💡 Perfect For

- **Family Memories**: Turn vacation photos into shareable videos
- **Special Occasions**: Create birthday or anniversary videos
- **Social Media**: Generate engaging content for your feeds
- **Presentations**: Make photo slideshows with background music
- **Gifts**: Create personalized video gifts for loved ones

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License


## 🙏 Acknowledgments

- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) for client-side video processing
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful styling
- [Lucide React](https://lucide.dev/) for the clean icons
- [Vite](https://vitejs.dev/) for the blazing fast build tool
