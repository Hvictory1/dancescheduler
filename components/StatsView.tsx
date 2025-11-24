import React, { useState, useMemo } from 'react';
import { WeeklyStats, ClassSession, Studio, WeeklyAdjustment } from '../types';
import { formatCurrency, getStartOfWeek, addDays, formatWeekRange, formatDateKey, generateId } from '../utils';
import { Icons } from './Icon';
import { generateWeeklyAnalysis } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface StatsViewProps {
  baseStats: WeeklyStats; // Calculated from schedule
  classes: ClassSession[];
  studios: Studio[];
  adjustments: WeeklyAdjustment[];
  onAddAdjustment: (adj: WeeklyAdjustment) => void;
  onDeleteAdjustment: (id: string) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ 
  baseStats, 
  classes, 
  studios,
  adjustments,
  onAddAdjustment,
  onDeleteAdjustment
}) => {
  // State for navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  
  // State for new adjustment form
  const [showAdjForm, setShowAdjForm] = useState(false);
  const [adjAmount, setAdjAmount] = useState('');
  const [adjNote, setAdjNote] = useState('');
  const [adjType, setAdjType] = useState<'bonus' | 'deduction'>('deduction');

  // Derived Data
  const currentWeekKey = formatDateKey(currentWeekStart);
  
  // Filter adjustments for current week
  const currentWeekAdjustments = useMemo(() => {
    return adjustments.filter(a => a.weekStartDate === currentWeekKey);
  }, [adjustments, currentWeekKey]);

  // Calculate totals
  const adjustmentsTotal = currentWeekAdjustments.reduce((sum, item) => sum + item.amount, 0);
  const finalIncome = baseStats.totalIncome + adjustmentsTotal;

  // Handlers
  const handlePrevWeek = () => setCurrentWeekStart(prev => addDays(prev, -7));
  const handleNextWeek = () => setCurrentWeekStart(prev => addDays(prev, 7));
  
  const handleSubmitAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjAmount) return;

    const amountVal = parseFloat(adjAmount);
    const finalAmount = adjType === 'bonus' ? Math.abs(amountVal) : -Math.abs(amountVal);

    onAddAdjustment({
      id: generateId(),
      weekStartDate: currentWeekKey,
      amount: finalAmount,
      note: adjNote || (adjType === 'bonus' ? '加课/补贴' : '停课/扣款'),
      createdAt: Date.now()
    });

    setAdjAmount('');
    setAdjNote('');
    setShowAdjForm(false);
  };

  const handleAnalysis = async () => {
    setIsAnalysisLoading(true);
    try {
      // Create a temporary stats object representing the actuals
      const realStats: WeeklyStats = {
        ...baseStats,
        totalIncome: finalIncome
      };
      const result = await generateWeeklyAnalysis(classes, studios, realStats);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("AI 分析服务暂时不可用，请稍后再试。");
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  // History generator (Last 5 weeks)
  const historyWeeks = useMemo(() => {
    const weeks = [];
    let d = getStartOfWeek(new Date());
    // Show current week + previous 4 weeks
    for (let i = 0; i < 5; i++) {
      const key = formatDateKey(d);
      const adjs = adjustments.filter(a => a.weekStartDate === key);
      const adjTotal = adjs.reduce((sum, item) => sum + item.amount, 0);
      weeks.push({
        date: d,
        key: key,
        total: baseStats.totalIncome + adjTotal,
        hasAdjustments: adjs.length > 0
      });
      d = addDays(d, -7);
    }
    return weeks;
  }, [adjustments, baseStats.totalIncome]);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      
      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <Icons.Left size={20} />
        </button>
        <div className="text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">当前统计周期</p>
          <p className="font-bold text-gray-800">{formatWeekRange(currentWeekStart)}</p>
        </div>
        <button onClick={handleNextWeek} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
          <Icons.Right size={20} />
        </button>
      </div>

      {/* Main Stats Card */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl p-6 text-white shadow-lg shadow-rose-200 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-sm font-medium opacity-80 mb-1 flex items-center gap-2">
            <Icons.Money className="text-white" size={16} /> 本周实际收入
          </h2>
          <p className="text-4xl font-bold mb-6">{formatCurrency(finalIncome)}</p>
          
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between text-sm mb-2">
              <span className="opacity-80">固定课表收入</span>
              <span className="font-medium">{formatCurrency(baseStats.totalIncome)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-80">调整 (停课/加课)</span>
              <span className={`font-medium ${adjustmentsTotal >= 0 ? 'text-white' : 'text-rose-200'}`}>
                {adjustmentsTotal > 0 ? '+' : ''}{formatCurrency(adjustmentsTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Adjustments Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-bold text-gray-800 text-sm">收支调整记录</h3>
          <button 
            onClick={() => setShowAdjForm(!showAdjForm)}
            className="text-rose-500 text-xs font-bold flex items-center gap-1"
          >
            <Icons.Plus size={14} /> 记一笔
          </button>
        </div>

        {/* Add Form */}
        {showAdjForm && (
          <form onSubmit={handleSubmitAdjustment} className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm animate-slide-up">
            <div className="flex gap-2 mb-3">
              <button 
                type="button"
                onClick={() => setAdjType('deduction')}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${adjType === 'deduction' ? 'bg-rose-100 text-rose-600' : 'bg-gray-50 text-gray-400'}`}
              >
                停课/扣款
              </button>
              <button 
                type="button"
                onClick={() => setAdjType('bonus')}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${adjType === 'bonus' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}
              >
                加课/补贴
              </button>
            </div>
            <div className="flex gap-2 mb-3">
               <input 
                 type="number" 
                 placeholder="金额" 
                 value={adjAmount}
                 onChange={e => setAdjAmount(e.target.value)}
                 className="flex-1 p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-rose-500"
                 autoFocus
               />
               <input 
                 type="text" 
                 placeholder="备注 (如: 节假日停课)" 
                 value={adjNote}
                 onChange={e => setAdjNote(e.target.value)}
                 className="flex-[2] p-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500"
               />
            </div>
            <button type="submit" className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm">确认记录</button>
          </form>
        )}

        {/* List */}
        {currentWeekAdjustments.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-xs bg-gray-50 rounded-2xl border-dashed border border-gray-200">
            本周没有额外的变动记录
          </div>
        ) : (
          <div className="space-y-2">
            {currentWeekAdjustments.map(adj => (
              <div key={adj.id} className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${adj.amount >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {adj.amount >= 0 ? <Icons.Plus size={16} /> : <Icons.Trash size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">{adj.note}</p>
                    <p className="text-xs text-gray-400">手动调整</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className={`font-bold ${adj.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                     {adj.amount > 0 ? '+' : ''}{adj.amount}
                   </span>
                   <button onClick={() => onDeleteAdjustment(adj.id)} className="text-gray-300 hover:text-rose-500">
                     <Icons.Close size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History List */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="font-bold text-gray-800 text-sm mb-4 px-2">近期周收入记录</h3>
        <div className="space-y-2">
          {historyWeeks.map((week, idx) => (
            <button 
              key={week.key} 
              onClick={() => setCurrentWeekStart(week.date)}
              className={`w-full flex justify-between items-center p-4 rounded-2xl transition-all ${
                week.key === currentWeekKey 
                  ? 'bg-gray-900 text-white shadow-lg scale-[1.02]' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="text-left">
                <p className={`font-bold text-sm ${week.key === currentWeekKey ? 'text-white' : 'text-gray-800'}`}>
                  {formatWeekRange(week.date)}
                  {idx === 0 && <span className="ml-2 text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full">本周</span>}
                </p>
                <p className={`text-xs ${week.key === currentWeekKey ? 'text-gray-400' : 'text-gray-400'}`}>
                  {week.hasAdjustments ? '有手动调整' : '标准课表'}
                </p>
              </div>
              <span className="font-mono font-bold">{formatCurrency(week.total)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Analysis Button */}
      <div className="pt-4 text-center">
        {!analysis && (
            <button 
            onClick={handleAnalysis}
            disabled={isAnalysisLoading}
            className="text-rose-500 text-sm font-bold flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
            >
            <Icons.Sparkles size={16} /> 
            {isAnalysisLoading ? '正在分析数据...' : '生成本周智能分析'}
            </button>
        )}
        {analysis && (
            <div className="mt-4 text-left prose prose-sm prose-rose bg-white p-4 rounded-xl shadow-sm">
                <ReactMarkdown>{analysis}</ReactMarkdown>
                <button onClick={() => setAnalysis(null)} className="mt-2 text-xs text-gray-400 underline">收起</button>
            </div>
        )}
      </div>
    </div>
  );
};