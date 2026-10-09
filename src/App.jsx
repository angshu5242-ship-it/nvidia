import { ToastProvider } from './hooks/useToast';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import ThumbnailGenerator from './components/ThumbnailGenerator';
import HindiKahaniGenerator from './components/HindiKahaniGenerator';
import VideoTypesGenerator from './components/VideoTypesGenerator';
import VideoClipExtractor from './components/VideoClipExtractor';
import Features from './components/Features';

function App() {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col bg-dark-50 text-dark-900 dark:bg-dark-950 dark:text-dark-100">
        <Header />
        <main className="flex-1">
          <Hero />
          <ThumbnailGenerator />
          <HindiKahaniGenerator />
          <VideoTypesGenerator />
          <VideoClipExtractor />
          <Features />
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}

export default App;