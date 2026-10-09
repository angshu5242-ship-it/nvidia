// NVIDIA API Service for Video and Image Generation
// Using OpenAI-compatible endpoints via Vite proxy to avoid CORS issues

const API_BASE_URL = '/api';
const API_KEY = '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';

// Default headers for all requests
const getHeaders = () => ({
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
});

// Handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `API Error: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

// Wrapper for fetch with better error handling
const fetchWithErrorHandling = async (url, options) => {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(
        'Network error: Unable to connect to NVIDIA API. This could be due to:\n' +
        '1. API key missing "Public API Endpoints" permission (enable at build.nvidia.com/settings/api-keys)\n' +
        '2. CORS restrictions from localhost\n' +
        '3. Network connectivity issues\n' +
        '4. API rate limiting'
      );
    }
    throw error;
  }
};

/**
 * Generate images using NVIDIA's image generation models
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - Text prompt for image generation
 * @param {string} [params.model='flux.1-dev'] - Model to use (flux.1-dev, flux.1-schnell, flux.1-kontext-dev, flux.2-klein-4b, stable-diffusion-3.5-large, qwen-image, qwen-image-2512)
 * @param {number} [params.width=1024] - Image width
 * @param {number} [params.height=1024] - Image height
 * @param {number} [params.steps=30] - Number of inference steps
 * @param {number} [params.guidance_scale=7.5] - Guidance scale
 * @param {number} [params.seed] - Random seed (0 for random)
 * @param {string} [params.negative_prompt] - Negative prompt
 * @param {number} [params.num_images=1] - Number of images to generate
 * @returns {Promise<Object>} Generated images response
 */
export const generateImage = async (params) => {
  const {
    prompt,
    model = 'flux.1-dev',
    width = 1024,
    height = 1024,
    steps = 30,
    guidance_scale = 7.5,
    seed = 0,
    negative_prompt = '',
    num_images = 1,
  } = params;

  const response = await fetchWithErrorHandling(`${API_BASE_URL}/images/generations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model,
      prompt,
      negative_prompt,
      width,
      height,
      steps,
      guidance_scale,
      seed,
      n: num_images,
      response_format: 'url',
    }),
  });

  return handleResponse(response);
};

/**
 * Generate video using NVIDIA's Wan2.2 model
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - Text prompt for video generation
 * @param {string} [params.model='wan-ai/wan2.2'] - Model to use
 * @param {string} [params.variant='t2v'] - Variant: 't2v' (text-to-video) or 'i2v' (image-to-video)
 * @param {string} [params.image] - Base64 encoded image for i2v variant
 * @param {number} [params.width=1280] - Video width
 * @param {number} [params.height=720] - Video height
 * @param {number} [params.num_frames=81] - Number of frames (max 201)
 * @param {number} [params.fps=16] - Frames per second
 * @param {number} [params.steps=30] - Number of inference steps
 * @param {number} [params.guidance_scale=7.5] - Guidance scale
 * @param {number} [params.seed] - Random seed (0 for random)
 * @returns {Promise<Object>} Generated video response
 */
export const generateVideo = async (params) => {
  const {
    prompt,
    model = 'wan-ai/wan2.2',
    variant = 't2v',
    image,
    width = 1280,
    height = 720,
    num_frames = 81,
    fps = 16,
    steps = 30,
    guidance_scale = 7.5,
    seed = 0,
  } = params;

  const body = {
    model,
    prompt,
    width,
    height,
    num_frames,
    fps,
    steps,
    guidance_scale,
    seed,
  };

  // For image-to-video, include the image
  if (variant === 'i2v' && image) {
    body.image = image;
  }

  const response = await fetchWithErrorHandling(`${API_BASE_URL}/video/generations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  return handleResponse(response);
};

/**
 * Check the status of a video generation task
 * @param {string} taskId - Task ID from video generation response
 * @returns {Promise<Object>} Task status
 */
export const checkVideoStatus = async (taskId) => {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/video/generations/${taskId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse(response);
};

/**
 * Poll for video generation completion
 * @param {string} taskId - Task ID
 * @param {Function} onProgress - Progress callback
 * @param {number} interval - Polling interval in ms
 * @returns {Promise<Object>} Final video result
 */
export const pollVideoGeneration = async (taskId, onProgress, interval = 5000) => {
  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const result = await checkVideoStatus(taskId);
        
        if (onProgress) {
          onProgress(result);
        }

        if (result.status === 'completed' || result.status === 'succeeded') {
          resolve(result);
        } else if (result.status === 'failed' || result.status === 'error') {
          reject(new Error(result.error || 'Video generation failed'));
        } else {
          // Still processing, poll again
          setTimeout(poll, interval);
        }
      } catch (error) {
        reject(error);
      }
    };

    poll();
  });
};

/**
 * Convert image file to base64
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 encoded image
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Download generated image/video
 * @param {string} url - Media URL
 * @param {string} filename - Filename for download
 */
export const downloadMedia = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
};

/**
 * Get available models
 * @returns {Promise<Object>} Available models
 */
export const getModels = async () => {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/models`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// Preset prompts for Hindi Kahani videos
export const HINDI_KAHANI_PRESETS = [
  {
    id: 'moral-story',
    title: 'Moral Story (नैतिक कहानी)',
    prompt: 'A heartwarming Hindi moral story animation, traditional Indian village setting, wise old grandfather telling story to children, animated 2D style, vibrant colors, cultural elements like diyas, rangoli, temples, peacocks, moral lesson about honesty and kindness, cinematic lighting, high quality',
    negative_prompt: 'modern buildings, cars, phones, western clothing, low quality, blurry, distorted',
  },
  {
    id: 'panchatantra',
    title: 'Panchatantra Tales (पंचतंत्र)',
    prompt: 'Classic Panchatantra story animation, talking animals in forest, lion and mouse, turtle and hare, monkey and crocodile, traditional Indian folk art style, Warli painting inspired, earthy colors, moral wisdom, storytelling atmosphere, magical realism',
    negative_prompt: 'modern elements, realistic photos, 3d render, low quality',
  },
  {
    id: 'akbar-birbal',
    title: 'Akbar-Birbal Stories (अकबर-बीरबल)',
    prompt: 'Mughal era court scene, Emperor Akbar and clever Birbal, witty dialogue visualization, royal palace architecture, intricate Mughal patterns, rich colors, gold accents, historical animation style, intellectual humor, wisdom',
    negative_prompt: 'modern setting, casual clothing, low quality, cartoon style',
  },
  {
    id: 'folk-tales',
    title: 'Indian Folk Tales (लोक कथाएं)',
    prompt: 'Traditional Indian folk tale animation, regional cultural elements, village life, festivals like Diwali Holi, traditional instruments, folk dance, mythological creatures, vibrant celebration, community storytelling, authentic cultural representation',
    negative_prompt: 'urban setting, modern technology, western culture, low quality',
  },
  {
    id: 'mythological',
    title: 'Mythological Stories (पौराणिक कथाएं)',
    prompt: 'Epic Indian mythology animation, gods and goddesses, Ramayana Mahabharata scenes, divine beings with aura, celestial backgrounds, traditional temple architecture, sacred symbols, Sanskrit shlokas visualization, devotional atmosphere, grand scale',
    negative_prompt: 'modern interpretation, disrespectful depiction, low quality, cartoon',
  },
];

// Preset prompts for thumbnails
export const THUMBNAIL_PRESETS = [
  {
    id: 'youtube-story',
    title: 'YouTube Story Thumbnail',
    prompt: 'Eye-catching YouTube thumbnail for Hindi story video, bold Hindi text "कहानी", dramatic lighting, expressive character face, vibrant gradient background, high contrast, click-worthy design, 16:9 aspect ratio, professional quality',
    negative_prompt: 'cluttered, low contrast, boring, amateur, watermark, text artifacts',
    width: 1280,
    height: 720,
  },
  {
    id: 'youtube-education',
    title: 'Educational Thumbnail',
    prompt: 'Educational YouTube thumbnail, clean modern design, Hindi title text, educational icons, books, lightbulb, gradient background, professional typography, trustworthy appearance, high CTR design',
    negative_prompt: 'messy, unprofessional, low quality, hard to read text',
    width: 1280,
    height: 720,
  },
  {
    id: 'instagram-reel',
    title: 'Instagram Reel Cover',
    prompt: 'Instagram Reel cover image, vertical 9:16, aesthetic Hindi story visual, minimal text, beautiful composition, trending style, vibrant colors, engaging visual hook, high quality',
    negative_prompt: 'horizontal, cluttered, low resolution, boring',
    width: 1080,
    height: 1920,
  },
  {
    id: 'facebook-video',
    title: 'Facebook Video Thumbnail',
    prompt: 'Facebook video thumbnail, square 1:1, engaging Hindi content preview, family-friendly, warm colors, expressive characters, clear focal point, social media optimized',
    negative_prompt: 'clickbait, misleading, low quality, offensive',
    width: 1080,
    height: 1080,
  },
];

// Video type presets
export const VIDEO_TYPE_PRESETS = [
  {
    id: 'hindi-kahani',
    title: 'Hindi Kahani (हिंदी कहानी)',
    description: 'Traditional Hindi storytelling videos',
    model: 'wan-ai/wan2.2',
    variant: 't2v',
    defaultParams: {
      width: 1280,
      height: 720,
      num_frames: 81,
      fps: 16,
      steps: 30,
      guidance_scale: 7.5,
    },
  },
  {
    id: 'educational',
    title: 'Educational Videos',
    description: 'Animated educational content in Hindi',
    model: 'wan-ai/wan2.2',
    variant: 't2v',
    defaultParams: {
      width: 1280,
      height: 720,
      num_frames: 100,
      fps: 16,
      steps: 35,
      guidance_scale: 8.0,
    },
  },
  {
    id: 'motivational',
    title: 'Motivational Shorts',
    description: 'Inspirational short videos for social media',
    model: 'wan-ai/wan2.2',
    variant: 't2v',
    defaultParams: {
      width: 1080,
      height: 1920,
      num_frames: 60,
      fps: 24,
      steps: 30,
      guidance_scale: 7.5,
    },
  },
  {
    id: 'image-to-video',
    title: 'Image to Video Animation',
    description: 'Animate your thumbnails into videos',
    model: 'wan-ai/wan2.2',
    variant: 'i2v',
    defaultParams: {
      width: 1280,
      height: 720,
      num_frames: 81,
      fps: 16,
      steps: 30,
      guidance_scale: 7.5,
    },
  },
  {
    id: 'music-visualization',
    title: 'Music Visualization',
    description: 'Abstract visual videos for music',
    model: 'wan-ai/wan2.2',
    variant: 't2v',
    defaultParams: {
      width: 1280,
      height: 720,
      num_frames: 120,
      fps: 24,
      steps: 40,
      guidance_scale: 7.0,
    },
  },
];

export default {
  generateImage,
  generateVideo,
  checkVideoStatus,
  pollVideoGeneration,
  fileToBase64,
  downloadMedia,
  getModels,
  HINDI_KAHANI_PRESETS,
  THUMBNAIL_PRESETS,
  VIDEO_TYPE_PRESETS,
};