import React, { useState, useEffect, useRef } from 'react';
import { ClassSession, Studio } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { calculateDuration, formatCurrency } from '../utils';
import { Icons } from './Icon';

interface ScheduleViewProps {
  classes: ClassSession[];
  studios: Studio[];
  onAddClass: (dayIdx: number) => void;
  onEditClass: (cls: ClassSession) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ classes, studios, onAddClass, onEditClass }) => {
  // Initialize with today's index (0=Mon, 6=Sun)
  const [activeDay, setActiveDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view when activeDay changes or on mount
  useEffect(() => {
    if (tabsRef.current) {
      const activeTab = tabsRef.current.children[activeDay] as HTMLElement;
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeDay]);

  // Filter classes for the active day and sort by time
  const daysClasses = classes
    .filter(c => c.dayIndex === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getStudio = (id: string) => studios.find(s => s.id === id);

  return (
    <div className="h-full flex flex-col">
      {/* Day Tabs */}
      <div 
        ref={tabsRef}
        className="flex overflow-x-auto no-scrollbar gap-2 pb-4 mb-2 px-1 scroll-smooth"
      >
        {DAYS_OF_WEEK.map((day, idx) => (
          <button
            key={day}
            onClick={() => setActiveDay(idx)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeDay === idx 
                ? 'bg-gray-900 text-white shadow-md transform scale-105' 
                : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Class List */}
      <div className="flex-1 space-y-4 pb-24 overflow-y-auto no-scrollbar">
        {daysClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="bg-gray-100 p-4 rounded-full mb-3">
               <Icons.Calendar size={32} className="opacity-50" />
            </div>
            <p>今天没有课程安排</p>
            <button 
              onClick={() => onAddClass(activeDay)}
              className="mt-4 text-rose-500 font-bold text-sm"
            >
              + 添加一节课
            </button>
          </div>
        ) : (
          daysClasses.map(cls => {
            const studio = getStudio(cls.studioId);
            const duration = calculateDuration(cls.startTime, cls.endTime);
            // Updated: Income is now flat rate per session, not hourly
            const income = studio?.rate || 0;

            return (
              <div 
                key={cls.id}
                onClick={() => onEditClass(cls)}
                className={`relative p-5 rounded-3xl border bg-white shadow-sm active:scale-[0.98] transition-transform ${studio?.color || 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between">
                   {/* Left: Time and Studio */}
                   <div>
                     <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-black text-gray-800 tracking-tight">
                          {cls.startTime}
                        </span>
                        <span className="text-sm font-medium text-gray-400">至 {cls.endTime}</span>
                     </div>
                     
                     <div className="flex items-center gap-2 mb-2">
                        <Icons.MapPin size={18} className="text-rose-500" />
                        <h3 className="text-lg font-bold text-gray-700">{studio?.name || '未知舞室'}</h3>
                     </div>
                   </div>

                   {/* Right: Income */}
                   <div className="text-right pl-4">
                      <div className="bg-gray-900 text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-lg shadow-gray-200">
                        {formatCurrency(income)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 text-center">
                        {duration.toFixed(1)}h
                      </div>
                   </div>
                </div>

                {/* Remarks Row (if exists) */}
                {cls.notes && (
                  <div className="mt-3 pt-3 border-t border-dashed border-gray-100 flex items-start gap-2">
                    <Icons.Edit size={12} className="text-rose-400 mt-0.5" />
                    <p className="text-sm font-medium text-rose-500 leading-tight">{cls.notes}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
        
        <button 
          onClick={() => onAddClass(activeDay)}
          className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold flex items-center justify-center gap-2 hover:border-rose-300 hover:text-rose-500 transition-colors"
        >
          <Icons.Plus size={20} /> 添加课程
        </button>
      </div>
    </div>
  );
};