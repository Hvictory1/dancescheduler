export const DAYS_OF_WEEK = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export const STUDIO_COLORS = [
  'bg-rose-100 text-rose-800 border-rose-200',
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-cyan-100 text-cyan-800 border-cyan-200',
  'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
];

export const INITIAL_STUDIOS = [
  { id: '1', name: '星空舞蹈室', rate: 150, color: STUDIO_COLORS[0] },
  { id: '2', name: '悦动工坊', rate: 200, color: STUDIO_COLORS[1] },
];

export const INITIAL_CLASSES = [
  { id: '101', studioId: '1', dayIndex: 0, startTime: '18:00', endTime: '19:30', notes: '少儿爵士' },
  { id: '102', studioId: '2', dayIndex: 2, startTime: '19:00', endTime: '20:30', notes: '成人韩舞' },
];