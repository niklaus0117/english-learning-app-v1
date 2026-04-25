import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { apiService } from '../services/api';
import { WordItem } from '../types';

interface WordTrainingPanelProps {
  lessonId: string;
  onClose: () => void;
}

const WordTrainingPanel: React.FC<WordTrainingPanelProps> = ({ lessonId, onClose }) => {
  const [words, setWords] = useState<WordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'keyWords' | 'history'>('keyWords');

  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      try {
        const data = await apiService.getLessonKeyWords(lessonId);
        setWords(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, [lessonId]);

  const toggleSave = (index: number) => {
    const newWords = [...words];
    newWords[index].isSaved = !newWords[index].isSaved;
    setWords(newWords);
  };

  const playAudio = (word: string) => {
    // Mock play audio
    console.log(`Playing audio for ${word}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
      {/* Slide-in panel from the right, taking up majority of the screen but leaving a gap on the left */}
      <div 
        className="w-[85%] max-w-[400px] h-full bg-white shadow-2xl flex flex-col animate-slide-in-right"
        style={{ animationDuration: '300ms' }}
      >
        {/* Header / Search Area */}
        <div className="pt-12 pb-2 px-4 shadow-sm relative z-10 bg-white">
          <button onClick={onClose} className="absolute left-0 top-12 p-3 text-gray-400 active:scale-95">
             <Icons.ChevronLeft size={24} />
          </button>
          
          <div className="ml-8 bg-gray-100 rounded flex items-center px-3 py-2 text-[14px]">
             <input 
               className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400" 
               placeholder="点击输入需要查询的单词"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>

          {/* Tabs */}
          <div className="flex mt-4 border-b border-gray-100">
             <button 
                onClick={() => setActiveTab('keyWords')}
                className={`flex-1 py-3 text-[15px] relative ${activeTab === 'keyWords' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
             >
                重点单词
                {activeTab === 'keyWords' && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-blue-600 rounded-full"></div>
                )}
             </button>
             <div className="w-[1px] h-4 bg-gray-200 self-center"></div>
             <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-[15px] relative ${activeTab === 'history' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
             >
                查询历史
                {activeTab === 'history' && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-blue-600 rounded-full"></div>
                )}
             </button>
          </div>
        </div>

        {/* Word List Area */}
        <div className="flex-1 overflow-y-auto bg-white pb-24">
          {loading ? (
            <div className="flex items-center justify-center p-10 text-gray-400 text-sm">加载中...</div>
          ) : (
            <div className="divide-y divide-gray-100">
               {words.map((item, idx) => (
                 <div key={idx} className="flex items-center px-4 py-3 active:bg-gray-50">
                    {/* Audio Icon */}
                    <button 
                      onClick={() => playAudio(item.word)} 
                      className="p-2 mr-2 text-blue-500 active:scale-90 transition-transform"
                    >
                       <Icons.Volume2 strokeWidth={2} size={22} className="fill-blue-500" />
                    </button>
                    
                    {/* Word Details */}
                    <div className="flex-1 min-w-0 pr-4">
                       <h3 className="text-lg text-gray-900 font-medium">{item.word}</h3>
                       <p className="text-[13px] text-gray-500 mt-0.5 truncate">
                          {item.pos} {item.translation}
                       </p>
                    </div>

                    {/* Star Icon */}
                    <button 
                      onClick={() => toggleSave(idx)}
                      className="p-2 text-gray-300 active:scale-90 transition-transform"
                    >
                       {item.isSaved ? (
                         <Icons.Star className="fill-yellow-400 text-yellow-400" size={20} />
                       ) : (
                         <Icons.Star size={20} />
                       )}
                    </button>
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* Bottom Sticky Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-8 bg-white border-t border-gray-100 flex justify-center shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <button className="text-[15px] text-gray-600 font-medium py-2 px-8 active:opacity-70 transition-opacity">
               一键导入生词本
            </button>
        </div>
      </div>
    </div>
  );
};

export default WordTrainingPanel;
