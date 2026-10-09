import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Scissors, 
  Loader2, 
  Download, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Trash2, 
  Plus, 
  Minus,
  Clock,
  Film,
  Zap,
  Check,
  AlertCircle
} from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { useToast } from '../hooks/useToast';

const VideoClipExtractor = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [clips, setClips] = useState([]);
  const [isLoadingFFmpeg, setIsLoadingFFmpeg] = useState(false);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [selectedClip, setSelectedClip] = useState(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const videoRef = useRef(null);
  const ffmpegRef = useRef(null);
  const toast = useToast();

  // Initialize FFmpeg
  useEffect(() => {
    const initFFmpeg = async () => {
      setIsLoadingFFmpeg(true);
      try {
        const ffmpeg = new FFmpeg();
        // Load with core from unpkg
        await ffmpeg.load({
          corePath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
        });
        ffmpegRef.current = ffmpeg;
        setFfmpegReady(true);
        toast.success('FFmpeg loaded - ready to extract clips!');
      } catch (error) {
        console.error('FFmpeg load error:', error);
        toast.error('Failed to load video processor. Please refresh and try again.');
      } finally {
        setIsLoadingFFmpeg(false);
      }
    };
    initFFmpeg();

    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      clips.forEach(clip => URL.revokeObjectURL(clip.url));
    };
  }, [toast]);

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        toast.error('Video must be less than 500MB');
        return;
      }
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setClips([]); // Reset clips when new video uploaded
      toast.success(`Loaded: ${file.name} (${formatFileSize(file.size)})`);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const parseTimeInput = (timeStr) => {
    // Accept formats: "1:30", "1:30.5", "90", "90.5", "00:01:30"
    const parts = timeStr.split(':').map(parseFloat);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0];
  };

  const extractClip = async (clip) => {
    if (!ffmpegRef.current || !videoFile) return;

    const { start, end, name } = clip;
    const duration = end - start;
    const outputName = `${name.replace(/\s+/g, '_')}_${formatTime(start).replace(':', '-')}-${formatTime(end).replace(':', '-')}.mp4`;

    try {
      toast.loading(`Extracting clip: ${name}...`, 'extract');
      
      const ffmpeg = ffmpegRef.current;
      const inputName = 'input.mp4';
      
      // Write input file
      ffmpeg.writeFile(inputName, await fetchFile(videoFile));
      
      // Extract clip with re-encoding for accuracy
      await ffmpeg.exec([
        '-ss', start.toString(),
        '-t', duration.toString(),
        '-i', inputName,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'fast',
        '-crf', '23',
        '-avoid_negative_ts', 'make_zero',
        outputName
      ]);
      
      // Read output
      const data = ffmpeg.readFile(outputName);
      const blob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      // Update clip with download URL
      setClips(prev => prev.map(c => 
        c.id === clip.id ? { ...c, url, blob, size: blob.size, status: 'ready' } : c
      ));
      
      toast.success(`Clip "${name}" ready!`, 'extract');
    } catch (error) {
      console.error('Extract error:', error);
      toast.error(`Failed to extract "${name}": ${error.message}`, 'extract');
      setClips(prev => prev.map(c => 
        c.id === clip.id ? { ...c, status: 'error' } : c
      ));
    }
  };

  const addClip = () => {
    if (!videoFile) {
      toast.error('Please upload a video first');
      return;
    }
    if (!videoRef.current) return;
    
    const duration = videoRef.current.duration;
    const newClip = {
      id: Date.now(),
      name: `Clip ${clips.length + 1}`,
      start: 0,
      end: Math.min(30, duration), // Default 30 seconds
      duration: Math.min(30, duration),
      status: 'pending',
    };
    setClips(prev => [...prev, newClip]);
  };

  const addClipWithPreset = (preset) => {
    if (!videoFile || !videoRef.current) return;
    const duration = videoRef.current.duration;
    const newClip = {
      id: Date.now(),
      name: `${preset.platform} Clip ${clips.length + 1}`,
      start: 0,
      end: Math.min(preset.maxSec, duration),
      duration: Math.min(preset.maxSec, duration),
      status: 'pending',
    };
    setClips(prev => [...prev, newClip]);
    toast.success(`Added ${preset.platform} clip preset (${preset.maxSec}s max)`);
  };

  const updateClip = (id, updates) => {
    setClips(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates, duration: (updates.end ?? c.end) - (updates.start ?? c.start) } : c
    ));
  };

  const removeClip = (id) => {
    setClips(prev => {
      const clip = prev.find(c => c.id === id);
      if (clip?.url) URL.revokeObjectURL(clip.url);
      return prev.filter(c => c.id !== id);
    });
  };

  const downloadClip = (clip) => {
    if (!clip.blob) return;
    const a = document.createElement('a');
    a.href = clip.url;
    a.download = `${clip.name.replace(/\s+/g, '_')}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloaded: ${clip.name}`);
  };

  const downloadAllClips = async () => {
    for (const clip of clips) {
      if (clip.blob) downloadClip(clip);
      await new Promise(r => setTimeout(r, 500)); // Stagger downloads
    }
  };

  const presetDurations = [
    { label: '15s (Reels/Shorts)', seconds: 15 },
    { label: '30s', seconds: 30 },
    { label: '60s (Reels max)', seconds: 60 },
    { label: '90s (Shorts max)', seconds: 90 },
  ];

  if (!videoFile) {
    return (
      <section id="clip-extractor" className="py-20 lg:py-32 bg-dark-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-4">
              <Scissors className="w-4 h-4" />
              <span>Video Clip Extractor</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-dark-900 dark:text-white mb-4">
              Extract Clips for <span className="gradient-text">Short-Form Content</span>
            </h2>
            <p className="text-lg text-dark-600 dark:text-dark-300">
              Upload a long video and extract multiple clips for YouTube Shorts, TikTok, Instagram Reels, and more.
              Powered by FFmpeg.wasm - runs entirely in your browser.
            </p>
          </div>

          <div className="card p-12 max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Film className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-dark-900 dark:text-white mb-3">Upload Your Video</h3>
            <p className="text-dark-600 dark:text-dark-400 mb-6 max-w-md mx-auto">
              Supports MP4, MOV, WebM, AVI up to 500MB. Your video never leaves your browser.
            </p>
            <div className="border-2 border-dashed border-dark-300 dark:border-dark-600 rounded-xl p-8 hover:border-primary-400 transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload-extractor"
              />
              <label htmlFor="video-upload-extractor" className="cursor-pointer">
                <Film className="w-12 h-12 mx-auto text-dark-400 dark:text-dark-500 mb-3" />
                <p className="text-dark-600 dark:text-dark-400 mb-2">Drag & drop or click to browse</p>
                <p className="text-xs text-dark-400 dark:text-dark-500">MP4, MOV, WebM, AVI • Max 500MB</p>
              </label>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-dark-500 dark:text-dark-400">
              <span className="flex items-center gap-1"><Zap className="w-4 h-4" /> Client-side processing</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> No upload to servers</span>
              <span className="flex items-center gap-1"><Film className="w-4 h-4" /> FFmpeg.wasm powered</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="clip-extractor" className="py-20 lg:py-32 bg-white dark:bg-dark-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-dark-900 dark:text-white flex items-center gap-2">
              <Scissors className="w-8 h-8 text-green-500" />
              Video Clip Extractor
            </h2>
            <p className="text-dark-600 dark:text-dark-400 mt-1">
              {clips.length} clip{clips.length !== 1 ? 's' : ''} • {videoFile.name} ({formatFileSize(videoFile.size)})
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (videoUrl) URL.revokeObjectURL(videoUrl);
                clips.forEach(c => c.url && URL.revokeObjectURL(c.url));
                setVideoFile(null);
                setVideoUrl(null);
                setClips([]);
              }}
              className="btn-ghost text-sm"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              New Video
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Video Player & Controls */}
          <div className="lg:col-span-7 space-y-6">
            {/* Video Player */}
            <div className="card overflow-hidden">
              <div className="aspect-video relative bg-dark-900">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  controls
                  onTimeUpdate={() => {
                    if (selectedClip && videoRef.current) {
                      // Auto-update end time if playing past it
                    }
                  }}
                />
                {/* Clip range overlay */}
                {selectedClip && (
                  <div className="absolute inset-0 bg-black/30 pointer-events-none">
                    <div className="absolute left-0 right-0 top-0 bottom-0 bg-transparent" />
                    <div className="absolute top-2 left-2 right-2 flex justify-between">
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        {selectedClip.name}: {formatTime(selectedClip.start)} - {formatTime(selectedClip.end)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-dark-200 dark:border-dark-700">
                <div className="flex flex-wrap items-center gap-4 text-sm text-dark-600 dark:text-dark-400">
                  <span>Duration: <strong>{formatTime(videoRef.current?.duration || 0)}</strong></span>
                  <span>Resolution: <strong>{videoRef.current?.videoWidth}×{videoRef.current?.videoHeight}</strong></span>
                </div>
              </div>
            </div>

            {/* Clip List */}
            <div className="card">
              <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between">
                <h3 className="font-semibold text-dark-900 dark:text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-green-500" />
                  Clips ({clips.length})
                </h3>
                <button onClick={addClip} className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1">
                  <Plus className="w-4 h-4" />
                  Add Clip
                </button>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                {clips.length === 0 ? (
                  <div className="text-center py-8 text-dark-500 dark:text-dark-400">
                    <Plus className="w-12 h-12 mx-auto text-dark-300 dark:text-dark-600 mb-2" />
                    <p>No clips yet. Click "Add Clip" to create your first clip.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {clips.map((clip) => (
                      <div
                        key={clip.id}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedClip?.id === clip.id
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700'
                        }`}
                        onClick={() => setSelectedClip(selectedClip?.id === clip.id ? null : clip)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <input
                              type="text"
                              value={clip.name}
                              onChange={(e) => updateClip(clip.id, { name: e.target.value })}
                              className="bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 text-dark-900 dark:text-white font-medium"
                              placeholder="Clip name"
                            />
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-dark-500 dark:text-dark-400">
                                {formatTime(clip.start)} → {formatTime(clip.end)}
                              </span>
                              <span className="px-2 py-0.5 rounded text-xs font-medium
                                {clip.status === 'ready' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                                 clip.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}
                              ">
                                {clip.status}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {clip.status === 'ready' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); downloadClip(clip); }}
                                className="btn-ghost text-sm px-2 py-1"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            {clip.status === 'pending' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); extractClip(clip); }}
                                disabled={isLoadingFFmpeg}
                                className="btn-primary text-sm px-2 py-1"
                                title="Extract"
                              >
                                <Zap className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); removeClip(clip.id); }}
                              className="btn-ghost text-sm px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {/* Time controls */}
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          <div>
                            <label className="text-xs text-dark-500 dark:text-dark-400 block mb-1">Start</label>
                            <input
                              type="text"
                              value={formatTime(clip.start)}
                              onChange={(e) => updateClip(clip.id, { start: parseTimeInput(e.target.value) })}
                              className="input-field text-xs py-1"
                              placeholder="0:00"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-dark-500 dark:text-dark-400 block mb-1">End</label>
                            <input
                              type="text"
                              value={formatTime(clip.end)}
                              onChange={(e) => updateClip(clip.id, { end: parseTimeInput(e.target.value) })}
                              className="input-field text-xs py-1"
                              placeholder="0:30"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-dark-500 dark:text-dark-400 block mb-1">Duration</label>
                            <input
                              type="text"
                              value={formatTime(clip.duration)}
                              readOnly
                              className="input-field text-xs py-1 bg-dark-100 dark:bg-dark-800"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-dark-500 dark:text-dark-400 block mb-1">Presets</label>
                            <select
                              onChange={(e) => {
                                const sec = parseFloat(e.target.value);
                                updateClip(clip.id, { end: clip.start + sec });
                              }}
                              className="input-field text-xs py-1"
                              defaultValue=""
                            >
                              <option value="" disabled>Quick set duration</option>
                              {presetDurations.map(p => (
                                <option key={p.seconds} value={p.seconds}>{p.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-4">
              <h4 className="font-medium text-dark-900 dark:text-white mb-3">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                {clips.some(c => c.status === 'pending') && (
                  <button
                    onClick={() => clips.filter(c => c.status === 'pending').forEach(extractClip)}
                    disabled={isLoadingFFmpeg}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Extract All Pending
                  </button>
                )}
                {clips.some(c => c.status === 'ready') && (
                  <button
                    onClick={downloadAllClips}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download All Ready
                  </button>
                )}
                <button
                  onClick={addClip}
                  className="btn-ghost flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Clip
                </button>
              </div>
            </div>
          </div>

          {/* Side Panel - Presets & Tips */}
          <div className="lg:col-span-5 space-y-6">
            {/* Platform Presets */}
            <div className="card p-6">
              <h4 className="font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-500" />
                Platform Presets
              </h4>
              <div className="space-y-2">
                {[
                  { platform: 'YouTube Shorts', maxSec: 60, aspect: '9:16', color: 'red' },
                  { platform: 'TikTok', maxSec: 180, aspect: '9:16', color: 'pink' },
                  { platform: 'Instagram Reels', maxSec: 90, aspect: '9:16', color: 'purple' },
                  { platform: 'YouTube Shorts (15s)', maxSec: 15, aspect: '9:16', color: 'red' },
                ].map(p => (
                  <button
                    key={p.platform}
                    onClick={() => addClipWithPreset(p)}
                    className="w-full text-left p-3 rounded-xl border border-dark-200 dark:border-dark-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                  >
                    <div className="font-medium text-dark-900 dark:text-white">{p.platform}</div>
                    <div className="text-sm text-dark-500 dark:text-dark-400">
                      Max {p.maxSec}s • {p.aspect}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="card p-6">
              <h4 className="font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Tips for Best Results
              </h4>
              <ul className="space-y-2 text-sm text-dark-600 dark:text-dark-400">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Keep clips under 60s for Shorts/Reels</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Use 9:16 aspect ratio (portrait) for mobile</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Extract at key moments: hooks, punchlines, CTAs</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Processing happens locally - no uploads</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /> Longer videos take more time to process</li>
              </ul>
            </div>

            {/* Status */}
            {isLoadingFFmpeg && (
              <div className="card p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                  <div>
                    <div className="font-medium text-green-900 dark:text-green-100">Loading FFmpeg...</div>
                    <div className="text-sm text-green-700 dark:text-green-300">First run downloads ~25MB WASM</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoClipExtractor;