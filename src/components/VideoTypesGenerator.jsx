import { useState, useCallback, useEffect } from 'react';
import { Video, Image, Zap, BookOpen, Music, GraduationCap, Target, Settings, Download, Copy, Trash2, Loader2, Sparkles, ArrowRight, RotateCcw, FileVideo } from 'lucide-react';
import { generateVideo, downloadMedia, VIDEO_TYPE_PRESETS } from '../services/nvidiaApi';
import { useToast } from '../hooks/useToast';

const VideoTypesGenerator = () => {
  const [selectedType, setSelectedType] = useState('hindi-kahani');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [numFrames, setNumFrames] = useState(81);
  const [fps, setFps] = useState(16);
  const [steps, setSteps] = useState(30);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [seed, setSeed] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(null);
  const toast = useToast();

  const currentType = VIDEO_TYPE_PRESETS.find(t => t.id === selectedType) || VIDEO_TYPE_PRESETS[0];

  // Update defaults when type changes
  useEffect(() => {
    const type = VIDEO_TYPE_PRESETS.find(t => t.id === selectedType);
    if (type) {
      setWidth(type.defaultParams.width);
      setHeight(type.defaultParams.height);
      setNumFrames(type.defaultParams.num_frames);
      setFps(type.defaultParams.fps);
      setSteps(type.defaultParams.steps);
      setGuidanceScale(type.defaultParams.guidance_scale);
      setImageFile(null);
      setImagePreview(null);
    }
  }, [selectedType]);

  const handleGenerate = async () => {
    if (selectedType === 'image-to-video' && !imageFile) {
      toast.error('Please upload an image for image-to-video generation');
      return;
    }
    if (selectedType !== 'image-to-video' && !prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress({ status: 'starting', message: 'Initializing...' });

    try {
      let base64Image = null;
      if (imageFile) {
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      }

      const result = await generateVideo({
        prompt: prompt || 'Animate this image smoothly',
        negative_prompt: negativePrompt,
        model: currentType.model,
        variant: currentType.variant,
        image: base64Image,
        width,
        height,
        num_frames: numFrames,
        fps,
        steps,
        guidance_scale: guidanceScale,
        seed: seed || undefined,
      });

      let videoData = null;
      
      if (result.id || result.task_id) {
        const taskId = result.id || result.task_id;
        setGenerationProgress({ status: 'processing', message: 'Generating video...', progress: 0 });
        
        // Import pollVideoGeneration dynamically
        const { pollVideoGeneration } = await import('../services/nvidiaApi');
        videoData = await pollVideoGeneration(taskId, (progress) => {
          if (progress.progress !== undefined) {
            setGenerationProgress({
              status: 'processing',
              message: `Generating... ${Math.round(progress.progress)}%`,
              progress: progress.progress
            });
          }
        });
      } else if (result.video_url || result.url || result.data?.[0]?.url) {
        videoData = {
          url: result.video_url || result.url || result.data?.[0]?.url,
          prompt: prompt || 'Image to video',
          model: currentType.model,
          variant: currentType.variant,
          width,
          height,
          num_frames: numFrames,
          fps,
          seed: seed || Date.now(),
        };
      }

      if (videoData?.url) {
        const newVideo = {
          ...videoData,
          id: Date.now(),
          type: selectedType,
          createdAt: new Date().toISOString(),
        };
        setGeneratedVideos(prev => [newVideo, ...prev].slice(0, 10));
        setGenerationProgress({ status: 'completed', message: 'Video generated!', progress: 100 });
        toast.success(`${currentType.title} generated successfully!`);
      } else {
        throw new Error('No video URL in response');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationProgress({ status: 'error', message: error.message });
      toast.error(error.message || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(null), 3000);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image must be less than 10MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      toast.success('Image uploaded successfully');
    }
  };

  const handleDownload = async (video) => {
    try {
      await downloadMedia(video.url, `${video.type}-${video.id}.mp4`);
      toast.success('Downloaded!');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleRemove = (id) => {
    setGeneratedVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleClearAll = () => {
    setGeneratedVideos([]);
    toast.success('Cleared all');
  };

  const formatDuration = (frames, fps) => {
    const seconds = frames / fps;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const typeIcons = {
    'hindi-kahani': BookOpen,
    'educational': GraduationCap,
    'motivational': Target,
    'image-to-video': RotateCcw,
    'music-visualization': Music,
  };

  const TypeIcon = typeIcons[selectedType] || Video;

  return (
    <section id="video-types" className="py-20 lg:py-32 bg-white dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            <span>Video Types</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-dark-900 dark:text-white mb-4">
            Multiple Video Types with <span className="gradient-text">Wan2.2</span>
          </h2>
          <p className="text-lg text-dark-600 dark:text-dark-300">
            Choose from various video generation modes - text-to-video, image-to-video, and specialized types for different content needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Video Type Selector */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Select Video Type</h3>
              <div className="space-y-2">
                {VIDEO_TYPE_PRESETS.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      selectedType === type.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      selectedType === type.id 
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                        : 'bg-dark-100 dark:bg-dark-800 text-dark-500 dark:text-dark-400'
                    }`}>
                      <TypeIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-dark-900 dark:text-white truncate">{type.title}</div>
                      <div className="text-sm text-dark-500 dark:text-dark-400 truncate">{type.description}</div>
                    </div>
                    {selectedType === type.id && (
                      <Sparkles className="w-5 h-5 text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="card p-6">
              {selectedType === 'image-to-video' ? (
                // Image Upload for I2V
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">Upload Image to Animate</h3>
                  <div className="border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    {imagePreview ? (
                      <div className="relative max-w-xs mx-auto">
                        <img src={imagePreview} alt="Preview" className="rounded-lg max-h-64 w-auto mx-auto" />
                        <button
                          onClick={() => { setImageFile(null); setImagePreview(null); }}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Image className="w-12 h-12 mx-auto text-dark-400 dark:text-dark-500 mb-3" />
                        <p className="text-dark-600 dark:text-dark-400 mb-2">Drag & drop an image or click to browse</p>
                        <label htmlFor="image-upload" className="btn-primary inline-flex items-center gap-2 cursor-pointer">
                          <ArrowRight className="w-4 h-4" />
                          Choose Image
                        </label>
                        <p className="text-xs text-dark-400 dark:text-dark-500 mt-2">PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>
                  {imagePreview && (
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Animation Prompt (Optional)</label>
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe how you want the image to animate... e.g., 'Camera slowly zooms in, subtle particle effects, cinematic lighting'"
                        className="input-field min-h-[80px] resize-y"
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              ) : (
                // Text Prompt for T2V
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-2">Video Prompt</h3>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`Describe your ${currentType.title.toLowerCase()}...`}
                    className="input-field min-h-[120px] resize-y"
                    rows={4}
                  />
                  <div className="text-sm text-dark-500 dark:text-dark-400">{prompt.length} characters</div>
                </div>
              )}

              {/* Negative Prompt */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Negative Prompt (Optional)</label>
                <textarea
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  placeholder="What to avoid..."
                  className="input-field min-h-[60px] resize-y"
                  rows={2}
                />
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
                  {/* Resolution Presets */}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Quick Resolutions</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { w: 1280, h: 720, label: '16:9 HD' },
                        { w: 1920, h: 1080, label: '16:9 Full HD' },
                        { w: 720, h: 1280, label: '9:16 Shorts' },
                        { w: 1080, h: 1920, label: '9:16 Reels' },
                        { w: 1080, h: 1080, label: '1:1 Square' },
                        { w: 1280, h: 720, label: 'Custom' },
                      ].map((r) => (
                        <button
                          key={`${r.w}x${r.h}`}
                          onClick={() => { setWidth(r.w); setHeight(r.h); }}
                          className={`p-2 rounded-lg text-xs font-medium transition-all ${
                            width === r.w && height === r.h
                              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-300 dark:border-primary-700'
                              : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-300 hover:bg-dark-200 dark:hover:bg-dark-700'
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Dimensions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Width</label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(Math.min(1920, Math.max(256, parseInt(e.target.value) || 256)))}
                        className="input-field"
                        min={256}
                        max={1920}
                        step={16}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Height</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Math.min(1920, Math.max(256, parseInt(e.target.value) || 256)))}
                        className="input-field"
                        min={256}
                        max={1920}
                        step={16}
                      />
                    </div>
                  </div>

                  {/* Frames & FPS */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 flex items-center justify-between">
                        <span>Frames</span>
                        <span className="text-sm text-dark-500 dark:text-dark-400">{numFrames} (~{formatDuration(numFrames, fps)})</span>
                      </label>
                      <input
                        type="range"
                        value={numFrames}
                        onChange={(e) => setNumFrames(Math.min(201, Math.max(16, parseInt(e.target.value) || 16)))}
                        min={16}
                        max={201}
                        step={1}
                        className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-lg appearance-none accent-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">FPS</label>
                      <select
                        value={fps}
                        onChange={(e) => setFps(parseInt(e.target.value))}
                        className="input-field"
                      >
                        <option value={8}>8 FPS</option>
                        <option value={12}>12 FPS</option>
                        <option value={16}>16 FPS</option>
                        <option value={24}>24 FPS</option>
                        <option value={30}>30 FPS</option>
                      </select>
                    </div>
                  </div>

                  {/* Steps & Guidance */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 flex items-center justify-between">
                        <span>Steps</span>
                        <span className="text-sm text-dark-500 dark:text-dark-400">{steps}</span>
                      </label>
                      <input
                        type="range"
                        value={steps}
                        onChange={(e) => setSteps(parseInt(e.target.value))}
                        min={15}
                        max={50}
                        step={1}
                        className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-lg appearance-none accent-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 flex items-center justify-between">
                        <span>Guidance</span>
                        <span className="text-sm text-dark-500 dark:text-dark-400">{guidanceScale}</span>
                      </label>
                      <input
                        type="range"
                        value={guidanceScale}
                        onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                        min={1}
                        max={15}
                        step={0.5}
                        className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-lg appearance-none accent-primary-500"
                      />
                    </div>
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
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (selectedType === 'image-to-video' ? !imageFile : !prompt.trim())}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium px-6 py-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full flex items-center justify-center gap-2 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Video className="w-6 h-6" />
                  Generate {currentType.title}
                </>
              )}
            </button>

            {/* Progress */}
            {generationProgress && (
              <div className="card p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 animate-slide-down">
                <div className="flex items-center gap-3 mb-2">
                  {generationProgress.status === 'processing' && <Loader2 className="w-5 h-5 animate-spin text-orange-500" />}
                  {generationProgress.status === 'completed' && <Check className="w-5 h-5 text-green-500" />}
                  {generationProgress.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  <span className="font-medium text-orange-900 dark:text-orange-100">{generationProgress.message}</span>
                </div>
                {generationProgress.progress !== undefined && (
                  <div className="w-full h-2 bg-orange-100 dark:bg-orange-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress.progress}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="card overflow-hidden">
              <div className="p-6 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white flex items-center gap-2">
                  <FileVideo className="w-5 h-5 text-orange-500" />
                  Generated Videos
                  {generatedVideos.length > 0 && (
                    <span className="px-2 py-0.5 text-sm bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                      {generatedVideos.length}
                    </span>
                  )}
                </h3>
                {generatedVideos.length > 0 && (
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
                {generatedVideos.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                      <Video className="w-12 h-12 text-orange-500" />
                    </div>
                    <h4 className="text-xl font-medium text-dark-900 dark:text-white mb-2">No videos yet</h4>
                    <p className="text-dark-500 dark:text-dark-400 max-w-md mx-auto">
                      Select a video type, configure your settings, and click Generate to create AI videos.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedVideos.map((video) => (
                      <div key={video.id} className="relative group rounded-xl overflow-hidden bg-dark-100 dark:bg-dark-800">
                        <div className="aspect-video relative overflow-hidden">
                          <video
                            src={video.url}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                            playsInline
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <div className="w-full text-white text-xs truncate">
                              {video.type === 'image-to-video' ? 'Image to Video Animation' : video.prompt.slice(0, 80)}...
                            </div>
                          </div>
                          <div className="absolute top-2 left-2">
                            <span className="bg-black/80 text-white text-xs px-2 py-1 rounded capitalize">
                              {video.type.replace('-', ' ')}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black/80 text-white text-xs px-2 py-1 rounded">
                              {formatDuration(video.num_frames || numFrames, video.fps || fps)}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs text-dark-500 dark:text-dark-400">
                            <span className="font-medium text-dark-700 dark:text-dark-300">
                              {video.variant === 'i2v' ? 'Image-to-Video' : 'Text-to-Video'}
                            </span>
                            <span>{video.width}×{video.height}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownload(video)}
                              className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center gap-1"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                            <button
                              onClick={() => handleRemove(video.id)}
                              className="btn-ghost text-sm py-2 px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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

export default VideoTypesGenerator;