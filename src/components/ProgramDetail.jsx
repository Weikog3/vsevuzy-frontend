import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  GraduationCap, 
  Calendar, 
  Clock, 
  FileText, 
  Users, 
  Languages, 
  Shield, 
  Home, 
  Building2 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export default function ProgramDetail({ program, onBack }) {
  const [scoreType, setScoreType] = useState('budget'); // 'budget' | 'paid'

  // Данные для графика из объекта программы
  const chartData = program.scoreHistory || [];

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto overflow-y-auto">
      {/* 1. Кнопка возврата назад */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-[#025a94] hover:text-[#024a7b] mb-6 transition group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Вернуться к результатам поиска
      </button>

      {/* 2. Главная плашка вуза и специальности */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Герб / Логотип университета */}
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-slate-100 bg-[#f8fafc] flex items-center justify-center p-3 text-[#025a94] shadow-inner flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" />
              <circle cx="50" cy="50" r="41" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M50 20 L58 36 L75 39 L63 51 L66 68 L50 60 L34 68 L37 51 L25 39 L42 36 Z" />
            </svg>
          </div>

          <div>
            <div className="text-[11px] font-bold text-[#025a94] tracking-wider uppercase mb-1">
              {program.university}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight mb-1.5">
              {program.title}
            </h1>
            <div className="text-xs text-slate-400 font-medium">
              Код: {program.code} • {program.faculty}
            </div>
          </div>
        </div>

        {/* Контакты и ссылка */}
        <div className="text-left md:text-right text-xs text-slate-500 space-y-1">
          <a
            href={`https://${program.website}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[#025a94] font-semibold hover:underline"
          >
            <span>{program.website}</span>
            <ExternalLink size={14} />
          </a>
          <div className="text-slate-400">{program.address}</div>
          <div className="text-slate-400 font-medium">{program.phone}</div>
        </div>
      </div>

      {/* 3. Сетка из 9 карточек характеристик (3 колонки x 3 ряда) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Карточка 1 */}
        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Ступень образования</span>
            <GraduationCap size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">{program.degree}</div>
        </div>

        {/* Карточка 2 */}
        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Форма обучения</span>
            <Calendar size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">{program.studyForm}</div>
        </div>

        {/* Карточка 3 */}
        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Срок обучения</span>
            <Clock size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">{program.duration}</div>
        </div>

        {/* Карточка 4 */}
        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Вступительные испытания</span>
            <FileText size={16} className="text-[#025a94]" />
          </div>
          <div className="text-sm font-bold text-slate-800 leading-snug">{program.exams}</div>
        </div>

        {/* Карточка 5 */}
        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">План набора</span>
            <Users size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">{program.plan}</div>
        </div>

        {/* Карточка 6 */}
        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Язык обучения</span>
            <Languages size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">{program.language}</div>
        </div>

        {/* Карточка 7 */}
        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Наличие Военной кафедры</span>
            <Shield size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">{program.militaryDepartment}</div>
        </div>

        {/* Карточка 8 */}
        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Наличие общежитий</span>
            <Home size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">{program.dormitory}</div>
        </div>

        {/* Карточка 9 */}
        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Факультет</span>
            <Building2 size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">ФМИТ</div>
        </div>
      </div>

      {/* 4. Подробное описание специальности */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Подробное описание специальности
        </h2>
        <div className="bg-[#f0f6fa] rounded-2xl p-6 text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4">
          {program.description.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* 5. Блок графика: Проходные баллы */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-800">Проходные баллы</h2>

          {/* Переключатель Бюджет / Платное */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setScoreType('budget')}
              className={`flex items-center gap-1.5 transition ${
                scoreType === 'budget' ? 'text-[#025a94]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${scoreType === 'budget' ? 'bg-[#025a94]' : 'bg-slate-300'}`}></span>
              Бюджет
            </button>
            <button
              onClick={() => setScoreType('paid')}
              className={`flex items-center gap-1.5 transition ${
                scoreType === 'paid' ? 'text-[#025a94]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${scoreType === 'paid' ? 'bg-[#025a94]' : 'bg-slate-300'}`}></span>
              Платное
            </button>
          </div>
        </div>

        {/* Внутренняя карточка графика */}
        <div className="bg-[#f0f6fa] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              ПОРОГОВЫЕ БАЛЛЫ (ПРОГНОЗ НА 2020–2026 ГГ.)
            </span>
            <span className="text-xs font-semibold text-[#025a94] bg-white px-3 py-1 rounded-full shadow-sm">
              За последний год: + 4 балла
            </span>
          </div>

          {/* Интерактивный график на Recharts */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#025a94" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#025a94" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="year" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={[190, 270]} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#025a94', 
                    borderRadius: '12px', 
                    border: 'none', 
                    color: '#fff', 
                    fontSize: '12px', 
                    fontWeight: 'bold' 
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#025a94" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#scoreGradient)" 
                  dot={{ r: 5, fill: '#fff', stroke: '#025a94', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#025a94' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}