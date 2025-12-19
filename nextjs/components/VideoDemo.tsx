'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

interface VideoDemoData {
  id: number;
  title: string;
  description?: string;
  video_url: string;
  video_type: string;
  youtube_id?: string;
  thumbnail_url?: string;
  status: string;
  order: number;
}

interface VideoDemoProps {
  videoUrl?: string;
  title?: string;
  description?: string;
  videoType?: string;
  youtubeId?: string;
  videoData?: VideoDemoData;
}

export default function VideoDemo({ 
  videoUrl,
  title,
  description,
  videoType,
  youtubeId,
  videoData
}: VideoDemoProps) {
  // Use videoData if provided, otherwise use props
  const finalVideoUrl = videoData?.video_url || videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
  const finalTitle = videoData?.title || title || 'Demo sản phẩm BizGenie';
  const finalDescription = videoData?.description || description || 'Xem video demo để hiểu rõ hơn về các tính năng và cách sử dụng sản phẩm của chúng tôi';
  const finalVideoType = videoData?.video_type || videoType || 'url';
  const finalYoutubeId = videoData?.youtube_id || youtubeId;

  // Check if it's a YouTube Shorts video
  // YouTube Shorts URLs can be: youtube.com/shorts/VIDEO_ID or youtu.be/VIDEO_ID (but we detect by /shorts/ pattern)
  const isYouTubeShorts = finalVideoType === 'youtube' && finalYoutubeId && 
    (finalVideoUrl.toLowerCase().includes('/shorts/') || 
     finalVideoUrl.toLowerCase().includes('youtube.com/shorts'));
  const isYouTube = finalVideoType === 'youtube' && finalYoutubeId;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleRestart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <section className="min-h-screen bg-[#060909] text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-text">
            {finalTitle}
          </h1>
          {finalDescription && (
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              {finalDescription}
            </p>
          )}
        </div>

        {/* Video Player */}
        <div 
          className="relative bg-black rounded-xl overflow-hidden shadow-2xl mx-auto"
          style={{ maxWidth: isYouTubeShorts ? '400px' : '80rem' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setShowControls(true)}
        >
          {isYouTube ? (
            <div 
              className="relative w-full" 
              style={{ 
                paddingBottom: isYouTubeShorts ? '177.78%' : '56.25%' // 9:16 for Shorts, 16:9 for regular
              }}
            >
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${finalYoutubeId}?enablejsapi=1&rel=0`}
                title={finalTitle}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-auto"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              onClick={togglePlay}
            >
              <source src={finalVideoUrl} type="video/mp4" />
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          )}

          {/* Controls Overlay - Only for non-YouTube videos */}
          {!isYouTube && (
            <>
              <div
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={togglePlay}
              >
                {/* Center Play Button */}
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      className="w-20 h-20 bg-[#F66F00] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                    >
                      <Play className="w-10 h-10 text-[#060909] ml-1" fill="currentColor" />
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Controls Bar */}
              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 ${
                  showControls ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Progress Bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #F66F00 0%, #F66F00 ${(currentTime / duration) * 100}%, #4B5563 ${(currentTime / duration) * 100}%, #4B5563 100%)`
                    }}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlay}
                      className="text-white hover:text-[#F66F00] transition-colors"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" fill="currentColor" />
                      )}
                    </button>

                    {/* Restart */}
                    <button
                      onClick={handleRestart}
                      className="text-white hover:text-[#F66F00] transition-colors"
                      title="Phát lại từ đầu"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>

                    {/* Volume */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-[#F66F00] transition-colors"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #F66F00 0%, #F66F00 ${volume * 100}%, #4B5563 ${volume * 100}%, #4B5563 100%)`
                        }}
                      />
                    </div>

                    {/* Time Display */}
                    <span className="text-sm text-gray-300">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center space-x-4">
                    {/* Fullscreen */}
                    <button
                      onClick={handleFullscreen}
                      className="text-white hover:text-[#F66F00] transition-colors"
                      title="Toàn màn hình"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-12 max-w-3xl mx-auto">
          <div className="glass rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4 text-[#F66F00]">
              Về video demo này
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Video này sẽ giúp bạn hiểu rõ hơn về các tính năng và khả năng của sản phẩm BizGenie. 
              Chúng tôi sẽ hướng dẫn bạn từng bước cách sử dụng và tận dụng tối đa các công cụ AI 
              để nâng cao hiệu quả công việc của doanh nghiệp.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #F66F00;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #F66F00;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </section>
  );
}
