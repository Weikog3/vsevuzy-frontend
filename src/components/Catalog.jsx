import React from 'react';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Catalog({ programs, onSelectProgram }) {
  return (
    <div className="flex-1 p-6 lg:p-8 max-w-5xl w-full mx-auto flex flex-col min-h-screen">
      {/* Верхняя часть: Шапка и карточки */}
      <div>
        {/* Шапка каталога */}
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Результаты Поиска</h1>
          <span className="text-sm text-slate-400 font-medium">
            {programs.length} Подходящая программа
          </span>
        </div>

        {/* Сетка карточек */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {programs.map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Название университета */}
                <h2 className="text-base font-bold text-slate-800 leading-snug mb-1">
                  {prog.university}
                </h2>

                {/* Направление и код */}
                <div className="text-[#025a94] font-medium text-sm mb-0.5">
                  {prog.title}
                </div>
                <div className="text-xs text-slate-400 mb-5">
                  Код: {prog.code}
                </div>

                {/* Плашка с баллами */}
                <div className="bg-[#f0f6fa] rounded-2xl p-3 flex justify-around text-center mb-5">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      БЮДЖЕТ
                    </div>
                    <div className="text-xl font-bold text-[#025a94]">
                      {prog.budgetScore}
                    </div>
                  </div>
                  <div className="w-[1px] bg-slate-200"></div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      ПЛАТНОЕ
                    </div>
                    <div className="text-xl font-bold text-[#025a94]">
                      {prog.paidScore}
                    </div>
                  </div>
                </div>
              </div>

              {/* Подвал карточки */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin size={14} />
                  <span>{prog.city}</span>
                </div>

                <button
                  onClick={() => onSelectProgram(prog)}
                  className="bg-[#025a94] hover:bg-[#024a7b] text-white px-6 py-2 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
                >
                  Больше
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Нижняя часть: Пагинация в самом низу экрана (mt-auto) */}
      <div className="mt-auto pt-10 pb-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
        <button className="p-2 hover:bg-white rounded-lg text-slate-400 transition">
          <ChevronLeft size={16} />
        </button>

        <button className="w-8 h-8 rounded-full bg-[#025a94] text-white flex items-center justify-center shadow-sm">
          1
        </button>
        <button className="w-8 h-8 rounded-full hover:bg-white text-slate-600 flex items-center justify-center transition">
          2
        </button>
        <button className="w-8 h-8 rounded-full hover:bg-white text-slate-600 flex items-center justify-center transition">
          3
        </button>
        <span className="px-1 text-slate-400">...</span>
        <button className="w-8 h-8 rounded-full hover:bg-white text-slate-600 flex items-center justify-center transition">
          36
        </button>

        <button className="p-2 hover:bg-white rounded-lg text-slate-400 transition">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}