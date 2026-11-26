import { useState, useMemo, useEffect } from 'react';
import FilterSidebar from './components/FilterSidebar';
import Catalog from './components/Catalog';
import ProgramDetail from './components/ProgramDetail';
import ChatSidebar from './components/ChatSidebar';
import { listAllPrograms, getProgram } from './api';

const PAGE_SIZE = 10;

const toList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

// Split by commas, but keep commas inside parentheses (e.g. «Творчество (рисунок, композиция)»).
const splitOutsideParentheses = (value) => {
  const result = [];
  let current = '';
  let depth = 0;

  for (const char of String(value || '')) {
    if (char === '(') depth += 1;
    if (char === ')') depth = Math.max(0, depth - 1);

    if (char === ',' && depth === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result.filter(Boolean);
};

const normalizeDuration = (value) => {
  const match = String(value || '').match(/\d+(?:[.,]\d+)?/);
  return match ? match[0].replace(',', '.') : '';
};

const defaultFilters = {
  university: '',
  minScore: '',
  city: [],
  studyForm: 'all', // 'all' | 'Очная' | 'Заочная'
  budget: true,
  paid: true,
  exams: [],
  specialty: [],
  keywords: [],
  language: 'all',
  duration: [],
  military: 'any', // 'any' | 'Есть' | 'Не указано'
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
  const [page, setPage] = useState(1);

  const loadPrograms = () => {
    setLoadingPrograms(true);
    setError(null);
    listAllPrograms()
      .then((data) => setPrograms(data))
      .catch((e) => setError(e.message || 'Неизвестная ошибка'))
      .finally(() => setLoadingPrograms(false));
  };

  useEffect(() => {
    let cancelled = false;
    listAllPrograms()
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
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
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

  const filterOptions = useMemo(() => {
    const uniqueSorted = (values) =>
      [...new Set(values.filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'ru'),
      );

    const cities = uniqueSorted(programs.map((program) => program.city));
    const exams = uniqueSorted(
      programs.flatMap((program) =>
        splitOutsideParentheses(program.exams),
      ),
    );
    const specialties = uniqueSorted(
      programs.map((program) => program.title),
    );
    const durations = [
      ...new Set(
        programs
          .map((program) => normalizeDuration(program.duration))
          .filter(Boolean),
      ),
    ].sort((a, b) => Number(a) - Number(b));

    return { cities, exams, specialties, durations };
  }, [programs]);

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

      // 3. Город (несколько значений через запятую)
      const cities = toList(filters.city);
      if (
        cities.length > 0 &&
        !cities.some((city) => contains(prog.city, city.toLowerCase()))
      ) {
        return false;
      }

      // 4. Форма обучения
      if (filters.studyForm !== 'all' && prog.studyForm !== filters.studyForm) {
        return false;
      }

      // 5. Форма оплаты: скрываем программы без соответствующих мест
      if (!filters.budget && prog.budgetScore == null) return false;
      if (!filters.paid && prog.paidScore == null) return false;

      // 6. Экзамены (любой из выбранных)
      const exams = toList(filters.exams);
      if (
        exams.length > 0 &&
        !exams.some((exam) => contains(prog.exams, exam.toLowerCase()))
      ) {
        return false;
      }

      // 7. Название специальности (любая из выбранных)
      const specialties = toList(filters.specialty);
      if (
        specialties.length > 0 &&
        !specialties.some((specialty) =>
          contains(prog.title, specialty.toLowerCase()),
        )
      ) {
        return false;
      }

      // 7a. Широкое направление (например IT): совпадение по названию или экзаменам
      if ((filters.keywords || []).length > 0) {
        const haystack = `${prog.title} ${prog.university} ${prog.exams}`.toLowerCase();
        if (!filters.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))) {
          return false;
        }
      }

      // 8. Язык
      if (filters.language !== 'all' && prog.language !== filters.language) {
        return false;
      }

      // 9. Срок обучения (любой из выбранных, без слов «года»/«лет»)
      const durations = toList(filters.duration)
        .map(normalizeDuration)
        .filter(Boolean);
      if (
        durations.length > 0 &&
        !durations.includes(normalizeDuration(prog.duration))
      ) {
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

  const totalPages = Math.max(1, Math.ceil(filteredPrograms.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

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
        page={currentPage}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
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
          options={filterOptions}
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
        onSetFilters={(updates) => {
          setFilters((prev) => ({ ...prev, ...updates }));
          setPage(1);
        }}
        onOpenProgram={handleSelectProgram}
        onGoBack={handleBack}
        onResetFilters={handleResetFilters}
        programs={programs}
      />
    </div>
  );
}