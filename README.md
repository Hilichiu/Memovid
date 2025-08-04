# Memovid

A powerful, modern web application that transforms your photos and videos into stunning cinematic experiences with background music. Create professional-quality videos entirely in your browser with advanced mixed media support and customizable effects.

![Memovid](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-5.4.2-purple)
![FFmpeg.wasm](https://img.shields.io/badge/FFmpeg.wasm-0.12.15-red)

## ✨ Features

### 🎬 Advanced Mixed Media Support
- 📸 **Photo Processing**: Upload and arrange multiple photos with drag-and-drop reordering
- 🎥 **Video Integration**: Mix photos and videos seamlessly in the same project
- 🖼️ **Smart Thumbnails**: Automatic thumbnail generation for both images and videos
- 📏 **Dynamic Frame Rates**: 30fps for videos, 24fps for photo-only content

### 🎵 Professional Audio Management
- 🎵 **Background Music**: Add audio tracks with professional fade effects
- 🔊 **Original Video Audio**: Option to preserve and sync original video sound
- 🎚️ **Audio Timeline Control**: Precise audio synchronization across mixed media
- 🎼 **Fade Effects**: Customizable audio fade in/out with multiple positioning options

### ⚙️ Advanced Video Controls
- ⏱️ **Smart Duration Control**: Individual duration settings for photos vs. videos
- 🎭 **Flexible Fade Effects**: Choose between fade throughout or only at beginning/end
- 🎯 **Video Behavior Settings**: Apply photo duration to videos or let them play fully
- 🔄 **Dynamic Processing**: Intelligent handling based on content type

### 🌟 User Experience
- ⚡ **Client-side Processing**: Everything runs in your browser - completely private
- 🌓 **Dark/Light Theme**: Automatic theme switching with system preference support
- 🌍 **Bilingual Support**: English and Traditional Chinese (zh-TW) with easy toggle
- 📱 **Mobile Optimized**: Responsive design with iOS-specific enhancements
- 🚀 **Fast Performance**: Built with Vite for optimal loading and hot reloading

### 🎥 Professional Output
- 📺 **HD Quality**: Generate beautiful 1080p videos (1920x1080)
- 🎬 **Cinematic Effects**: Professional fade transitions and timing
- 📁 **Smart Naming**: Dynamic filename generation with timestamps
- 💾 **Multi-platform Support**: Works on desktop, tablet, and mobile devices

## 🎯 Live Demo

Visit Memovid: [https://hilichiu.github.io/memovid](https://hilichiu.github.io/memovid)

> **Transform your memories into movies - photos, videos, and music combined!**

## 🛠️ Technologies Used

- **Frontend**: React 18 + TypeScript for type-safe development
- **Build Tool**: Vite for lightning-fast development and building
- **Styling**: Tailwind CSS for modern, responsive design
- **Video Processing**: FFmpeg.wasm for client-side video encoding
- **Icons**: Lucide React for beautiful, consistent iconography
- **Canvas API**: For thumbnail generation and image processing
- **Web APIs**: File handling, drag-and-drop, and mobile optimizations
- **Deployment**: GitHub Pages with automated deployment

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Modern browser with WebAssembly support

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Hilichiu/memovid.git
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

### 🎬 Creating Your Video

1. **📷 Upload Your Media**: 
   - Click "Select Photos" to choose images and videos
   - Supported formats: JPEG, PNG, WebP, GIF, MP4, MOV, AVI
   - Mix photos and videos in the same project

2. **🔄 Arrange Your Story**: 
   - Drag and drop media to create the perfect sequence
   - Visual thumbnails for easy identification
   - Automatic duration calculation display

3. **🎵 Add Soundtrack**: 
   - Upload an audio file (MP3, WAV, OGG, M4A)
   - Enable/disable background music fade effects
   - Control original video audio preservation

4. **⚙️ Customize Your Video**:
   - **Photo Duration**: Set how long each photo appears (1-10 seconds)
   - **Video Behavior**: Choose to apply photo duration or let videos play fully
   - **Fade Effects**: Enable beautiful transitions between media
   - **Fade Position**: "Between each photo" (default) or "Only at beginning and end"
   - **Audio Settings**: Control background music and original video audio
   - **Frame Rate**: Automatic optimization (30fps with videos, 24fps photos-only)

5. **🎬 Generate Your Video**: 
   - Click "Generate Video" and watch real-time progress
   - Advanced FFmpeg processing with optimized settings
   - Dynamic filename generation with timestamp

6. **💾 Save & Share**: 
   - Download your HD video
   - iOS-friendly saving with special instructions
   - Share your cinematic memories

### 🎛️ Advanced Features

#### Mixed Media Processing
- **Intelligent Content Detection**: Automatically adjusts processing based on media types
- **Video Thumbnail Generation**: Creates representative thumbnails for video files
- **Audio Timeline Synchronization**: Ensures perfect audio timing across mixed content
- **Dynamic Frame Rate Selection**: Optimizes output based on content composition

#### Mobile Optimizations
- **iOS Touch Handling**: Enhanced touch interactions for mobile devices
- **Responsive Text Handling**: Automatic truncation for long filenames
- **Portrait Mode Support**: Optimized layouts for mobile viewing
- **Web Share API**: Easy sharing on supported mobile browsers

## 🔧 Configuration

### Supported File Formats

#### Images
- JPEG/JPG (recommended for photos)
- PNG (supports transparency)
- WebP (modern format, smaller sizes)
- GIF (animated GIFs supported)

#### Videos
- MP4 (recommended, best compatibility)
- MOV (Apple format)
- AVI (legacy support)
- WebM (web-optimized)

#### Audio
- MP3 (recommended for compatibility)
- WAV (uncompressed, high quality)
- OGG (open source format)
- M4A (Apple format)

### Performance Recommendations

- **Image Size**: Optimal resolution is 1920x1080 or similar aspect ratios
- **Video Length**: Shorter videos process faster; consider trimming long clips
- **Audio Quality**: 128-192 kbps MP3 provides good balance of quality and file size
- **Browser Memory**: Close other tabs for better performance with large projects

## 🌟 Why Choose Memovid?

### 🎥 Professional Video Creation
- Advanced mixed media support combining photos and videos
- Client-side processing using cutting-edge FFmpeg.wasm technology
- Stunning 1080p HD output with professional encoding settings
- Intelligent aspect ratio handling with smart cropping algorithms
- Dynamic frame rate optimization for different content types

### 🎨 Beautiful User Experience
- Modern, intuitive design with Tailwind CSS styling
- Responsive layout that adapts to any screen size
- Dark mode support for comfortable viewing in any lighting
- Smooth drag-and-drop interface with visual feedback
- Mobile-optimized interactions for touch devices

### 🔒 Privacy First
- **Zero uploads required** - all processing happens locally
- Your media never leaves your device or touches any server
- No registration, accounts, or personal data collection
- Complete privacy protection for your personal memories
- Works completely offline after initial page load

### 🌍 Accessible to Everyone
- Bilingual interface with seamless language switching
- Works on any modern browser without plugins
- No software installation or technical knowledge required
- Completely free and open source
- Comprehensive mobile device support

## 💡 Perfect For

- **Family Memories**: Combine vacation photos and videos with favorite songs
- **Special Occasions**: Create birthday, anniversary, or graduation videos
- **Social Media Content**: Generate engaging mixed media posts
- **Professional Presentations**: Make dynamic slideshows with multimedia
- **Personal Gifts**: Create heartfelt video montages for loved ones
- **Event Documentation**: Combine photos and video clips from events
- **Creative Projects**: Mix different media types for artistic expression

## 🎬 Advanced Use Cases

### Wedding Videos
Combine ceremony photos with video highlights and the couple's favorite song

### Travel Documentaries
Mix scenic photos with short video clips and ambient background music

### Business Presentations
Create engaging marketing videos combining product photos and demonstration clips

### Educational Content
Develop instructional videos mixing diagrams, photos, and explanatory footage

## 🤝 Contributing

We welcome contributions! Please feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Test on multiple browsers and devices
- Keep accessibility in mind
- Document new features thoroughly

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) for enabling powerful client-side video processing
- [Tailwind CSS](https://tailwindcss.com/) for the beautiful, responsive design system
- [Lucide React](https://lucide.dev/) for the comprehensive icon library
- [Vite](https://vitejs.dev/) for the blazing fast development experience
- [React](https://react.dev/) for the robust component framework
- The open source community for continuous inspiration and support

---

**Made with ❤️ for preserving and sharing memories**
