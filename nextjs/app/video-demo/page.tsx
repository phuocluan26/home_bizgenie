'use client';

import { useEffect, useState } from 'react';
import { Play } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoDemo from '@/components/VideoDemo';

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

export default function VideoDemoPage() {
  const [videoDemos, setVideoDemos] = useState<VideoDemoData[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoDemoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideoDemos();
  }, []);

  const fetchVideoDemos = async () => {
    try {
      const response = await fetch('/api/proxy/video-demos?status=published');
      const data = await response.json();
      const demos = data.data || [];
      setVideoDemos(demos);
      if (demos.length > 0) {
        setSelectedVideo(demos[0]);
      }
    } catch (error) {
      console.error('Error fetching video demos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#060909] text-white">
        <Navbar />
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F66F00]"></div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#060909] text-white">
      <Navbar />
      
      {selectedVideo ? (
        <VideoDemo videoData={selectedVideo} />
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-gray-400">Chưa có video demo nào</p>
        </div>
      )}

      {/* Video List */}
      {videoDemos.length > 1 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#0A0F0F]">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 glow-text text-center">
              Các video demo khác
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoDemos.map((demo) => (
                <div
                  key={demo.id}
                  onClick={() => {
                    setSelectedVideo(demo);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`glass rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-105 ${
                    selectedVideo?.id === demo.id ? 'ring-2 ring-[#F66F00]' : ''
                  }`}
                >
                  {demo.thumbnail_url ? (
                    <img
                      src={demo.thumbnail_url}
                      alt={demo.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-800 flex items-center justify-center">
                      <Play className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{demo.title}</h3>
                    {demo.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {demo.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
