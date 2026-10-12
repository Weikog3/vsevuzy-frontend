import React, { useState, useMemo } from 'react';
import FilterSidebar from './components/FilterSidebar';
import Catalog from './components/Catalog';
import ProgramDetail from './components/ProgramDetail';
import ChatSidebar from './components/ChatSidebar';
import { mockPrograms } from './data/mockData';

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
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [filters, setFilters] = useState(defaultFilters);

  // Обработчик изменения любого фильтра
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  // Реальная фильтрация массива программ на основе выбранных параметров
  const filteredPrograms = useMemo(() => {
    return mockPrograms.filter(prog => {
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
  }, [filters]);

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
        {selectedProgram ? (
          <ProgramDetail 
            program={selectedProgram} 
            onBack={() => setSelectedProgram(null)} 
          />
        ) : (
          <Catalog 
            programs={filteredPrograms} 
            onSelectProgram={(program) => setSelectedProgram(program)} 
            onResetFilters={handleResetFilters}
          />
        )}
      </main>

      {/* Правая панель ИИ-ассистента с настраиваемой шириной и фиксированной ручкой */}
      <ChatSidebar 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)} 
      />
    </div>
  );
}