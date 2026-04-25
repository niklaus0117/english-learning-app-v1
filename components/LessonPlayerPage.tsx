
import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Icons } from './Icons';
import { MOCK_LESSON_TRANSCRIPT } from '../constants';
import { Lesson } from '../types';
import { DictionaryModal } from './DictionaryModal';
import { SentenceAnalysisModal } from './SentenceAnalysisModal';
import { NotesTab } from './NotesTab';
import WordTrainingPanel from './WordTrainingPanel';

interface LessonPlayerPageProps {
  lesson: Lesson;
  onBack: () => void;
}

const LessonPlayerPage: React.FC<LessonPlayerPageProps> = ({ lesson, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSentenceId, setActiveSentenceId] = useState<string>('s1');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showChinese, setShowChinese] = useState(true);
  const [playMode, setPlayMode] = useState<'order' | 'repeat' | 'single'>('order');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(38); // Default mock duration
  const [showOverlayControls, setShowOverlayControls] = useState(true);
  
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showPlayModeMenu, setShowPlayModeMenu] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  // New states for dictionary and sentence analysis
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [analyzedSentence, setAnalyzedSentence] = useState<{english: string, chinese: string} | null>(null);
  const [showWordTraining, setShowWordTraining] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Tabs at the top
  const [activeTab, setActiveTab] = useState('原文');
  const [isTabsVisible, setIsTabsVisible] = useState(true);
  const lastScrollY = useRef(0);

  const isVideo = lesson.mediaType === 'video';

  // Make sure tabs are visible when switching
  useEffect(() => {
      setIsTabsVisible(true);
  }, [activeTab]);

  // --- External Click Handlers ---
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        // Close if not clicking inside the menu containers
        if (!target.closest('.speed-menu-container')) {
            setShowSpeedMenu(false);
        }
        if (!target.closest('.playmode-menu-container')) {
            setShowPlayModeMenu(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Auto hide overlay controls logic ---
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isPlaying && showOverlayControls) {
      timeout = setTimeout(() => setShowOverlayControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying, showOverlayControls]);

  // Handle Play/Pause
  const togglePlay = () => {
    const mediaElement = isVideo ? videoRef.current : audioRef.current;
    if (mediaElement) {
      if (isPlaying) {
        mediaElement.pause();
      } else {
        mediaElement.play().catch(e => console.error("Playback failed", e));
      }
    } else if (!isVideo) {
        // Fallback mock simulation if no real media URL
        setIsPlaying(!isPlaying);
    }
  };

  const handleSeekRelative = (e: React.MouseEvent, delta: number) => {
      e.stopPropagation();
      const newTime = Math.max(0, Math.min(duration, currentTime + delta));
      setCurrentTime(newTime);
      const mediaElement = isVideo ? videoRef.current : audioRef.current;
      if (mediaElement) {
          mediaElement.currentTime = newTime;
      }
      setShowOverlayControls(true); // Keep controls open when interacting
  };

  // Sync state with media element
  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    const time = e.currentTarget.currentTime;
    setCurrentTime(time);
    
    // Sync transcript
    const currentSentence = MOCK_LESSON_TRANSCRIPT.find(
        s => time >= s.startTime && time < (s.startTime + s.duration)
    );
    if (currentSentence && currentSentence.id !== activeSentenceId) {
        setActiveSentenceId(currentSentence.id);
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLMediaElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Scroll active sentence into view
  useEffect(() => {
    if (activeSentenceId) {
        const el = document.getElementById(`sentence-${activeSentenceId}`);
        if (el) {
            const isFirstSentence = activeSentenceId === MOCK_LESSON_TRANSCRIPT[0]?.id;
            
            if (isPlaying && !isFirstSentence) {
                // Determine we are auto-playing and past first sentence
                setIsTabsVisible(false);
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
  }, [activeSentenceId, isPlaying]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const currentScrollY = e.currentTarget.scrollTop;
      
      // The first sentence is below the title and AI banner.
      // We check if the scroll position is revealing the first sentence.
      const firstSentenceId = MOCK_LESSON_TRANSCRIPT[0]?.id;
      const firstSentenceEl = firstSentenceId ? document.getElementById(`sentence-${firstSentenceId}`) : null;
      const threshold = firstSentenceEl ? firstSentenceEl.offsetTop + 5 : 120;
      
      // Manual scroll detection
      if (currentScrollY <= threshold) {
          // The first sentence is fully visible. MUST show.
          setIsTabsVisible(true);
          lastScrollY.current = currentScrollY;
          return;
      }

      const delta = currentScrollY - lastScrollY.current;
      
      if (delta > 10) {
          // User scrolling down the article (moving content up)
          setIsTabsVisible(false);
          lastScrollY.current = currentScrollY;
      } else if (delta < -15) {
          // User scrolling up the article (moving content down / pulling down)
          setIsTabsVisible(true);
          lastScrollY.current = currentScrollY;
      }
  };

  // Simulation of audio playback (fallback if no mediaUrl)
  useEffect(() => {
    if (lesson.mediaUrl) return; // Skip simulation if we have real media

    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime(prev => {
           if (prev >= duration) {
               setIsPlaying(false);
               return 0;
           }
           const newTime = prev + 0.1;
           
           const currentSentence = MOCK_LESSON_TRANSCRIPT.find(
               s => newTime >= s.startTime && newTime < (s.startTime + s.duration)
           );
           if (currentSentence && currentSentence.id !== activeSentenceId) {
               setActiveSentenceId(currentSentence.id);
           }
           
           return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeSentenceId, duration, lesson.mediaUrl]);

  // Handle speed change
  useEffect(() => {
    const mediaElement = isVideo ? videoRef.current : audioRef.current;
    if (mediaElement) {
      mediaElement.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, isVideo]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSentenceClick = (id: string, startTime: number) => {
      setActiveSentenceId(id);
      setCurrentTime(startTime);
      const mediaElement = isVideo ? videoRef.current : audioRef.current;
      if (mediaElement) {
          mediaElement.currentTime = startTime;
          mediaElement.play().catch(e => console.error(e));
      } else {
          setIsPlaying(true);
      }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const newTime = percentage * duration;
      
      setCurrentTime(newTime);
      const mediaElement = isVideo ? videoRef.current : audioRef.current;
      if (mediaElement) {
          mediaElement.currentTime = newTime;
      }
  };

  return (
    <div className="flex flex-col h-screen bg-white relative overflow-hidden">
      
      {/* --- Media Player Area (Top) --- */}
      {isVideo && lesson.mediaUrl ? (
          <div 
            className="w-full bg-black relative z-10 flex-shrink-0 group overflow-hidden" 
            style={{ aspectRatio: '16/9' }}
            onMouseMove={() => setShowOverlayControls(true)}
            onTouchStart={() => setShowOverlayControls(true)}
          >
              <video 
                  ref={videoRef}
                  src={lesson.mediaUrl}
                  poster={lesson.coverUrl}
                  className="absolute inset-0 w-full h-full object-contain cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setShowOverlayControls(true); }}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleEnded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={(e) => console.error("Video error:", e.currentTarget.error)}
                  playsInline
              />

              {/* OVERLAY WRAPPER */}
              <div 
                className={`absolute inset-0 z-20 pointer-events-none transition-opacity duration-300 ${(!isPlaying || showOverlayControls) ? 'opacity-100' : 'opacity-0'}`}
              >
                  {/* Top Overlaid Header */}
                  <div className="absolute top-0 left-0 right-0 p-3 pb-6 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between pointer-events-auto">
                    <button onClick={onBack} className="p-1 text-white active:scale-95 -ml-1">
                      <ChevronLeft size={24} />
                    </button>
                    {/* Top right buttons removed per requirement */}
                  </div>

                  {/* Bottom Overlay Controls (Play, Skip, Progress) */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 pt-10 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto flex items-center gap-3">
                      {/* Left Controls */}
                      <div className="flex items-center gap-4 translate-y-[-1px]">
                          <button 
                            onClick={(e) => handleSeekRelative(e, -10)} 
                            className="text-white active:scale-95 transition-transform"
                          >
                             <Icons.SkipBack size={20} className="fill-white" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowOverlayControls(true); togglePlay(); }}
                            className="text-white active:scale-95 transition-transform"
                          >
                              {isPlaying ? (
                                  <Icons.Pause size={20} className="fill-white" />
                              ) : (
                                  <Icons.Play size={20} className="fill-white" />
                              )}
                          </button>
                          <button 
                            onClick={(e) => handleSeekRelative(e, 10)} 
                            className="text-white active:scale-95 transition-transform"
                          >
                             <Icons.SkipForward size={20} className="fill-white" />
                          </button>
                      </div>

                      {/* Progress Bar Area */}
                      <div className="flex-1 flex items-center gap-2.5">
                          <span className="text-white/90 text-[11px] font-mono font-medium">
                            {formatTime(currentTime)}
                          </span>
                          <div 
                            className="flex-1 h-[2px] bg-white/30 rounded-full relative cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); setShowOverlayControls(true); handleSeek(e); }}
                          >
                              <div 
                                className="absolute top-0 left-0 h-full bg-white rounded-full" 
                                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                              ></div>
                              <div 
                                className="absolute top-1/2 -mt-[3px] h-[6px] w-[6px] bg-white rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)] transform -translate-x-1/2"
                                style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                              ></div>
                          </div>
                          <span className="text-white/90 text-[11px] font-mono font-medium">
                            {formatTime(duration)}
                          </span>
                      </div>

                      {/* Right Fullscreen Icon */}
                      <button 
                        className="text-white active:scale-95"
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (document.fullscreenElement) {
                            await document.exitFullscreen().catch(err => console.log(err));
                          } else {
                            if (videoRef.current) {
                              try {
                                await videoRef.current.requestFullscreen();
                                // Attempt to lock to landscape on mobile devices
                                if (screen.orientation && screen.orientation.lock) {
                                  await screen.orientation.lock('landscape').catch(() => {
                                      // Ignore error if locking is not supported or permitted
                                  });
                                }
                              } catch (err) {
                                console.error("Error attempting to enable fullscreen:", err);
                              }
                            }
                          }
                        }}
                      >
                          <Icons.Maximize size={16} />
                      </button>
                  </div>
              </div>
          </div>
      ) : (
          <div className="w-full relative z-10 flex-shrink-0 bg-white">
              {/* Normal Header for Audio/No-video */}
              <div className="px-3 py-3 flex items-center justify-between border-b border-gray-100">
                <button onClick={onBack} className="p-1 text-gray-800 active:scale-95 -ml-1">
                  <ChevronLeft size={24} />
                </button>
                <h1 className="text-gray-900 text-sm font-medium truncate flex-1 px-4 text-center">
                   Saturn | A Travellers Guide To The Planet
                </h1>
                <button className="p-1 text-gray-800 active:scale-95">
                  <Icons.MoreHorizontal size={20} />
                </button>
              </div>
              
              {lesson.mediaUrl && (
                  <audio 
                      ref={audioRef}
                      src={lesson.mediaUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={handleEnded}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onError={(e) => console.error("Audio error:", e.currentTarget.error)}
                  />
              )}
          </div>
      )}

      {/* --- Content Area --- */}
      <div className="flex-1 bg-white flex flex-col min-h-0 relative z-0">
          
          {/* --- Tabs --- */}
          <div className={`flex-shrink-0 z-10 bg-white transition-all duration-300 overflow-hidden ${isTabsVisible ? 'h-[38px] opacity-100 border-b border-gray-100' : 'h-0 opacity-0 border-transparent'} shadow-[0_2px_10px_rgba(0,0,0,0.02)]`}>
              <div className="flex items-center px-4 justify-between h-[38px]">
                  <div className="flex space-x-5 h-full">
                      <div className="relative flex flex-col items-center justify-center">
                          <button onClick={() => setActiveTab('原文')} className={`font-bold text-[14px] ${activeTab === '原文' ? 'text-[#0066FF]' : 'text-gray-400'}`}>原文</button>
                          {activeTab === '原文' && <div className="absolute bottom-[2px] w-5 h-[2.5px] bg-[#0066FF] rounded-full"></div>}
                      </div>
                      <div className="relative flex flex-col items-center justify-center">
                          <button onClick={() => setActiveTab('笔记')} className={`font-bold text-[14px] ${activeTab === '笔记' ? 'text-[#0066FF]' : 'text-gray-400'}`}>笔记</button>
                          {activeTab === '笔记' && <div className="absolute bottom-[2px] w-5 h-[2.5px] bg-[#0066FF] rounded-full"></div>}
                      </div>
                  </div>
                  <div className="flex items-center text-[12px] text-gray-400">
                      <span className="truncate max-w-[120px]">{lesson.title.split(' ')[1] || lesson.title}</span>
                      <Icons.ChevronRight size={14} className="ml-1" />
                  </div>
              </div>
          </div>

          {activeTab === '笔记' ? (
              <NotesTab />
          ) : (
              <div 
                  className="flex-1 px-4 py-4 pb-[180px] no-scrollbar overflow-y-auto scroll-pt-4 scroll-smooth relative"
                  onScroll={handleScroll}
              >
                  {/* Title */}
                  <h2 className="text-[17px] font-bold text-[#2A2A2A] leading-[1.3] mb-2 font-serif">
                      Saturn | A Travellers Guide To The Planet
                  </h2>

                  {/* AI Banner */}
                  <div className="bg-[#FFF9EE] rounded flex items-center px-3 py-2 mb-4">
                      <Icons.Bot size={16} className="text-[#F2994A] mr-2" />
                      <span className="text-[#F2994A] text-[12px] font-medium tracking-wide">当前字幕由 AI 自动生成，仅供参考</span>
                  </div>

                  {/* Sentences */}
                  <div className="space-y-5">
                      {MOCK_LESSON_TRANSCRIPT.map((sentence) => {
                          const isActive = activeSentenceId === sentence.id;
                          return (
                              <div 
                                  key={sentence.id}
                                  id={`sentence-${sentence.id}`}
                                  onClick={() => handleSentenceClick(sentence.id, sentence.startTime)}
                                  className={`transition-colors duration-300 rounded cursor-pointer ${isActive ? 'bg-[#F2F7FF] -mx-2 px-2 py-2' : 'bg-transparent py-1'}`}
                              >
                                  {/* English */}
                                  <div className={`text-[16px] leading-[1.5] mb-1 font-serif ${isActive ? 'text-[#5C6BFA]' : 'text-[#333]'}`}>
                                      {sentence.text.split(' ').map((word, i) => (
                                          <span 
                                              key={i} 
                                              onDoubleClick={(e) => { 
                                                e.stopPropagation(); 
                                                setSelectedWord(word);
                                                if (isVideo && videoRef.current) videoRef.current.pause();
                                                if (!isVideo && audioRef.current) audioRef.current.pause();
                                                setIsPlaying(false);
                                              }}
                                              className="cursor-pointer active:bg-black/5 md:hover:bg-black/5 rounded transition-colors"
                                          >
                                              {word}{' '}
                                          </span>
                                      ))}
                                      <button 
                                          onClick={(e) => { 
                                              e.stopPropagation(); 
                                              setAnalyzedSentence({english: sentence.text, chinese: sentence.translation}); 
                                              if (isVideo && videoRef.current) videoRef.current.pause();
                                              if (!isVideo && audioRef.current) audioRef.current.pause();
                                              setIsPlaying(false);
                                          }}
                                          className="ml-2 inline-flex items-center justify-center -translate-y-[2px] active:scale-90 transition-transform p-1 bg-gray-50 rounded"
                                      >
                                          <Icons.Sparkles size={14} className={isActive ? "text-[#5C6BFA]" : "text-gray-400"} />
                                      </button>
                                  </div>
                                  
                                  {/* Chinese */}
                                  <div className={`text-[13px] font-serif tracking-wide ${isActive ? 'text-[#5C6BFA]/80' : 'text-[#888]'}`}>
                                      {sentence.translation}
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}
      </div>

      {/* --- Fixed Bottom Controls --- */}
      <div className="absolute bottom-0 left-0 right-0 bg-white z-30 flex flex-col pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.02)] transition-all duration-300 rounded-t-2xl">
          
          {/* Row 1: Tools */}
          <div className={`transition-all duration-300 ${isBottomCollapsed ? 'h-0 opacity-0 overflow-hidden' : 'h-[60px] opacity-100 overflow-visible'}`}>
              <div className="flex justify-between items-center pt-3 pb-1 px-8 relative h-full">
                  {/* Speed */}
                  <div className="relative speed-menu-container">
                      <button 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="flex flex-col items-center gap-1 text-gray-500 active:scale-95 transition-transform"
                      >
                          <span className="font-bold text-[13px] text-[#333] tracking-tight mb-[1px]">{playbackSpeed.toFixed(1)}x</span>
                          <span className="text-[9px] text-gray-500">倍速</span>
                      </button>

                      {/* Speed Popup Menu */}
                      {showSpeedMenu && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-[0_5px_25px_rgba(0,0,0,0.15)] py-2 w-[80px] overflow-hidden z-50">
                              <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100/50"></div>
                              <div className="relative z-10 bg-white">
                                  {[0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8, 2.0].map((speed) => (
                                      <button 
                                          key={speed}
                                          onClick={() => { setPlaybackSpeed(speed); setShowSpeedMenu(false); }}
                                          className="w-full flex items-center justify-between px-3 py-2 text-[14px] active:bg-gray-50 transition-colors"
                                      >
                                          <span className={playbackSpeed === speed ? "text-[#0066FF]" : "text-[#333]"}>
                                              {speed.toFixed(1)}x
                                          </span>
                                          {playbackSpeed === speed && <Icons.Check size={14} className="text-[#0066FF]" />}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Order */}
                  <div className="relative playmode-menu-container">
                      <button 
                          onClick={() => setShowPlayModeMenu(!showPlayModeMenu)}
                          className="flex flex-col items-center gap-1 text-gray-500 active:scale-95 transition-transform"
                      >
                          <Icons.Repeat size={18} className="text-[#333]" strokeWidth={1.5} />
                          <span className="text-[9px] text-gray-500 mt-0.5">
                              {playMode === 'order' ? '顺序播放' : playMode === 'repeat' ? '单篇循环' : '单句循环'}
                          </span>
                      </button>

                      {/* Play Mode Popup Menu */}
                      {showPlayModeMenu && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-[0_5px_25px_rgba(0,0,0,0.15)] py-2 w-[110px] overflow-hidden z-50">
                              <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-r border-b border-gray-100/50"></div>
                              <div className="relative z-10 bg-white">
                                  {[
                                      { id: 'order', label: '顺序播放' },
                                      { id: 'channel-repeat', label: '频道循环' },
                                      { id: 'repeat', label: '单篇循环' },
                                      { id: 'shuffle', label: '随机播放' },
                                      { id: 'single', label: '单句循环' }
                                  ].map((mode) => (
                                      <button 
                                          key={mode.id}
                                          onClick={() => { setPlayMode(mode.id as any); setShowPlayModeMenu(false); }}
                                          className="w-full flex items-center justify-between px-3 py-2 text-[14px] active:bg-gray-50 transition-colors"
                                      >
                                          <span className={playMode === mode.id ? "text-[#0066FF]" : "text-[#333]"}>
                                              {mode.label}
                                          </span>
                                          {playMode === mode.id && <Icons.Check size={14} className="text-[#0066FF]" />}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>

                  {/* Read Mode */}
                  <button className="flex flex-col items-center gap-1 text-gray-500 active:scale-95 transition-transform">
                      <Icons.FileText size={18} className="text-[#333]" strokeWidth={1.5} />
                      <span className="text-[9px] text-gray-500 mt-0.5">阅读模式</span>
                  </button>

                  {/* Shadowing */}
                  <button className="flex flex-col items-center gap-1 text-gray-500 active:scale-95 transition-transform">
                      <Icons.Mic size={18} className="text-[#333]" strokeWidth={1.5} />
                      <span className="text-[9px] text-gray-500 mt-0.5">跟读原文</span>
                  </button>

                  {/* Vocabulary */}
                  <button 
                      onClick={() => {
                          setShowWordTraining(true);
                          if (isVideo && videoRef.current) videoRef.current.pause();
                          if (!isVideo && audioRef.current) audioRef.current.pause();
                          setIsPlaying(false);
                      }}
                      className="flex flex-col items-center gap-1 text-gray-500 active:scale-95 transition-transform"
                  >
                      <Icons.BookOpen size={18} className="text-[#333]" strokeWidth={1.5} />
                      <span className="text-[9px] text-gray-500 mt-0.5">单词训练</span>
                  </button>
              </div>
          </div>

          {/* Row 2: Progress Area */}
          <div className={`flex flex-col px-8 overflow-hidden transition-all duration-300 ${isBottomCollapsed ? 'h-0 opacity-0' : 'h-[24px] opacity-100 mt-1 mb-1'}`}>
              <div 
                className="w-full h-[3px] bg-gray-100 rounded-full relative cursor-pointer group"
                onClick={handleSeek}
              >
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#5C6BFA] rounded-full" 
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  ></div>
                  <div 
                    className="absolute top-1/2 -mt-[3px] h-[6px] w-[6px] md:group-hover:h-[8px] md:group-hover:w-[8px] md:group-hover:-mt-[4px] bg-[#5C6BFA] rounded-full shadow-sm transform -translate-x-1/2 transition-all"
                    style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  ></div>
              </div>
              <div className="flex justify-between items-center mt-1.5 text-[9px] text-gray-400 font-mono tracking-wider">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
              </div>
          </div>

          {/* Row 3: Playback Controls - always visible */}
          <div className="flex items-center justify-between px-8 pb-6 pt-3 h-[60px]">
              <button 
                onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
                className="text-gray-400 active:scale-95 transition-transform"
              >
                  <Icons.List size={20} strokeWidth={1.5} className={isBottomCollapsed ? "text-[#5C6BFA]" : ""} />
              </button>

              <div className="flex items-center gap-6">
                  <button className="active:scale-90 transition-transform">
                      <Icons.SkipBack size={20} className="fill-[#333] text-[#333]" />
                  </button>
                  
                  <button 
                    onClick={togglePlay}
                    className="active:scale-95 transition-transform bg-[#5C6BFA] text-white rounded-full p-2.5 shadow-md flex items-center justify-center"
                  >
                      {isPlaying ? (
                          <Icons.Pause size={20} className="fill-white" />
                      ) : (
                          <Icons.Play size={20} className="fill-white translate-x-[1px]" />
                      )}
                  </button>

                  <button className="active:scale-90 transition-transform">
                      <Icons.SkipForward size={20} className="fill-[#333] text-[#333]" />
                  </button>
              </div>

              <button className="text-gray-400 active:scale-95 transition-transform">
                  <Icons.Shuffle size={18} className="text-[#333]" strokeWidth={1.5} />
              </button>
          </div>
      </div>
      
      {/* Modals */}
      {selectedWord && (
          <DictionaryModal 
              word={selectedWord} 
              onClose={() => setSelectedWord(null)} 
          />
      )}
      {analyzedSentence && (
          <SentenceAnalysisModal 
              englishText={analyzedSentence.english} 
              chineseText={analyzedSentence.chinese} 
              onClose={() => setAnalyzedSentence(null)} 
          />
      )}
      {showWordTraining && (
          <WordTrainingPanel 
              lessonId={lesson.id} 
              onClose={() => setShowWordTraining(false)} 
          />
      )}
    </div>
  );
};

export default LessonPlayerPage;
