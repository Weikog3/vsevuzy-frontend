import React, { useState } from 'react';
import FilterSidebar from './components/FilterSidebar';
import Catalog from './components/Catalog';
import ProgramDetail from './components/ProgramDetail';
import ChatSidebar from './components/ChatSidebar';
import { mockPrograms } from './data/mockData';

export default function App() {
  // selectedProgram: null означает, что мы на странице Каталога.
  // Если здесь объект программы — открывается детальная страница.
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* 1. Панель фильтров показывается только на странице поиска */}
      {!selectedProgram && (
        <FilterSidebar onSearch={() => console.log('Поиск')} />
      )}

      {/* 2. Центральная область: либо Каталог, либо Детальная страница */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedProgram ? (
          <ProgramDetail 
            program={selectedProgram} 
            onBack={() => setSelectedProgram(null)} 
          />
        ) : (
          <Catalog 
            programs={mockPrograms} 
            onSelectProgram={(program) => setSelectedProgram(program)} 
          />
        )}
      </main>

      {/* 3. Правая панель ИИ-ассистента (доступна на обеих страницах) */}
      <ChatSidebar 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)} 
      />
    </div>
  );
}