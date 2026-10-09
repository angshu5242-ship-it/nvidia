import { ArrowRight, Sparkles, Video, Image, Zap, CheckCircle, Download, Clock } from 'lucide-react';

const Hero = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-50 via-white to-primary-50 dark:from-dark-950 dark:via-dark-900 dark:to-primary-950/20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwZWE1ZTkiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0yaC00em0wLTMwVjBoLTJ2NGgtNHYyaDR2NGgyVjZoNHY0aC00em02IDM0di00SDR2NEgwdjJoNHY0aDJ2LTRoNHYtMkg2em02IDRWMGg0djRIMHYyaDQ0djRoMlY2aDQ0VjZINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Powered by NVIDIA NIM APIs</span>
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
            <span>FLUX.1-dev & Wan2.2</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-dark-900 dark:text-white mb-6 animate-slide-up">
            Create Stunning{' '}
            <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Thumbnails & Videos
            </span>{' '}
            with AI
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl lg:text-2xl text-dark-600 dark:text-dark-300 max-w-3xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Generate professional YouTube thumbnails, Hindi Kahani storytelling videos, and multiple video types 
            using NVIDIA's state-of-the-art FLUX.1-dev and Wan2.2 models.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <a href="#thumbnail" className="btn-primary group flex items-center gap-2 text-lg px-8 py-4">
              <Sparkles className="w-5 h-5" />
              Start Creating
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#hindi-kahani" className="btn-secondary flex items-center gap-2 text-lg px-8 py-4">
              <Video className="w-5 h-5" />
              Hindi Kahani Videos
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-dark-500 dark:text-dark-400 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Free NVIDIA API</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-green-500" />
              <span>Instant Download</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span>Fast Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-500" />
              <span>GPU Accelerated</span>
            </div>
          </div>
        </div>

        {/* Feature Preview Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
          {/* Thumbnail Card */}
          <div className="card group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6 h-full flex flex-col">
              <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Image className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">AI Thumbnails</h3>
              <p className="text-dark-600 dark:text-dark-400 mb-4 flex-1">
                Generate eye-catching YouTube thumbnails, Instagram covers, and social media graphics with FLUX.1-dev.
              </p>
              <a href="#thumbnail" className="text-primary-600 dark:text-primary-400 font-medium hover:underline flex items-center gap-1 group">
                Try it now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Hindi Kahani Card */}
          <div className="card group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6 h-full flex flex-col">
              <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">Hindi Kahani Videos</h3>
              <p className="text-dark-600 dark:text-dark-400 mb-4 flex-1">
                Create engaging Hindi storytelling videos with Wan2.2 text-to-video. Perfect for moral stories, Panchatantra, and folk tales.
              </p>
              <a href="#hindi-kahani" className="text-purple-600 dark:text-purple-400 font-medium hover:underline flex items-center gap-1 group">
                Create Stories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Video Types Card */}
          <div className="card group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-6 h-full flex flex-col">
              <div className="w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-2">Multiple Video Types</h3>
              <p className="text-dark-600 dark:text-dark-400 mb-4 flex-1">
                Educational content, motivational shorts, music visualizations, and image-to-video animations.
              </p>
              <a href="#video-types" className="text-orange-600 dark:text-orange-400 font-medium hover:underline flex items-center gap-1 group">
                Explore Types <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-dark-300 dark:border-dark-600 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-dark-400 dark:bg-dark-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    </section>
  );
};

export default Hero;