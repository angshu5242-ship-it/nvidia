import { Sparkles, Video, Image, Zap, Shield, Download, Clock, Globe, Layers, Heart, Star, Award, BookOpen } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'FLUX.1-dev Image Generation',
      description: 'State-of-the-art text-to-image model for creating stunning thumbnails, social media graphics, and visual content with exceptional quality and detail.',
      color: 'from-primary-500 to-blue-600',
      bgColor: 'bg-primary-50 dark:bg-primary-900/20',
      borderColor: 'border-primary-200 dark:border-primary-800',
    },
    {
      icon: Video,
      title: 'Wan2.2 Video Generation',
      description: 'Advanced 14B parameter video model supporting both text-to-video and image-to-video generation up to 201 frames at 16-30 FPS.',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    {
      icon: BookOpen,
      title: 'Hindi Kahani Templates',
      description: 'Pre-built prompts for moral stories, Panchatantra tales, Akbar-Birbal, folk tales, and mythological stories - ready to generate engaging content.',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
    {
      icon: Layers,
      title: 'Multiple Video Types',
      description: 'Educational videos, motivational shorts, music visualizations, and image-to-video animations - all from a single unified interface.',
      color: 'from-green-500 to-teal-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    {
      icon: Zap,
      title: 'GPU Accelerated',
      description: 'Powered by NVIDIA NIM microservices running on optimized GPU infrastructure for fast, reliable generation with TensorRT optimization.',
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
    },
    {
      icon: Download,
      title: 'Instant Download',
      description: 'Download generated thumbnails and videos immediately in high quality. No watermarks, no waiting queues, full ownership of your content.',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      borderColor: 'border-pink-200 dark:border-pink-800',
    },
    {
      icon: Shield,
      title: 'Content Safety',
      description: 'Built-in Cosmos-1.0-Guardrail content filtering ensures generated content is safe and appropriate for all audiences.',
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
    },
    {
      icon: Globe,
      title: 'Free Cloud API',
      description: 'Access NVIDIA\'s cutting-edge models for free through the integrate.api.nvidia.com endpoint with your personal API key.',
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
    },
  ];

  const stats = [
    { value: '14B', label: 'Parameters', icon: Award },
    { value: '201', label: 'Max Frames', icon: Video },
    { value: '30', label: 'FPS Max', icon: Clock },
    { value: '∞', label: 'Generations', icon: Heart },
  ];

  return (
    <section id="features" className="py-20 lg:py-32 bg-dark-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            <span>Why Choose NVIDIA VideoGen</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-dark-900 dark:text-white mb-4">
            Powerful Features for <span className="gradient-text">Content Creators</span>
          </h2>
          <p className="text-lg text-dark-600 dark:text-dark-300">
            Everything you need to create professional-quality thumbnails and videos using NVIDIA's latest AI models.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={stat.label} className="card p-6 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col items-center">
                <stat.icon className="w-10 h-10 text-primary-500 mb-3" />
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-dark-600 dark:text-dark-400 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`card p-6 relative ${feature.bgColor} ${feature.borderColor} group`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: feature.color }} />
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`} style={{ background: feature.color }}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-dark-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-dark-600 dark:text-dark-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Model Info */}
        <div className="mt-16 grid lg:grid-cols-2 gap-8">
          <div className="card p-8">
            <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-primary-500" />
              Supported Models
            </h3>
            <div className="space-y-4">
              {[
                { name: 'FLUX.1-dev', type: 'Image Generation', quality: 'Highest', speed: 'Medium' },
                { name: 'FLUX.1-schnell', type: 'Image Generation', quality: 'High', speed: 'Fast' },
                { name: 'FLUX.1-Kontext-dev', type: 'Image + Text', quality: 'High', speed: 'Medium' },
                { name: 'FLUX.2-klein-4B', type: 'Image Generation', quality: 'Good', speed: 'Very Fast' },
                { name: 'Stable Diffusion 3.5 Large', type: 'Image Generation', quality: 'High', speed: 'Medium' },
                { name: 'Qwen-Image / Qwen-Image-2512', type: 'Image + Text', quality: 'High', speed: 'Medium' },
                { name: 'Wan2.2 (t2v)', type: 'Text-to-Video', quality: 'High', speed: 'Slow' },
                { name: 'Wan2.2 (i2v)', type: 'Image-to-Video', quality: 'High', speed: 'Slow' },
              ].map((model) => (
                <div key={model.name} className="flex items-center justify-between p-3 rounded-lg bg-dark-100 dark:bg-dark-800">
                  <div>
                    <div className="font-medium text-dark-900 dark:text-white">{model.name}</div>
                    <div className="text-sm text-dark-500 dark:text-dark-400">{model.type}</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                      {model.quality}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {model.speed}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-8">
            <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-6 flex items-center gap-3">
              <Video className="w-7 h-7 text-purple-500" />
              Video Generation Specs
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-dark-100 dark:bg-dark-800">
                  <div className="text-sm text-dark-500 dark:text-dark-400">Max Resolution</div>
                  <div className="font-bold text-dark-900 dark:text-white">1920×1080</div>
                </div>
                <div className="p-4 rounded-lg bg-dark-100 dark:bg-dark-800">
                  <div className="text-sm text-dark-500 dark:text-dark-400">Max Frames</div>
                  <div className="font-bold text-dark-900 dark:text-white">201</div>
                </div>
                <div className="p-4 rounded-lg bg-dark-100 dark:bg-dark-800">
                  <div className="text-sm text-dark-500 dark:text-dark-400">Max FPS</div>
                  <div className="font-bold text-dark-900 dark:text-white">30</div>
                </div>
                <div className="p-4 rounded-lg bg-dark-100 dark:bg-dark-800">
                  <div className="text-sm text-dark-500 dark:text-dark-400">Max Duration</div>
                  <div className="font-bold text-dark-900 dark:text-white">~12.5s</div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Important Notes</h4>
                <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                  <li>• Width × Height ≤ 1,062,400 pixels</li>
                  <li>• Dimensions snapped to multiples of 16</li>
                  <li>• Output keeps reference image aspect ratio (I2V)</li>
                  <li>• Audio not included - add separately with FFmpeg</li>
                  <li>• Content filtered by Cosmos-1.0-Guardrail</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;