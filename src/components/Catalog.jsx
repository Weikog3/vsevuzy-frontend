import React from 'react';
import { MapPin, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';

export default function Catalog({ programs, onSelectProgram, onResetFilters }) {
  return (
    <div className="flex-1 p-6 lg:p-8 max-w-5xl w-full mx-auto flex flex-col min-h-screen">
      <div>
        {/* Шапка каталога */}
        <div className="flex items-baseline justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Результаты Поиска</h1>
          <span className="text-sm text-slate-400 font-medium">
            {programs.length} {programs.length === 1 ? 'Подходящая программа' : 'Подходящих программ'}
          </span>
        </div>

        {/* Если ничего не найдено */}
        {programs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm my-8">
            <SearchX size={48} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">Ничего не найдено</h3>
            <p className="text-xs text-slate-400 mb-6">Попробуйте изменить или смягчить критерии фильтрации</p>
            <button
              onClick={onResetFilters}
              className="bg-[#025a94] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#024a7b] transition cursor-pointer"
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          /* Сетка карточек */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {programs.map((prog) => (
              <div
                key={prog.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-base font-bold text-slate-800 leading-snug mb-1">
                    {prog.university}
                  </h2>
                  <div className="text-[#025a94] font-medium text-sm mb-0.5">
                    {prog.title}
                  </div>
                  <div className="text-xs text-slate-400 mb-4">
                    Код: {prog.code}
                  </div>

                  {/* Плашка с баллами (БЮДЖЕТ И ПЛАТНОЕ) */}
                  <div className="bg-[#f0f6fa] rounded-2xl py-3 px-4 flex items-center justify-around text-center my-3">
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        БЮДЖЕТ
                      </div>
                      <div className="text-xl font-extrabold text-[#025a94] leading-tight">
                        {prog.budgetScore ?? 400}
                      </div>
                    </div>
                    <div className="w-[1px] h-8 bg-slate-200"></div>
                    <div className="flex-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        ПЛАТНОЕ
                      </div>
                      <div className="text-xl font-extrabold text-[#025a94] leading-tight">
                        {prog.paidScore ?? 399}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Подвал карточки: защита от наложения города и кнопки */}
                <div className="flex items-center justify-between pt-2 mt-auto gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
                    <MapPin size={14} className="flex-shrink-0 text-slate-400" />
                    <span className="truncate">{prog.city}</span>
                  </div>

                  <button
                    onClick={() => onSelectProgram(prog)}
                    className="bg-[#025a94] hover:bg-[#024a7b] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer flex-shrink-0"
                  >
                    Больше
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Пагинация */}
      <div className="mt-auto pt-10 pb-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
        <button className="p-2 hover:bg-white rounded-lg text-slate-400 transition cursor-pointer">
          <ChevronLeft size={16} />
        </button>

        <button className="w-8 h-8 rounded-full bg-[#025a94] text-white flex items-center justify-center shadow-sm">
          1
        </button>
        <button className="w-8 h-8 rounded-full hover:bg-white text-slate-600 flex items-center justify-center transition cursor-pointer">
          2
        </button>
        <button className="w-8 h-8 rounded-full hover:bg-white text-slate-600 flex items-center justify-center transition cursor-pointer">
          3
        </button>
        <span className="px-1 text-slate-400">...</span>
        <button className="w-8 h-8 rounded-full hover:bg-white text-slate-600 flex items-center justify-center transition cursor-pointer">
          36
        </button>

        <button className="p-2 hover:bg-white rounded-lg text-slate-400 transition cursor-pointer">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}