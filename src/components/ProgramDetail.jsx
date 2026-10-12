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

export default function ProgramDetail({ program, onBack }) {
  const [scoreType, setScoreType] = useState('budget'); // 'budget' | 'paid'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Данные для графика
  const chartData = [
    { year: "2020", score: 228 },
    { year: "2021", score: 232 },
    { year: "2022", score: 238 },
    { year: "2023", score: 242 },
    { year: "2024", score: 246 },
    { year: "2025", score: 250 },
    { year: "2026", score: 254 },
  ];

  // Математика для точного SVG графика
  const minScore = 200;
  const maxScore = 265;
  const chartWidth = 650;
  const chartHeight = 180;
  const paddingX = 40;
  const paddingY = 20;

  const points = chartData.map((d, index) => {
    const x = paddingX + (index / (chartData.length - 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((d.score - minScore) / (maxScore - minScore)) * (chartHeight - paddingY * 2);
    return { ...d, x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto overflow-y-auto">
      {/* 1. Кнопка возврата назад */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-[#025a94] hover:text-[#024a7b] mb-6 transition group cursor-pointer"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Вернуться к результатам поиска
      </button>

      {/* 2. Главная плашка вуза и специальности */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
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

      {/* 3. Сетка характеристик */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Ступень образования</span>
            <GraduationCap size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">{program.degree}</div>
        </div>

        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Форма обучения</span>
            <Calendar size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">{program.studyForm}</div>
        </div>

        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Срок обучения</span>
            <Clock size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">{program.duration}</div>
        </div>

        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Вступительные испытания</span>
            <FileText size={16} className="text-[#025a94]" />
          </div>
          <div className="text-sm font-bold text-slate-800 leading-snug">{program.exams}</div>
        </div>

        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">План набора</span>
            <Users size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">{program.plan}</div>
        </div>

        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Язык обучения</span>
            <Languages size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">{program.language}</div>
        </div>

        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Наличие Военной кафедры</span>
            <Shield size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">{program.militaryDepartment}</div>
        </div>

        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Наличие общежитий</span>
            <Home size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">{program.dormitory}</div>
        </div>

        <div className="bg-[#f0f6fa] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-medium">Факультет</span>
            <Building2 size={16} className="text-[#025a94]" />
          </div>
          <div className="text-base font-bold text-slate-800">ФМИТ</div>
        </div>
      </div>

      {/* 4. Описание */}
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

      {/* 5. Интерактивный график проходных баллов (SVG 1:1 по Figma) */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-800">Проходные баллы</h2>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => setScoreType('budget')}
              className={`flex items-center gap-1.5 transition cursor-pointer ${
                scoreType === 'budget' ? 'text-[#025a94]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${scoreType === 'budget' ? 'bg-[#025a94]' : 'bg-slate-300'}`}></span>
              Бюджет
            </button>
            <button
              onClick={() => setScoreType('paid')}
              className={`flex items-center gap-1.5 transition cursor-pointer ${
                scoreType === 'paid' ? 'text-[#025a94]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${scoreType === 'paid' ? 'bg-[#025a94]' : 'bg-slate-300'}`}></span>
              Платное
            </button>
          </div>
        </div>

        <div className="bg-[#f0f6fa] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              ПОРОГОВЫЕ БАЛЛЫ (ПРОГНОЗ НА 2020–2026 ГГ.)
            </span>
            <span className="text-xs font-semibold text-[#025a94] bg-white px-3 py-1 rounded-full shadow-sm">
              За последний год: + 4 балла
            </span>
          </div>

          {/* SVG График */}
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full h-auto min-w-[500px]">
              <defs>
                <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#025a94" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#025a94" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Горизонтальные сетки и подписи Y */}
              {[200, 220, 240, 260].map((val) => {
                const y = chartHeight - paddingY - ((val - minScore) / (maxScore - minScore)) * (chartHeight - paddingY * 2);
                return (
                  <g key={val}>
                    <line x1={paddingX - 10} y1={y} x2={chartWidth - paddingX + 10} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                    <text x={paddingX - 25} y={y + 4} fill="#94a3b8" fontSize="11" textAnchor="end" fontWeight="500">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Заливка области */}
              <path d={areaPath} fill="url(#scoreAreaGradient)" />

              {/* Основная линия */}
              <path d={linePath} fill="none" stroke="#025a94" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {/* Точки значений с подписями */}
              {points.map((p, idx) => (
                <g 
                  key={p.year}
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer"
                >
                  {/* Подпись балла над точкой */}
                  <text 
                    x={p.x} 
                    y={p.y - 10} 
                    fill="#025a94" 
                    fontSize="11" 
                    fontWeight="bold" 
                    textAnchor="middle"
                  >
                    {p.score}{idx === points.length - 1 ? '*' : ''}
                  </text>

                  {/* Белая точка с синей каймой */}
                  <circle cx={p.x} cy={p.y} r="5.5" fill="#ffffff" stroke="#025a94" strokeWidth="2.5" />

                  {/* Подпись года снизу */}
                  <text 
                    x={p.x} 
                    y={chartHeight + 15} 
                    fill={idx >= points.length - 2 ? '#025a94' : '#64748b'} 
                    fontSize="11" 
                    fontWeight={idx >= points.length - 2 ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {p.year}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}