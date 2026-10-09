import { GitFork, MessageSquare, Users, Sparkles, Video, Image, Layers, Heart, Scissors } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Thumbnail Generator', href: '#thumbnail' },
      { label: 'Hindi Kahani Videos', href: '#hindi-kahani' },
      { label: 'Video Types', href: '#video-types' },
      { label: 'Clip Extractor', href: '#clip-extractor' },
      { label: 'API Documentation', href: 'https://docs.nvidia.com/nim/visual-genai/latest/' },
    ],
    resources: [
      { label: 'NVIDIA NIM Models', href: 'https://build.nvidia.com/models' },
      { label: 'FLUX.1-dev', href: 'https://huggingface.co/black-forest-labs/FLUX.1-dev' },
      { label: 'Wan2.2', href: 'https://huggingface.co/Wan-AI/Wan2.2' },
      { label: 'API Reference', href: 'https://docs.nvidia.com/nim/visual-genai/latest/api/openai-image-generation.html' },
    ],
    support: [
      { label: 'Documentation', href: 'https://docs.nvidia.com/nim/visual-genai/latest/' },
      { label: 'Community Forum', href: 'https://forums.developer.nvidia.com/' },
      { label: 'Contact Support', href: 'https://www.nvidia.com/en-us/support/' },
      { label: 'Status Page', href: 'https://status.nvidia.com/' },
    ],
  };

  const socialLinks = [
    { icon: GitFork, href: 'https://github.com/NVIDIA', label: 'GitHub' },
    { icon: MessageSquare, href: 'https://twitter.com/nvidia', label: 'Twitter' },
    { icon: Users, href: 'https://linkedin.com/company/nvidia', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-dark-50 dark:bg-dark-950 border-t border-dark-200 dark:border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                NVIDIA VideoGen
              </span>
            </div>
            <p className="text-dark-600 dark:text-dark-400 text-sm leading-relaxed mb-6">
              Create stunning thumbnails and Hindi Kahani videos using NVIDIA's cutting-edge AI models.
              Powered by FLUX.1-dev and Wan2.2.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-dark-600 dark:text-dark-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-dark-900 dark:text-white uppercase tracking-wider mb-4">Capabilities</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                <Image className="w-4 h-4 text-primary-500" />
                AI Thumbnail Generation
              </li>
              <li className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                <Video className="w-4 h-4 text-primary-500" />
                Hindi Kahani Videos
              </li>
              <li className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                <Layers className="w-4 h-4 text-primary-500" />
                Multiple Video Types
              </li>
              <li className="flex items-center gap-2 text-sm text-dark-600 dark:text-dark-400">
                <Sparkles className="w-4 h-4 text-primary-500" />
                NVIDIA AI Models
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-dark-200 dark:border-dark-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-dark-500 dark:text-dark-400">
              © {currentYear} NVIDIA VideoGen. Built with NVIDIA NIM APIs.
            </p>
            <p className="text-sm text-dark-500 dark:text-dark-400 flex items-center gap-2">
              Made with <Heart className="w-4 h-4 text-red-500" /> for creators
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;