import React, { useState } from 'react';
import { Icons } from './Icons';

export const NotesTab: React.FC = () => {
    const [notes, setNotes] = useState([
        { id: 1, text: "Saturn is the 6th planet from the Sun and the second-largest in the Solar System.", time: "01:23", date: "今天 10:30" }
    ]);
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState('');

    const handleSave = () => {
        if (!draft.trim()) return;
        setNotes([
            { id: Date.now(), text: draft, time: "00:00", date: "刚刚" },
            ...notes
        ]);
        setDraft('');
        setIsEditing(false);
    };

    return (
        <div className="h-full flex flex-col bg-[#F9FAFB]">
            {isEditing ? (
                <div className="flex-1 p-4 flex flex-col bg-white">
                    <textarea 
                        className="flex-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-xl outline-none resize-none text-[15px] text-gray-800 placeholder:text-gray-400"
                        placeholder="在这里写下你的学习笔记..."
                        autoFocus
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                    ></textarea>
                    <div className="flex gap-4 mt-6">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-3.5 rounded-xl font-medium text-gray-600 bg-gray-100 active:scale-95 transition-transform"
                        >
                            取消
                        </button>
                        <button 
                            onClick={handleSave}
                            className={`flex-1 py-3.5 rounded-xl font-medium text-white transition-transform ${draft.trim() ? 'bg-[#0066FF] active:scale-95 shadow-[0_4px_12px_rgba(0,102,255,0.3)]' : 'bg-[#0066FF]/50 pointer-events-none'}`}
                        >
                            保存笔记
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 p-4 overflow-y-auto no-scrollbar relative min-h-0">
                    {notes.length > 0 ? (
                        <div className="space-y-4">
                            {notes.map(note => (
                                <div key={note.id} className="bg-white p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-50">
                                    <div className="text-[15px] leading-relaxed text-gray-800 mb-3 whitespace-pre-wrap font-serif">
                                        {note.text}
                                    </div>
                                    <div className="flex justify-between items-center text-[12px] text-gray-400 font-medium">
                                        <div className="flex items-center gap-1.5 bg-[#F2F7FF] text-[#0066FF] px-2 py-0.5 rounded font-mono">
                                            <Icons.Play size={10} className="fill-[#0066FF]" />
                                            {note.time}
                                        </div>
                                        <span>{note.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 pb-20">
                            <Icons.FileText size={48} strokeWidth={1} className="mb-4 text-gray-300" />
                            <p className="text-[14px]">还没有记笔记哦</p>
                        </div>
                    )}

                    {/* Floating Add Button */}
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="fixed bottom-[120px] right-6 w-14 h-14 bg-[#0066FF] text-white rounded-full flex justify-center items-center shadow-[0_6px_20px_rgba(0,102,255,0.4)] active:scale-90 transition-transform z-10"
                    >
                        <Icons.Edit3 size={24} />
                    </button>
                </div>
            )}
        </div>
    );
};
