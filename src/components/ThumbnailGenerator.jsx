import { useState, useCallback } from 'react';
import { Image, Download, Copy, Check, AlertCircle, Loader2, Settings, Sparkles, Trash2, Eye, Maximize2 } from 'lucide-react';
import { generateImage, fileToBase64, downloadMedia, THUMBNAIL_PRESETS } from '../services/nvidiaApi';
import { useToast } from '../hooks/useToast';

const ThumbnailGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('flux.1-dev');
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [steps, setSteps] = useState(30);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [seed, setSeed] = useState(0);
  const [numImages, setNumImages] = useState(1);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const toast = useToast();

  const models = [
    { id: 'flux.1-dev', name: 'FLUX.1-dev (Best Quality)', recommended: true },
    { id: 'flux.1-schnell', name: 'FLUX.1-schnell (Faster)', recommended: false },
    { id: 'flux.1-kontext-dev', name: 'FLUX.1-Kontext-dev (Text + Image)', recommended: false },
    { id: 'flux.2-klein-4b', name: 'FLUX.2-klein-4B (Lightweight)', recommended: false },
    { id: 'stable-diffusion-3.5-large', name: 'Stable Diffusion 3.5 Large', recommended: false },
    { id: 'qwen-image', name: 'Qwen-Image (Text Rendering)', recommended: false },
    { id: 'qwen-image-2512', name: 'Qwen-Image-2512 (Latest)', recommended: false },
  ];

  const aspectRatios = [
    { label: 'YouTube (16:9)', width: 1280, height: 720 },
    { label: 'YouTube Shorts (9:16)', width: 720, height: 1280 },
    { label: 'Instagram Reel (9:16)', width: 1080, height: 1920 },
    { label: 'Instagram Post (1:1)', width: 1080, height: 1080 },
    { label: 'Facebook (1:1)', width: 1080, height: 1080 },
    { label: 'Twitter/X (16:9)', width: 1280, height: 720 },
    { label: 'Custom', width: 1280, height: 720 },
  ];

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    setPrompt(preset.prompt);
    setNegativePrompt(preset.negative_prompt || '');
    setWidth(preset.width);
    setHeight(preset.height);
    toast.success(`Applied preset: ${preset.title}`);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateImage({
        prompt,
        negative_prompt: negativePrompt,
        model,
        width,
        height,
        steps,
        guidance_scale: guidanceScale,
        seed: seed || undefined,
        num_images: numImages,
      });

      // Handle different response formats
      let images = [];
      if (result.data && Array.isArray(result.data)) {
        images = result.data.map((item, index) => ({
          url: item.url,
          prompt,
          model,
          width,
          height,
          seed: item.seed || seed,
          id: Date.now() + index,
        }));
      } else if (result.images && Array.isArray(result.images)) {
        images = result.images.map((item, index) => ({
          url: item.url || item,
          prompt,
          model,
          width,
          height,
          seed: item.seed || seed,
          id: Date.now() + index,
        }));
      }

      setGeneratedImages(prev => [...images, ...prev].slice(0, 20));
      toast.success(`Generated ${images.length} image${images.length > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (image) => {
    try {
      await downloadMedia(image.url, `thumbnail-${image.id}.png`);
      toast.success('Downloaded successfully!');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleCopy = async (image) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Copy failed');
    }
  };

  const handleRemove = (id) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
  };

  const handleClearAll = () => {
    setGeneratedImages([]);
    toast.success('Cleared all images');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        // For future image-to-image or inpainting features
        toast.success('Image uploaded! Ready for image-to-image generation.');
      } catch (error) {
        toast.error('Upload failed');
      }
    }
  };

  return (
    <section id="thumbnail" className="py-20 lg:py-32 bg-white dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            <span>Thumbnail Generator</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-dark-900 dark:text-white mb-4">
            Create Stunning Thumbnails with <span className="gradient-text">FLUX.1-dev</span>
          </h2>
          <p className="text-lg text-dark-600 dark:text-dark-300">
            Generate professional YouTube thumbnails, social media covers, and graphics using NVIDIA's 
            state-of-the-art image generation models.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Presets */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                Quick Presets
              </h3>
              <div className="space-y-2">
                {THUMBNAIL_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedPreset === preset.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <div className="font-medium text-dark-900 dark:text-white">{preset.title}</div>
                    <div className="text-xs text-dark-500 dark:text-dark-400 mt-1 line-clamp-1">{preset.prompt}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Prompt</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your thumbnail... e.g., 'Epic YouTube thumbnail for Hindi horror story, dramatic lighting, scary face, bold Hindi text, 16:9'"
                className="input-field min-h-[120px] resize-y mb-4"
                rows={4}
              />
              <div className="flex items-center justify-between text-sm text-dark-500 dark:text-dark-400">
                <span>{prompt.length} characters</span>
                <span className={prompt.length > 500 ? 'text-orange-500' : ''}>
                  {prompt.length > 500 ? ' (Long prompt)' : ''}
                </span>
              </div>
            </div>

            {/* Negative Prompt */}
            <div className="card p-6">
              <label className="flex items-center justify-between mb-3">
                <span className="font-medium text-dark-900 dark:text-white">Negative Prompt (Optional)</span>
              </label>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="What to avoid... e.g., 'blurry, low quality, watermark, text artifacts, distorted faces'"
                className="input-field min-h-[80px] resize-y"
                rows={3}
              />
            </div>

            {/* Model Selection */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Model</h3>
              <div className="space-y-2">
                {models.map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      model === m.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="model"
                      value={m.id}
                      checked={model === m.id}
                      onChange={() => setModel(m.id)}
                      className="w-4 h-4 text-primary-600 border-dark-300 focus:ring-primary-500"
                    />
                    <span className="font-medium text-dark-900 dark:text-white">{m.name}</span>
                    {m.recommended && (
                      <span className="ml-auto px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                        Recommended
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="card p-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full font-medium text-dark-900 dark:text-white mb-4"
              >
                <span>Advanced Settings</span>
                <Settings className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              {showAdvanced && (
                <div className="space-y-4 animate-slide-down">
                  {/* Aspect Ratio */}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Aspect Ratio</label>
                    <div className="grid grid-cols-3 gap-2">
                      {aspectRatios.map((ratio) => (
                        <button
                          key={ratio.label}
                          onClick={() => {
                            setWidth(ratio.width);
                            setHeight(ratio.height);
                          }}
                          className={`p-2 rounded-lg text-xs font-medium transition-all ${
                            width === ratio.width && height === ratio.height
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-700'
                              : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
                          }`}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Width</label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(Math.min(2048, Math.max(256, parseInt(e.target.value) || 256)))}
                        className="input-field"
                        min={256}
                        max={2048}
                        step={64}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Height</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Math.min(2048, Math.max(256, parseInt(e.target.value) || 256)))}
                        className="input-field"
                        min={256}
                        max={2048}
                        step={64}
                      />
                    </div>
                  </div>

                  {/* Steps */}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 flex items-center justify-between">
                      <span>Inference Steps</span>
                      <span className="text-sm text-dark-500 dark:text-dark-400">{steps}</span>
                    </label>
                    <input
                      type="range"
                      value={steps}
                      onChange={(e) => setSteps(parseInt(e.target.value))}
                      min={10}
                      max={50}
                      step={1}
                      className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-lg appearance-none accent-primary-500"
                    />
                  </div>

                  {/* Guidance Scale */}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 flex items-center justify-between">
                      <span>Guidance Scale</span>
                      <span className="text-sm text-dark-500 dark:text-dark-400">{guidanceScale}</span>
                    </label>
                    <input
                      type="range"
                      value={guidanceScale}
                      onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                      min={1}
                      max={20}
                      step={0.5}
                      className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-lg appearance-none accent-primary-500"
                    />
                  </div>

                  {/* Seed */}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Seed (0 = random)</label>
                    <input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(Math.max(0, parseInt(e.target.value) || 0))}
                      className="input-field"
                      min={0}
                      max={2147483647}
                    />
                  </div>

                  {/* Number of Images */}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 flex items-center justify-between">
                      <span>Number of Images</span>
                      <span className="text-sm text-dark-500 dark:text-dark-400">{numImages}</span>
                    </label>
                    <input
                      type="range"
                      value={numImages}
                      onChange={(e) => setNumImages(parseInt(e.target.value))}
                      min={1}
                      max={4}
                      step={1}
                      className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-lg appearance-none accent-primary-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Thumbnails
                </>
              )}
            </button>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="card overflow-hidden">
              <div className="p-6 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white flex items-center gap-2">
                  <Image className="w-5 h-5 text-primary-500" />
                  Generated Thumbnails
                  {generatedImages.length > 0 && (
                    <span className="px-2 py-0.5 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
                      {generatedImages.length}
                    </span>
                  )}
                </h3>
                {generatedImages.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="btn-ghost text-sm px-3 py-1.5"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </button>
                )}
              </div>

              <div className="p-6">
                {generatedImages.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-dark-100 dark:bg-dark-800 flex items-center justify-center">
                      <Image className="w-12 h-12 text-dark-400 dark:text-dark-500" />
                    </div>
                    <h4 className="text-xl font-medium text-dark-900 dark:text-white mb-2">No thumbnails yet</h4>
                    <p className="text-dark-500 dark:text-dark-400 max-w-md mx-auto">
                      Enter a prompt and click "Generate Thumbnails" to create your first AI-generated thumbnail.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {generatedImages.map((image) => (
                      <div key={image.id} className="relative group rounded-xl overflow-hidden bg-dark-100 dark:bg-dark-800">
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={image.url}
                            alt={`Generated thumbnail: ${image.prompt.slice(0, 50)}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <div className="w-full text-white text-xs truncate">{image.prompt.slice(0, 60)}...</div>
                          </div>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs text-dark-500 dark:text-dark-400">
                            <span className="font-medium text-dark-700 dark:text-dark-300">{image.model}</span>
                            <span>{image.width}×{image.height}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownload(image)}
                              className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                            <button
                              onClick={() => handleCopy(image)}
                              className="btn-ghost text-sm py-2 px-3"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemove(image.id)}
                              className="btn-ghost text-sm py-2 px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThumbnailGenerator;