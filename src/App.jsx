import { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, Bot, GraduationCap, ArrowLeft } from 'lucide-react';
import FilterSidebar from './components/FilterSidebar';
import Catalog from './components/Catalog';
import ProgramDetail from './components/ProgramDetail';
import ChatSidebar from './components/ChatSidebar';
import { listPrograms, getProgram } from './api';

const defaultFilters = {
  university: '',
  minScore: '',
  city: '',
  studyForm: 'all', // 'all' | 'Очная' | 'Заочная'
  budget: true,
  paid: true,
  exams: '',
  specialty: '',
  language: 'all',
  duration: '',
  military: 'any', // 'any' | 'Есть' | 'Нет'
  degrees: ['Бакалавриат', 'Магистратура', 'Специальное'],
};

export default function App() {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);
  // На ПК чат открыт сразу, на мобильных — закрыт, чтобы не перекрывать экран
  const [isChatOpen, setIsChatOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  const loadPrograms = () => {
    setLoadingPrograms(true);
    setError(null);
    listPrograms('?limit=100')
      .then((data) => setPrograms(data))
      .catch((e) => setError(e.message || 'Неизвестная ошибка'))
      .finally(() => setLoadingPrograms(false));
  };

  useEffect(() => {
    let cancelled = false;
    listPrograms('?limit=100')
      .then((data) => {
        if (cancelled) return;
        setPrograms(data);
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Неизвестная ошибка');
      })
      .finally(() => {
        if (!cancelled) setLoadingPrograms(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Обработчик изменения любого фильтра
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  // Открытие программы: подгружаем полные данные (с историей баллов) по id
  const handleSelectProgram = (program) => {
    setSelectedProgram(program);
    setSelectedDetail(null);
    setLoadingDetail(true);
    setError(null);
    setIsFiltersOpen(false);
    getProgram(program.id)
      .then((detail) => setSelectedDetail(detail))
      .catch((e) => setError(e.message || 'Неизвестная ошибка'))
      .finally(() => setLoadingDetail(false));
  };

  const handleBack = () => {
    setSelectedProgram(null);
    setSelectedDetail(null);
  };

  // Фильтрация массива программ на основе выбранных параметров
  const filteredPrograms = useMemo(() => {
    const contains = (value, needle) =>
      typeof value === 'string' && value.toLowerCase().includes(needle);

    return programs.filter(prog => {
      // 1. Поиск по названию вуза
      if (filters.university.trim() &&
          !contains(prog.university, filters.university.toLowerCase()) &&
          !contains(prog.shortName, filters.university.toLowerCase())) {
        return false;
      }

      // 2. Минимальный балл (программа подходит, если хотя бы один балл не ниже порога)
      if (filters.minScore && !isNaN(Number(filters.minScore))) {
        const min = Number(filters.minScore);
        const budgetOk = prog.budgetScore != null && prog.budgetScore >= min;
        const paidOk = prog.paidScore != null && prog.paidScore >= min;
        if (!budgetOk && !paidOk) return false;
      }

      // 3. Город
      if (filters.city.trim() && !contains(prog.city, filters.city.toLowerCase())) {
        return false;
      }

      // 4. Форма обучения
      if (filters.studyForm !== 'all' && prog.studyForm !== filters.studyForm) {
        return false;
      }

      // 5. Форма оплаты: скрываем программы без соответствующих мест
      if (!filters.budget && prog.budgetScore == null) return false;
      if (!filters.paid && prog.paidScore == null) return false;

      // 6. Экзамены
      if (filters.exams.trim() && !contains(prog.exams, filters.exams.toLowerCase())) {
        return false;
      }

      // 7. Название специальности
      if (filters.specialty.trim() && !contains(prog.title, filters.specialty.toLowerCase())) {
        return false;
      }

      // 8. Язык
      if (filters.language !== 'all' && prog.language !== filters.language) {
        return false;
      }

      // 9. Срок обучения
      if (filters.duration.trim() && !contains(prog.duration, filters.duration.toLowerCase())) {
        return false;
      }

      // 10. Военная кафедра
      if (filters.military !== 'any' && prog.militaryDepartment !== filters.military) {
        return false;
      }

      // 11. Ступень образования
      if (filters.degrees.length > 0 && !filters.degrees.includes(prog.degree)) {
        return false;
      }

      return true;
    });
  }, [filters, programs]);

  const renderMain = () => {
    if (selectedProgram) {
      if (selectedDetail) {
        return <ProgramDetail program={selectedDetail} onBack={handleBack} />;
      }
      if (loadingDetail) {
        return (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-16">
            Загрузка программы...
          </div>
        );
      }
      return (
        <div className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="bg-white rounded-3xl p-6 sm:p-10 text-center border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 mb-1">Не удалось загрузить программу</h3>
            {error && <p className="text-xs text-slate-400 mb-6">{error}</p>}
            <button
              onClick={handleBack}
              className="bg-[#025a94] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#024a7b] transition cursor-pointer"
            >
              Вернуться к списку
            </button>
          </div>
        </div>
      );
    }

    if (loadingPrograms) {
      return (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-16">
          Загрузка...
        </div>
      );
    }

    if (error && programs.length === 0) {
      return (
        <div className="flex-1 p-4 sm:p-6 lg:p-10">
          <div className="bg-white rounded-3xl p-6 sm:p-10 text-center border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 mb-1">Не удалось загрузить данные</h3>
            {error && <p className="text-xs text-slate-400 mb-6">{error}</p>}
            <button
              onClick={loadPrograms}
              className="bg-[#025a94] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#024a7b] transition cursor-pointer"
            >
              Повторить
            </button>
          </div>
        </div>
      );
    }

    return (
      <Catalog
        programs={filteredPrograms}
        onSelectProgram={handleSelectProgram}
        onResetFilters={handleResetFilters}
      />
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc]">
      {/* Мобильная верхняя шапка (видна только на экранах < 1024px) */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        {!selectedProgram ? (
          <button
            type="button"
            onClick={() => {
              setIsChatOpen(false);
              setIsFiltersOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            <SlidersHorizontal size={15} className="text-[#025a94]" />
            <span>Фильтры</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#025a94] text-xs font-semibold transition cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Назад</span>
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#025a94] flex items-center justify-center text-white shadow-sm">
            <GraduationCap size={16} />
          </div>
          <span className="text-base font-bold text-[#025a94]">VseVuzy</span>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsFiltersOpen(false);
            setIsChatOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#025a94] hover:bg-[#024a7b] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          <Bot size={15} />
          <span>ИИ</span>
        </button>
      </header>

      {/* Левая панель фильтров (видна на странице каталога) */}
      {!selectedProgram && (
        <FilterSidebar
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          onSearch={() => setIsFiltersOpen(false)}
          isMobileOpen={isFiltersOpen}
          onMobileClose={() => setIsFiltersOpen(false)}
        />
      )}

      {/* Центральная зона: Каталог либо Детальная страница */}
      <main className="flex-1 flex flex-col min-w-0">
        {renderMain()}
      </main>

      {/* Правая панель ИИ-ассистента со стрелочкой и мобильной шторкой */}
      <ChatSidebar
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        onSetFilters={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
        onOpenProgram={handleSelectProgram}
        onGoBack={handleBack}
        onResetFilters={handleResetFilters}
        programs={programs}
      />
    </div>
  );
}