import { useState, useMemo, useEffect } from 'react';
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
  const [isChatOpen, setIsChatOpen] = useState(true);
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
    return programs.filter(prog => {
      // 1. Поиск по названию вуза
      if (filters.university.trim() && 
          !prog.university.toLowerCase().includes(filters.university.toLowerCase()) &&
          !prog.shortName.toLowerCase().includes(filters.university.toLowerCase())) {
        return false;
      }

      // 2. Минимальный балл (бюджет или платное)
      if (filters.minScore && !isNaN(Number(filters.minScore))) {
        const min = Number(filters.minScore);
        if (prog.budgetScore < min && prog.paidScore < min) return false;
      }

      // 3. Город
      if (filters.city.trim() && !prog.city.toLowerCase().includes(filters.city.toLowerCase())) {
        return false;
      }

      // 4. Форма обучения
      if (filters.studyForm !== 'all' && prog.studyForm !== filters.studyForm) {
        return false;
      }

      // 5. Экзамены
      if (filters.exams.trim() && !prog.exams.toLowerCase().includes(filters.exams.toLowerCase())) {
        return false;
      }

      // 6. Название специальности
      if (filters.specialty.trim() && !prog.title.toLowerCase().includes(filters.specialty.toLowerCase())) {
        return false;
      }

      // 7. Язык
      if (filters.language !== 'all' && prog.language !== filters.language) {
        return false;
      }

      // 8. Военная кафедра
      if (filters.military !== 'any' && prog.militaryDepartment !== filters.military) {
        return false;
      }

      // 9. Ступень образования
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
          <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
            Загрузка программы...
          </div>
        );
      }
      return (
        <div className="flex-1 p-10">
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
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
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          Загрузка...
        </div>
      );
    }

    if (error && programs.length === 0) {
      return (
        <div className="flex-1 p-10">
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-sm">
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
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Левая панель фильтров (видна на странице каталога) */}
      {!selectedProgram && (
        <FilterSidebar 
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          onSearch={() => {}}
        />
      )}

      {/* Центральная зона: Каталог либо Детальная страница */}
      <main className="flex-1 flex flex-col min-w-0">
        {renderMain()}
      </main>

      {/* Правая панель ИИ-ассистента с настраиваемой шириной и фиксированной ручкой */}
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