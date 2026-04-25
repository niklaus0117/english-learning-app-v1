import React, { useState } from 'react';
import { Icons } from './Icons';
import { Lesson } from '../types';

interface BookshelfPageProps {
  collectedLessons: Lesson[];
  onLessonClick: (lesson: Lesson) => void;
}

// Mock Albums based on the provided screenshot
const MOCK_ALBUMS = [
  {
    id: 1,
    title: '华夏民俗录',
    count: 16,
    tags: ['公开课', '记录中国'],
    imageUrl: 'https://picsum.photos/400/300?random=101',
    hasNew: true,
  },
  {
    id: 2,
    title: '人工智能第一课',
    count: 46,
    tags: ['公开课', '科技'],
    imageUrl: 'https://picsum.photos/400/300?random=102',
    hasNew: true,
  },
  {
    id: 3,
    title: '演员对谈',
    count: 110,
    tags: ['访谈', '人物'],
    imageUrl: 'https://picsum.photos/400/300?random=103',
    hasNew: false,
  }
];

const BookshelfPage: React.FC<BookshelfPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'album' | 'playlist'>('album');
  const [isFolderOpen, setIsFolderOpen] = useState(true);

  return (
    <div className="bg-white min-h-full flex flex-col pt-4 overflow-y-auto pb-32">
      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-5 mt-2">
        <h1 className="text-2xl font-bold text-gray-900 tracking-wide">我听</h1>
        <button className="text-gray-800">
          <Icons.Search size={26} strokeWidth={2} />
        </button>
      </div>

      {/* Action Links */}
      <div className="px-5 mb-8 flex flex-col gap-1.5">
        {/* Recently Played */}
        <div className="flex items-center justify-between py-3 cursor-pointer active:bg-gray-50 transition-colors border-b border-gray-50/50">
          <div className="flex items-center gap-3">
            <Icons.Clock className="text-[#5C6BFA]" strokeWidth={2} size={22} />
            <span className="text-[16px] text-gray-800">最近播放</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
             {/* Mock overlapping avatars for recent plays */}
             <div className="flex -space-x-2 mr-1">
               <img className="w-5 h-5 rounded-full border border-white" src="https://picsum.photos/50/50?random=r1" alt="avatar" />
               <img className="w-5 h-5 rounded-full border border-white" src="https://picsum.photos/50/50?random=r2" alt="avatar" />
               <img className="w-5 h-5 rounded-full border border-white" src="https://picsum.photos/50/50?random=r3" alt="avatar" />
             </div>
             <span className="text-[13px] text-gray-400">10个</span>
             <Icons.ChevronRight size={18} />
          </div>
        </div>

        {/* My Dubbing */}
        <div className="flex items-center justify-between py-3 cursor-pointer active:bg-gray-50 transition-colors border-b border-gray-50/50">
          <div className="flex items-center gap-3">
            <Icons.Search className="text-[#5C6BFA] scale-x-[-1]" strokeWidth={2} size={22} /> {/* Using reversed search as placeholder for Q/Mic icon */}
            <span className="text-[16px] text-gray-800">我的配音秀</span>
          </div>
          <div className="flex items-center text-gray-400">
             <Icons.ChevronRight size={18} />
          </div>
        </div>

        {/* Offline Downloads */}
        <div className="flex items-center justify-between py-3 cursor-pointer active:bg-gray-50 transition-colors border-b border-gray-50/50">
          <div className="flex items-center gap-3">
            <Icons.Disc className="text-[#5C6BFA]" strokeWidth={2} size={22} /> {/* Placeholder for offline disc icon */}
            <span className="text-[16px] text-gray-800">离线下载</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
             <span className="text-[13px] text-gray-400">1个</span>
             <Icons.ChevronRight size={18} />
          </div>
        </div>

        {/* My Uploads */}
        <div className="flex items-center justify-between py-3 cursor-pointer active:bg-gray-50 transition-colors">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
               <Icons.ArrowUpCircle className="text-[#5C6BFA]" strokeWidth={2} size={22} /> 
            </div>
            <div className="flex flex-col">
               <span className="text-[16px] text-gray-800">我的上传</span>
               <span className="text-[12px] text-gray-400 mt-1">请通过 my.eudic.net 上传</span>
            </div>
          </div>
          <div className="flex items-center text-gray-400">
             <Icons.ChevronRight size={18} />
          </div>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gray-100/60 mb-6"></div>

      {/* Tabs Row */}
      <div className="flex items-center justify-between px-5 mb-5">
        <div className="flex items-baseline gap-6">
           <button 
              onClick={() => setActiveTab('album')}
              className={`text-[20px] font-bold transition-colors ${activeTab === 'album' ? 'text-gray-900' : 'text-gray-400'}`}
           >
              收藏专辑
           </button>
           <button 
              onClick={() => setActiveTab('playlist')}
              className={`text-[18px] transition-colors ${activeTab === 'playlist' ? 'text-gray-900 font-bold' : 'text-gray-400'}`}
           >
              播放列表
           </button>
        </div>
        <button className="text-[15px] text-gray-500 font-medium active:scale-95 transition-transform">
           设置
        </button>
      </div>

      {/* Default Collection Folder Fold */}
      <div 
        className="flex items-center gap-2 px-5 py-2 mb-2 cursor-pointer active:bg-gray-50 transition-colors"
        onClick={() => setIsFolderOpen(!isFolderOpen)}
      >
         <Icons.ChevronDown 
            size={18} 
            strokeWidth={2} 
            className={`text-gray-800 transition-transform ${isFolderOpen ? '' : '-rotate-90'}`} 
         />
         <span className="text-[15px] font-bold text-gray-800 tracking-wide">
            默认收藏夹
         </span>
      </div>

      {/* Albums List */}
      <div className={`px-5 space-y-4 mb-8 transition-all overflow-hidden ${isFolderOpen ? 'opacity-100' : 'h-0 opacity-0'}`}>
         {MOCK_ALBUMS.map(album => (
            <div key={album.id} className="flex gap-4 py-1 cursor-pointer active:scale-[0.98] transition-transform">
               {/* Cover */}
               <div className="relative w-[110px] h-[75px] rounded border border-gray-100 overflow-hidden flex-shrink-0">
                  <img src={album.imageUrl} alt={album.title} className="w-full h-full object-cover" />
                  {/* Subtle gradient overlay to make text pop if any */}
                  <div className="absolute inset-0 bg-black/10"></div>
                  {/* Fake UI elements inside cover matching screenshot exactly */}
                  <div className="absolute top-1 left-2 text-white text-[12px] font-bold drop-shadow-md">
                     {album.title}
                  </div>
                  {album.id === 2 && (
                      <div className="absolute bottom-1 left-2 text-white text-[10px] font-bold drop-shadow-md">
                        人工智能第一课
                      </div>
                  )}
               </div>

               {/* Info */}
               <div className="flex-1 flex flex-col pt-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                     <h3 className="text-[16px] font-bold text-gray-900 truncate">
                        {album.title}
                     </h3>
                     {album.hasNew && (
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                     )}
                  </div>
                  <p className="text-[13px] text-gray-400 mb-1.5">
                     共{album.count}篇
                  </p>
                  <div className="flex items-center text-[11px] text-gray-500 mt-auto">
                     <div className="bg-gray-100/80 px-1.5 py-0.5 rounded flex items-center">
                        {album.tags.join(' · ')}
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>

    </div>
  );
};

export default BookshelfPage;
