import React, { useState, useEffect } from 'react';
import { INITIAL_CLASSES, INITIAL_STUDIOS } from './constants';
import { Studio, ClassSession, Tab, WeeklyAdjustment } from './types';
import { calculateWeeklyStats } from './utils';
import { ScheduleView } from './components/ScheduleView';
import { StudioManager } from './components/StudioManager';
import { StatsView } from './components/StatsView';
import { Modal } from './components/Modal';
import { ClassEditor } from './components/ClassEditor';
import { Icons } from './components/Icon';

const App: React.FC = () => {
  // State
  const [studios, setStudios] = useState<Studio[]>(() => {
    const saved = localStorage.getItem('dance_studios');
    return saved ? JSON.parse(saved) : INITIAL_STUDIOS;
  });

  const [classes, setClasses] = useState<ClassSession[]>(() => {
    const saved = localStorage.getItem('dance_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [weeklyAdjustments, setWeeklyAdjustments] = useState<WeeklyAdjustment[]>(() => {
    const saved = localStorage.getItem('dance_weekly_adjustments');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<Omit<Tab, 'studios'> | 'schedule'>('schedule');
  
  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  
  const [editingClass, setEditingClass] = useState<ClassSession | undefined>(undefined);
  const [preselectedDay, setPreselectedDay] = useState<number>(0);

  // Persistence
  useEffect(() => {
    localStorage.setItem('dance_studios', JSON.stringify(studios));
  }, [studios]);

  useEffect(() => {
    localStorage.setItem('dance_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('dance_weekly_adjustments', JSON.stringify(weeklyAdjustments));
  }, [weeklyAdjustments]);

  // Derived state
  const baseStats = calculateWeeklyStats(classes, studios);

  // Handlers for Classes
  const handleSaveClass = (newClass: ClassSession) => {
    if (editingClass) {
      setClasses(classes.map(c => c.id === newClass.id ? newClass : c));
    } else {
      setClasses([...classes, newClass]);
    }
    setIsClassModalOpen(false);
    setEditingClass(undefined);
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('确定删除这节课吗？')) {
      setClasses(classes.filter(c => c.id !== id));
      setIsClassModalOpen(false);
      setEditingClass(undefined);
    }
  };

  // Handlers for Adjustments
  const handleAddAdjustment = (adj: WeeklyAdjustment) => {
    setWeeklyAdjustments([...weeklyAdjustments, adj]);
  };

  const handleDeleteAdjustment = (id: string) => {
    setWeeklyAdjustments(weeklyAdjustments.filter(a => a.id !== id));
  };

  // Modal Openers
  const openAddModal = (dayIdx?: number) => {
    setEditingClass(undefined);
    if (dayIdx !== undefined) setPreselectedDay(dayIdx);
    setIsClassModalOpen(true);
  };

  const openEditModal = (cls: ClassSession) => {
    setEditingClass(cls);
    setIsClassModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      {/* Use h-[100dvh] to fix mobile browser address bar layout shifts */}
      <div className="w-full max-w-md bg-[#f8fafc] h-[100dvh] relative shadow-2xl flex flex-col">
        
        {/* Header */}
        <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-white sticky top-0 z-10 border-b border-gray-100 select-none flex-shrink-0">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {activeTab === 'schedule' && '我的课表11'}
              {activeTab === 'stats' && '收入统计'}
            </h1>
            <p className="text-xs text-gray-400 font-medium">Dance Teacher Assistant</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsStudioModalOpen(true)}
              className="bg-gray-100 text-gray-500 p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="管理舞蹈室"
            >
              <Icons.Settings size={20} />
            </button>
            {activeTab === 'schedule' && (
              <button 
                onClick={() => openAddModal(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)}
                className="bg-gray-900 text-white p-2 rounded-full hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200 active:scale-95"
              >
                <Icons.Plus size={20} />
              </button>
            )}
          </div>
        </header>

        {/* Content - Main area allows scroll */}
        <main className="flex-1 p-4 overflow-hidden relative">
          {activeTab === 'schedule' && (
            <ScheduleView 
              classes={classes} 
              studios={studios} 
              onAddClass={openAddModal}
              onEditClass={openEditModal}
            />
          )}
          {activeTab === 'stats' && (
            <StatsView 
              baseStats={baseStats} 
              classes={classes} 
              studios={studios}
              adjustments={weeklyAdjustments}
              onAddAdjustment={handleAddAdjustment}
              onDeleteAdjustment={handleDeleteAdjustment}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="w-full bg-white border-t border-gray-100 flex justify-around py-3 pb-6 pb-safe z-40 text-[10px] font-bold text-gray-400 select-none flex-shrink-0">
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'schedule' ? 'text-rose-500' : 'hover:text-gray-600'}`}
          >
            <Icons.Calendar size={24} className={activeTab === 'schedule' ? 'fill-current' : ''} />
            <span>课表</span>
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'stats' ? 'text-rose-500' : 'hover:text-gray-600'}`}
          >
            <Icons.Stats size={24} className={activeTab === 'stats' ? 'fill-current' : ''} />
            <span>统计</span>
          </button>
        </nav>

        {/* Class Modal */}
        <Modal
          isOpen={isClassModalOpen}
          onClose={() => setIsClassModalOpen(false)}
          title={editingClass ? '编辑课程' : '添加新课程'}
        >
          <ClassEditor 
            studios={studios}
            allClasses={classes}
            existingClass={editingClass}
            initialDayIndex={preselectedDay}
            onSave={handleSaveClass}
            onDelete={handleDeleteClass}
          />
        </Modal>
        
        {/* Studio Management Modal */}
        <Modal
          isOpen={isStudioModalOpen}
          onClose={() => setIsStudioModalOpen(false)}
          title="管理舞蹈室"
        >
          <StudioManager 
            studios={studios}
            setStudios={setStudios}
          />
        </Modal>

      </div>
    </div>
  );
};

export default App;