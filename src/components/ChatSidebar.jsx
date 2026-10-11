import React, { useState } from 'react';
import { Send, Bot, Menu, ChevronRight } from 'lucide-react';

export default function ChatSidebar({ isOpen, onToggle }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Здравствуйте! Спрашивайте меня о чем угодно, касающемся поступления в университет: о сроках подачи документов, средних проходных баллах или стоимости обучения.'
    },
    {
      id: 2,
      sender: 'user',
      text: 'Какие программы в области компьютерных наук полностью финансируются государством?'
    },
    {
      id: 3,
      sender: 'bot',
      text: 'Найдено 24 специализации в области компьютерных наук с финансированием. Фильтр 5. Чтобы просмотреть их, воспользуйтесь опцией «Формы оплаты» на панели слева!'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: input }]);
    const userText = input;
    setInput('');

    // Имитация ответа ИИ через 800мс
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: `По запросу "${userText}": вы можете отфильтровать программы в левой панели или посмотреть детальную информацию о выбранном вузе!`
      }]);
    }, 800);
  };

  return (
    <div className="relative flex">
      {/* Кнопка-язычок для открытия/закрытия панели */}
      <button
        onClick={onToggle}
        className="absolute -left-6 top-1/2 -translate-y-1/2 bg-[#025a94] text-white p-1 rounded-l-md shadow-md hover:bg-[#024a7b] z-20 transition"
        title={isOpen ? "Свернуть ассистент" : "Открыть ассистент"}
      >
        <Menu size={16} />
      </button>

      {/* Сама панель */}
      {isOpen && (
        <aside className="w-80 md:w-96 bg-white border-l border-slate-200 flex flex-col h-screen sticky top-0 shadow-sm transition-all">
          {/* Шапка чата */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#025a94]">
                <Bot size={20} />
              </div>
              <span className="font-semibold text-slate-800">VseVuzy ИИ</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
          </div>

          {/* Список сообщений */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-[#025a94] flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={15} />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#025a94] text-white rounded-tr-none'
                      : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Поле ввода */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-100 bg-white">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ваш вопрос о поступлении..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3.5 pr-10 text-xs sm:text-sm focus:outline-none focus:border-[#025a94] focus:bg-white transition"
              />
              <button
                type="submit"
                className="absolute right-1.5 p-1.5 bg-[#025a94] text-white rounded-lg hover:bg-[#024a7b] transition"
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        </aside>
      )}
    </div>
  );
}