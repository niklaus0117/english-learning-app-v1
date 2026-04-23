import React from 'react';
import { Icons } from './Icons';

interface DictionaryModalProps {
  word: string;
  onClose: () => void;
}

export const DictionaryModal: React.FC<DictionaryModalProps> = ({ word, onClose }) => {
  const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full sm:w-[400px] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-900 capitalize">{cleanWord || 'Word'}</h3>
                <button onClick={onClose} className="p-1 text-gray-400 active:scale-95">
                    <Icons.X size={20} />
                </button>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600 cursor-pointer active:text-[#0066FF] bg-gray-50 px-2 py-1 rounded">
                    <span className="font-mono text-[11px] text-gray-400">英</span>
                    <span>/{cleanWord}/</span>
                    <Icons.Volume2 size={14} className="text-[#0066FF]" />
                </div>
                <div className="flex items-center gap-1 text-gray-600 cursor-pointer active:text-[#0066FF] bg-gray-50 px-2 py-1 rounded">
                    <span className="font-mono text-[11px] text-gray-400">美</span>
                    <span>/{cleanWord}/</span>
                    <Icons.Volume2 size={14} className="text-[#0066FF]" />
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div>
                    <div className="font-medium text-[#0066FF] text-[13px] mb-1">n. 名词</div>
                    <div className="text-gray-700 text-sm">相关解释，这是一个mock的单词解释。</div>
                </div>
                <div>
                    <div className="font-medium text-[#0066FF] text-[13px] mb-1">v. 动词</div>
                    <div className="text-gray-700 text-sm">相关解释，另一个mock解释。</div>
                </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="text-xs text-gray-500 mb-2 font-medium tracking-wide">例句 (Example Sentences)</div>
                <div className="space-y-3">
                    <div>
                        <div className="text-gray-800 text-sm leading-snug">The <span className="text-[#0066FF] font-medium">{cleanWord}</span> is very beautiful.</div>
                        <div className="text-gray-500 text-[13px] mt-0.5">这个{cleanWord}非常漂亮。</div>
                    </div>
                    <div>
                        <div className="text-gray-800 text-sm leading-snug">I want to buy a <span className="text-[#0066FF] font-medium">{cleanWord}</span>.</div>
                        <div className="text-gray-500 text-[13px] mt-0.5">我想买一个{cleanWord}。</div>
                    </div>
                </div>
            </div>
            
            <div className="mt-5 flex gap-3">
                <button className="flex-1 bg-blue-50 text-[#0066FF] py-3 rounded-xl text-sm font-medium active:scale-95 transition-transform flex items-center justify-center gap-2">
                   <Icons.Plus size={16} />
                   加入生词本
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
