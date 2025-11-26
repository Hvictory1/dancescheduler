import React, { useState, useEffect } from 'react';
import { ClassSession, Studio } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { generateId, timeToMinutes } from '../utils';

interface ClassEditorProps {
  studios: Studio[];
  allClasses: ClassSession[]; // Needed for conflict detection
  existingClass?: ClassSession;
  initialDayIndex?: number;
  onSave: (cls: ClassSession) => void;
  onDelete?: (id: string) => void;
}

export const ClassEditor: React.FC<ClassEditorProps> = ({ 
  studios, 
  allClasses,
  existingClass, 
  initialDayIndex = 0,
  onSave, 
  onDelete 
}) => {
  const [studioId, setStudioId] = useState(existingClass?.studioId || (studios[0]?.id || ''));
  const [dayIndex, setDayIndex] = useState(existingClass?.dayIndex ?? initialDayIndex);
  const [startTime, setStartTime] = useState(existingClass?.startTime || '18:00');
  const [endTime, setEndTime] = useState(existingClass?.endTime || '19:30');
  const [notes, setNotes] = useState(existingClass?.notes || '');

  useEffect(() => {
    if (existingClass) {
      setStudioId(existingClass.studioId);
      setDayIndex(existingClass.dayIndex);
      setStartTime(existingClass.startTime);
      setEndTime(existingClass.endTime);
      setNotes(existingClass.notes || '');
    }
  }, [existingClass]);

  const checkConflict = (currentId: string | undefined, day: number, start: string, end: string) => {
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);

    const conflictingClass = allClasses.find(c => {
      // Skip self
      if (currentId && c.id === currentId) return false;
      // Skip other days
      if (c.dayIndex !== day) return false;

      const cStart = timeToMinutes(c.startTime);
      const cEnd = timeToMinutes(c.endTime);

      // Check overlap: (StartA < EndB) and (EndA > StartB)
      return startMin < cEnd && endMin > cStart;
    });

    return conflictingClass;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioId) return alert('请先添加舞蹈室');
    
    // Basic time validation
    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      return alert('结束时间必须晚于开始时间');
    }

    // Conflict validation
    const conflict = checkConflict(existingClass?.id, dayIndex, startTime, endTime);
    if (conflict) {
      return alert(`时间冲突！该时段已安排：\n${conflict.startTime}-${conflict.endTime}`);
    }
    
    onSave({
      id: existingClass?.id || generateId(),
      studioId,
      dayIndex,
      startTime,
      endTime,
      notes
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* 舞蹈室选择 - 放大 */}
      <div>
        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">上课地点</label>
        <select 
          value={studioId} 
          onChange={(e) => setStudioId(e.target.value)}
          className="w-full p-4 text-lg font-bold rounded-2xl border-2 border-gray-200 bg-white focus:outline-none focus:border-rose-500 transition-colors appearance-none"
        >
          {studios.length === 0 && <option value="">请先在管理中添加舞蹈室</option>}
          {studios.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.rate}元/节)</option>
          ))}
        </select>
      </div>

      {/* 星期选择 */}
      <div>
         <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">上课日期</label>
         <select 
          value={dayIndex}
          onChange={(e) => setDayIndex(Number(e.target.value))}
          className="w-full p-4 text-lg font-bold rounded-2xl border-2 border-gray-200 bg-white focus:outline-none focus:border-rose-500 transition-colors appearance-none"
         >
           {DAYS_OF_WEEK.map((day, idx) => (
             <option key={idx} value={idx}>{day}</option>
           ))}
         </select>
      </div>

      {/* 时间选择 - 分离式 */}
      <div className="flex gap-4">
        <div>
           <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">开始时间</label>
           <input 
            type="time" 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-4 text-center text-xl font-bold rounded-2xl border-2 border-gray-200 bg-white focus:outline-none focus:border-rose-500"
           />
        </div>
        
        <div>
           <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">结束时间</label>
           <input 
            type="time" 
            value={endTime} 
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-4 text-center text-xl font-bold rounded-2xl border-2 border-gray-200 bg-white focus:outline-none focus:border-rose-500"
           />
        </div>
      </div>

      {/* 备注 - 红色 */}
      <div>
        <label className="block text-xs font-bold text-rose-400 mb-1 uppercase tracking-wider">备注 (选填)</label>
        <input 
          type="text" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          placeholder="例如：需带音响..."
          className="w-full p-4 rounded-2xl border border-rose-100 bg-rose-50 text-rose-600 placeholder-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-base"
        />
      </div>

      <div className="pt-4 flex gap-3">
        {existingClass && onDelete && (
          <button 
            type="button" 
            onClick={() => onDelete(existingClass.id)}
            className="flex-1 bg-gray-100 text-gray-500 font-bold py-4 px-4 rounded-2xl hover:bg-gray-200 transition-colors"
          >
            删除
          </button>
        )}
        <button 
          type="submit" 
          className="flex-[2] bg-gray-900 text-white font-bold py-4 px-4 rounded-2xl hover:bg-gray-800 shadow-lg shadow-gray-200 transition-colors"
        >
          {existingClass ? '保存修改' : '确认添加'}
        </button>
      </div>
    </form>
  );
};