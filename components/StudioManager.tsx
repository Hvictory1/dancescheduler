import React, { useState } from 'react';
import { Studio } from '../types';
import { generateId, formatCurrency } from '../utils';
import { STUDIO_COLORS } from '../constants';
import { Icons } from './Icon';

interface StudioManagerProps {
  studios: Studio[];
  setStudios: (studios: Studio[]) => void;
}

export const StudioManager: React.FC<StudioManagerProps> = ({ studios, setStudios }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newStudioName, setNewStudioName] = useState('');
  const [newStudioRate, setNewStudioRate] = useState('');

  const handleAdd = () => {
    if (!newStudioName || !newStudioRate) return;
    
    // Pick a random color from palette
    const randomColor = STUDIO_COLORS[Math.floor(Math.random() * STUDIO_COLORS.length)];
    
    const newStudio: Studio = {
      id: generateId(),
      name: newStudioName,
      rate: parseFloat(newStudioRate),
      color: randomColor
    };

    setStudios([...studios, newStudio]);
    setNewStudioName('');
    setNewStudioRate('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除该舞蹈室吗？相关的课程也会被清除。')) {
      setStudios(studios.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Studio List */}
      <div className="space-y-3">
        {studios.length === 0 && (
          <p className="text-center text-gray-400 py-4">暂无舞蹈室，请添加</p>
        )}
        {studios.map(studio => (
          <div key={studio.id} className={`flex justify-between items-center p-4 rounded-2xl border ${studio.color} bg-opacity-30`}>
            <div>
              <h3 className="font-bold text-gray-800">{studio.name}</h3>
              <p className="text-sm opacity-80">{formatCurrency(studio.rate)} / 小时</p>
            </div>
            <button 
              onClick={() => handleDelete(studio.id)}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
            >
              <Icons.Trash size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {isAdding ? (
        <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 animate-fade-in">
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="舞蹈室名称 (如: 星空舞蹈)" 
                value={newStudioName}
                onChange={(e) => setNewStudioName(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <input 
                type="number" 
                placeholder="时薪 (元)" 
                value={newStudioRate}
                onChange={(e) => setNewStudioRate(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex gap-2">
                <button onClick={() => setIsAdding(false)} className="flex-1 py-2 text-gray-500 font-medium">取消</button>
                <button onClick={handleAdd} className="flex-1 py-2 bg-rose-500 text-white rounded-xl font-bold">确认添加</button>
              </div>
            </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsAdding(true)}
          className="mt-4 w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold flex items-center justify-center gap-2 hover:border-rose-300 hover:text-rose-500 transition-colors"
        >
          <Icons.Plus size={20} /> 添加新舞蹈室
        </button>
      )}
    </div>
  );
};