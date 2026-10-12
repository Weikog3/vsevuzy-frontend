import React from 'react';
import { 
  GraduationCap, 
  RotateCcw, 
  BarChart2, 
  MapPin, 
  Monitor, 
  CreditCard, 
  FileText, 
  Compass, 
  Languages, 
  Clock, 
  Shield, 
  Award,
  Search
} from 'lucide-react';

export default function FilterSidebar({ filters, onChange, onReset, onSearch }) {
  const handleDegreeToggle = (deg) => {
    const current = filters.degrees || [];
    const updated = current.includes(deg)
      ? current.filter(d => d !== deg)
      : [...current, deg];
    onChange('degrees', updated);
  };

  return (
    <aside className="w-72 sm:w-80 bg-white border-r border-slate-100 p-5 flex flex-col h-screen sticky top-0 overflow-y-auto flex-shrink-0 z-20">
      {/* Логотип */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#025a94] flex items-center justify-center text-white shadow-sm">
          <GraduationCap size={24} />
        </div>
        <div>
          <div className="text-xl font-bold text-[#025a94] leading-tight">VseVuzy</div>
          <div className="text-[10px] text-slate-400 font-medium tracking-wide">ПОМОЩЬ АБИТУРИЕНТУ</div>
        </div>
      </div>

      {/* Заголовок фильтров */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <h2 className="font-bold text-slate-800 text-lg">Фильтры</h2>
        <button 
          type="button" 
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-[#025a94] transition flex items-center gap-1 font-medium cursor-pointer"
        >
          <RotateCcw size={12} />
          Сбросить
        </button>
      </div>

      <div className="space-y-4 text-xs text-slate-600">
        {/* 1. ВУЗы */}
        <div>
          <div className="flex items-center justify-between mb-1 text-slate-700 font-semibold">
            <span>1. ВУЗы</span>
            <GraduationCap size={14} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Название ВУЗа (напр. БГУИР)"
            value={filters.university}
            onChange={(e) => onChange('university', e.target.value)}
            className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-[#025a94] outline-none transition"
          />
        </div>

        {/* 2. Баллы */}
        <div>
          <div className="flex items-center justify-between mb-1 text-slate-700 font-semibold">
            <span>2. Баллы (минимальный порог)</span>
            <BarChart2 size={14} className="text-slate-400" />
          </div>
          <input
            type="number"
            placeholder="Например: 350"
            value={filters.minScore}
            onChange={(e) => onChange('minScore', e.target.value)}
            className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-[#025a94] outline-none transition"
          />
        </div>

        {/* 3. Город */}
        <div>
          <div className="flex items-center justify-between mb-1 text-slate-700 font-semibold">
            <span>3. Город</span>
            <MapPin size={14} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Витебск, Минск, Брест..."
            value={filters.city}
            onChange={(e) => onChange('city', e.target.value)}
            className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-[#025a94] outline-none transition"
          />
        </div>

        {/* 4. Форма обучения */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-slate-700 font-semibold">
            <span>4. Форма обучения</span>
            <Monitor size={14} className="text-slate-400" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 bg-[#f1f5f9] p-1 rounded-xl text-[11px]">
            {[
              { id: 'all', label: 'Все' },
              { id: 'Очная', label: 'Очная' },
              { id: 'Заочная', label: 'Заочная' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange('studyForm', item.id)}
                className={`py-1.5 rounded-lg text-center font-medium transition cursor-pointer ${
                  filters.studyForm === item.id
                    ? 'bg-[#bce0fd] text-[#025a94] shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Форма оплаты */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-slate-700 font-semibold">
            <span>5. Форма оплаты</span>
            <CreditCard size={14} className="text-slate-400" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.budget}
                onChange={(e) => onChange('budget', e.target.checked)}
                className="rounded accent-[#025a94]"
              />
              <span>Бюджет</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.paid}
                onChange={(e) => onChange('paid', e.target.checked)}
                className="rounded accent-[#025a94]"
              />
              <span>Платная</span>
            </label>
          </div>
        </div>

        {/* 6. Экзамены */}
        <div>
          <div className="flex items-center justify-between mb-1 text-slate-700 font-semibold">
            <span>6. Экзамены</span>
            <FileText size={14} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Физика, Математика..."
            value={filters.exams}
            onChange={(e) => onChange('exams', e.target.value)}
            className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-[#025a94] outline-none transition"
          />
        </div>

        {/* 7. Специальности */}
        <div>
          <div className="flex items-center justify-between mb-1 text-slate-700 font-semibold">
            <span>7. Специальности</span>
            <Compass size={14} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Программная инженерия, ИИ..."
            value={filters.specialty}
            onChange={(e) => onChange('specialty', e.target.value)}
            className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-[#025a94] outline-none transition"
          />
        </div>

        {/* 8. Язык обучения */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-slate-700 font-semibold">
            <span>8. Язык обучения</span>
            <Languages size={14} className="text-slate-400" />
          </div>
          <div className="flex gap-1.5 bg-[#f1f5f9] p-1 rounded-xl">
            {[
              { id: 'all', label: 'Любой' },
              { id: 'Русский', label: 'Русский' },
              { id: 'Белорусский', label: 'Белор.' },
              { id: 'Английский', label: 'Англ.' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange('language', item.id)}
                className={`flex-1 py-1 rounded-lg text-center font-medium transition text-[10px] cursor-pointer ${
                  filters.language === item.id
                    ? 'bg-[#025a94] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 9. Срок образования */}
        <div>
          <div className="flex items-center justify-between mb-1 text-slate-700 font-semibold">
            <span>9. Срок образования</span>
            <Clock size={14} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="4 года, 5 лет..."
            value={filters.duration}
            onChange={(e) => onChange('duration', e.target.value)}
            className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-3 py-2 text-xs focus:bg-white focus:border-[#025a94] outline-none transition"
          />
        </div>

        {/* 10. Наличие военной кафедры */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-slate-700 font-semibold">
            <span>10. Наличие военной кафедры</span>
            <Shield size={14} className="text-slate-400" />
          </div>
          <div className="flex gap-3">
            {[
              { id: 'Есть', label: 'Да' },
              { id: 'Нет', label: 'Нет' },
              { id: 'any', label: 'Неважно' },
            ].map(item => (
              <label key={item.id} className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="military"
                  checked={filters.military === item.id}
                  onChange={() => onChange('military', item.id)}
                  className="accent-[#025a94]"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 11. Ступень образования */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-slate-700 font-semibold">
            <span>11. Ступень образования</span>
            <Award size={14} className="text-slate-400" />
          </div>
          <div className="space-y-1.5">
            {['Бакалавриат', 'Магистратура', 'Специальное'].map(deg => (
              <label key={deg} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.degrees || []).includes(deg)}
                  onChange={() => handleDegreeToggle(deg)}
                  className="rounded accent-[#025a94]"
                />
                <span>{deg}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Кнопка Поиск */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          onClick={onSearch}
          className="w-full bg-[#025a94] hover:bg-[#024a7b] text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer"
        >
          <Search size={16} />
          Поиск
        </button>
      </div>
    </aside>
  );
}