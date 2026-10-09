import { useState, useCallback, useEffect } from 'react';
import { Video, Play, Pause, Download, Copy, Check, AlertCircle, Loader2, Sparkles, BookOpen, Heart, Star, Settings, Trash2, Eye, Maximize2, RotateCcw } from 'lucide-react';
import { generateVideo, pollVideoGeneration, downloadMedia, HINDI_KAHANI_PRESETS, VIDEO_TYPE_PRESETS } from '../services/nvidiaApi';
import { useToast } from '../hooks/useToast';

const HindiKahaniGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
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

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    setPrompt(preset.prompt);
    setNegativePrompt(preset.negative_prompt || '');
    toast.success(`Applied preset: ${preset.title}`);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a story prompt');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress({ status: 'starting', message: 'Initializing video generation...' });

    try {
      const result = await generateVideo({
        prompt,
        negative_prompt: negativePrompt,
        model: 'wan-ai/wan2.2',
        variant: 't2v',
        width,
        height,
        num_frames: numFrames,
        fps,
        steps,
        guidance_scale: guidanceScale,
        seed: seed || undefined,
      });

      // Handle async video generation
      let videoData = null;
      
      if (result.id || result.task_id) {
        // Polling required
        const taskId = result.id || result.task_id;
        setGenerationProgress({ status: 'processing', message: 'Video is being generated...', progress: 0 });
        
        videoData = await pollVideoGeneration(taskId, (progress) => {
          if (progress.progress !== undefined) {
            setGenerationProgress({
              status: 'processing',
              message: `Generating video... ${Math.round(progress.progress)}%`,
              progress: progress.progress
            });
          } else if (progress.status) {
            setGenerationProgress({
              status: 'processing',
              message: `Status: ${progress.status}`,
            });
          }
        });
      } else if (result.video_url || result.url || result.data?.[0]?.url) {
        // Direct response
        videoData = {
          url: result.video_url || result.url || result.data?.[0]?.url,
          prompt,
          model: 'wan-ai/wan2.2',
          variant: 't2v',
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
          createdAt: new Date().toISOString(),
        };
        setGeneratedVideos(prev => [newVideo, ...prev].slice(0, 10));
        setGenerationProgress({ status: 'completed', message: 'Video generated successfully!', progress: 100 });
        toast.success('Hindi Kahani video generated successfully!');
      } else {
        throw new Error('No video URL in response');
      }
    } catch (error) {
      console.error('Video generation error:', error);
      setGenerationProgress({ status: 'error', message: error.message || 'Failed to generate video' });
      toast.error(error.message || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
      // Clear progress after delay
      setTimeout(() => setGenerationProgress(null), 3000);
    }
  };

  const handleDownload = async (video) => {
    try {
      await downloadMedia(video.url, `hindi-kahani-${video.id}.mp4`);
      toast.success('Video downloaded!');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleRemove = (id) => {
    setGeneratedVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleClearAll = () => {
    setGeneratedVideos([]);
    toast.success('Cleared all videos');
  };

  const formatDuration = (frames, fps) => {
    const seconds = frames / fps;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section id="hindi-kahani" className="py-20 lg:py-32 bg-dark-50 dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-4">
            <BookOpen className="w-4 h-4" />
            <span>Hindi Kahani Video Generator</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-dark-900 dark:text-white mb-4">
            Create Hindi Story Videos with <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Wan2.2</span>
          </h2>
          <p className="text-lg text-dark-600 dark:text-dark-300">
            Generate engaging Hindi storytelling videos - moral tales, Panchatantra, Akbar-Birbal, folk tales, and mythological stories.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Story Presets */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                Story Templates
              </h3>
              <div className="space-y-2">
                {HINDI_KAHANI_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedPreset === preset.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-dark-200 dark:border-dark-700 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <div className="font-medium text-dark-900 dark:text-white">{preset.title}</div>
                    <div className="text-xs text-dark-500 dark:text-dark-400 mt-1 line-clamp-2">{preset.prompt}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Your Story Prompt</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your Hindi story video... e.g., 'A wise old grandfather telling a moral story to children in a traditional Indian village, animated 2D style, warm colors, diyas and rangoli decorations, lesson about honesty'"
                className="input-field min-h-[140px] resize-y mb-4"
                rows={5}
              />
              <div className="flex items-center justify-between text-sm text-dark-500 dark:text-dark-400">
                <span>{prompt.length} characters</span>
                <span className={prompt.length < 50 ? 'text-orange-500' : 'text-green-500'}>
                  {prompt.length < 50 ? 'Add more detail for better results' : 'Good length'}
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
                placeholder="What to avoid... e.g., 'modern buildings, cars, phones, western clothing, low quality, blurry, distorted, scary'"
                className="input-field min-h-[80px] resize-y"
                rows={3}
              />
            </div>

            {/* Advanced Settings */}
            <div className="card p-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full font-medium text-dark-900 dark:text-white mb-4"
              >
                <span>Video Settings</span>
                <Settings className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              {showAdvanced && (
                <div className="space-y-4 animate-slide-down">
                  {/* Resolution */}
                  <div>
                    <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Resolution</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => { setWidth(1280); setHeight(720); }}
                        className={`p-3 rounded-lg text-center border-2 transition-all ${
                          width === 1280 ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-dark-200 dark:border-dark-700'
                        }`}
                      >
                        <div className="font-medium text-dark-900 dark:text-white">1280×720</div>
                        <div className="text-xs text-dark-500 dark:text-dark-400">Landscape (16:9)</div>
                      </button>
                      <button
                        onClick={() => { setWidth(720); setHeight(1280); }}
                        className={`p-3 rounded-lg text-center border-2 transition-all ${
                          width === 720 ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-dark-200 dark:border-dark-700'
                        }`}
                      >
                        <div className="font-medium text-dark-900 dark:text-white">720×1280</div>
                        <div className="text-xs text-dark-500 dark:text-dark-400">Portrait (9:16)</div>
                      </button>
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
                        className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-lg appearance-none accent-purple-500"
                      />
                      <p className="text-xs text-dark-500 dark:text-dark-400 mt-1">Max 201 frames (~12.5s at 16fps)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">FPS</label>
                      <select
                        value={fps}
                        onChange={(e) => setFps(parseInt(e.target.value))}
                        className="input-field"
                      >
                        <option value={8}>8 FPS (Slower)</option>
                        <option value={12}>12 FPS</option>
                        <option value={16}>16 FPS (Standard)</option>
                        <option value={24}>24 FPS (Smooth)</option>
                        <option value={30}>30 FPS</option>
                      </select>
                    </div>
                  </div>

                  {/* Steps & Guidance */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1 flex items-center justify-between">
                        <span>Inference Steps</span>
                        <span className="text-sm text-dark-500 dark:text-dark-400">{steps}</span>
                      </label>
                      <input
                        type="range"
                        value={steps}
                        onChange={(e) => setSteps(parseInt(e.target.value))}
                        min={15}
                        max={50}
                        step={1}
                        className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-lg appearance-none accent-purple-500"
                      />
                    </div>
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
                        max={15}
                        step={0.5}
                        className="w-full h-2 bg-dark-200 dark:bg-dark-700 rounded-lg appearance-none accent-purple-500"
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
              disabled={isGenerating || !prompt.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-6 py-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full flex items-center justify-center gap-2 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Video className="w-6 h-6" />
                  Generate Hindi Kahani Video
                </>
              )}
            </button>

            {/* Progress Indicator */}
            {generationProgress && (
              <div className="card p-4 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 animate-slide-down">
                <div className="flex items-center gap-3 mb-2">
                  {generationProgress.status === 'processing' && <Loader2 className="w-5 h-5 animate-spin text-purple-500" />}
                  {generationProgress.status === 'completed' && <Check className="w-5 h-5 text-green-500" />}
                  {generationProgress.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  <span className="font-medium text-purple-900 dark:text-purple-100">{generationProgress.message}</span>
                </div>
                {generationProgress.progress !== undefined && (
                  <div className="w-full h-2 bg-purple-100 dark:bg-purple-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
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
                  <Video className="w-5 h-5 text-purple-500" />
                  Generated Videos
                  {generatedVideos.length > 0 && (
                    <span className="px-2 py-0.5 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
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
                    <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Video className="w-12 h-12 text-purple-500" />
                    </div>
                    <h4 className="text-xl font-medium text-dark-900 dark:text-white mb-2">No videos yet</h4>
                    <p className="text-dark-500 dark:text-dark-400 max-w-md mx-auto mb-6">
                      Select a story template or write your own prompt, then click "Generate Hindi Kahani Video" to create your first AI storytelling video.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-dark-500 dark:text-dark-400">
                      <span className="flex items-center gap-1"><Heart className="w-4 h-4 text-red-500" /> Moral Stories</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-purple-500" /> Panchatantra</span>
                      <span className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> Akbar-Birbal</span>
                      <span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-pink-500" /> Mythological</span>
                    </div>
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
                            <div className="w-full text-white text-xs truncate">{video.prompt.slice(0, 80)}...</div>
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black/80 text-white text-xs px-2 py-1 rounded">
                              {formatDuration(video.num_frames || numFrames, video.fps || fps)}
                            </span>
                          </div>
                        </div>
                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs text-dark-500 dark:text-dark-400">
                            <span className="font-medium text-dark-700 dark:text-dark-300">Wan2.2 Text-to-Video</span>
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

export default HindiKahaniGenerator;