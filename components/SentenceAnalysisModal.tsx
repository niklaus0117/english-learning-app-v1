import React from 'react';
import { Icons } from './Icons';

interface SentenceAnalysisModalProps {
  englishText: string;
  chineseText: string;
  onClose: () => void;
}

export const SentenceAnalysisModal: React.FC<SentenceAnalysisModalProps> = ({ englishText, chineseText, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50 animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm relative z-10">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-500 active:scale-95">
              <Icons.ChevronDown size={24} />
          </button>
          <div className="text-[16px] font-bold text-gray-800">句子解析</div>
          <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
          {/* Main Sentence Card */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] mb-4">
              <div className="text-[18px] font-serif font-medium text-gray-900 leading-relaxed mb-3">
                  {englishText}
              </div>
              <div className="text-[15px] font-serif text-gray-600 leading-snug">
                  {chineseText}
              </div>
              <button className="mt-4 flex items-center justify-center gap-1.5 bg-[#F2F7FF] text-[#0066FF] px-4 py-2 rounded-full text-[13px] font-medium active:scale-95 transition-transform w-full">
                  <Icons.Volume2 size={16} />
                  跟读原句
              </button>
          </div>

          {/* Grammar Analysis (Mock) */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] mb-4">
              <div className="flex items-center gap-2 mb-4 text-gray-800">
                  <Icons.Zap size={18} className="text-[#FF9F0A]" />
                  <span className="font-bold text-[15px]">语法结构解析</span>
              </div>
              
              <div className="space-y-4">
                  <div>
                      <div className="text-[#0066FF] font-medium text-[14px] mb-1">主句结构</div>
                      <div className="text-gray-700 text-[14px] leading-relaxed">
                          这是一个典型的<span className="font-medium">主谓宾</span>结构句型。核心主语明确，动词引导的主要动作描述清晰。
                      </div>
                  </div>
                  <div>
                      <div className="text-[#0066FF] font-medium text-[14px] mb-1">核心词汇解析</div>
                      <div className="text-gray-700 text-[14px] leading-relaxed">
                          句子中包含了几个高级词汇和短语搭配，有助于提升整体表达的精确度。
                      </div>
                  </div>
              </div>
          </div>

          {/* Vocabulary Highlight */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] mb-6">
              <div className="flex items-center gap-2 mb-4 text-gray-800">
                  <Icons.BookOpen size={18} className="text-[#32ADE6]" />
                  <span className="font-bold text-[15px]">核心词汇</span>
              </div>
              
              <div className="space-y-3">
                  <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 flex items-center justify-between">
                      <div>
                          <div className="font-bold text-gray-900 text-[15px]">example</div>
                          <div className="text-gray-500 text-[13px] mt-0.5">n. 例子，范例</div>
                      </div>
                      <button className="text-[#0066FF] p-2 active:bg-blue-50 rounded-full transition-colors">
                          <Icons.Plus size={20} />
                      </button>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 flex items-center justify-between">
                      <div>
                          <div className="font-bold text-gray-900 text-[15px]">highlight</div>
                          <div className="text-gray-500 text-[13px] mt-0.5">v. 突出，强调</div>
                      </div>
                      <button className="text-[#0066FF] p-2 active:bg-blue-50 rounded-full transition-colors">
                          <Icons.Plus size={20} />
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
