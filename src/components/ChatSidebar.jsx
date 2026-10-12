import React, { useState } from 'react';
import { Send, Bot, Menu } from 'lucide-react';

export default function ChatSidebar({ isOpen, onToggle }) {
  // Ширина окна: по умолчанию 340px, ограничена от 280px до 420px
  const [width, setWidth] = useState(340);

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
      text: 'Найдено множество специальностей! Воспользуйтесь фильтром формы оплаты «Бюджет» слева, чтобы увидеть все доступные варианты.'
    }
  ]);
  const [input, setInput] = useState('');

  // Интерактивное перетаскивание за сам синий ползунок
  const handleHandleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = isOpen ? width : 0;
    let hasMoved = false;

    const onMouseMove = (moveEvent) => {
      const delta = startX - moveEvent.clientX;
      if (Math.abs(delta) > 3) {
        hasMoved = true;
      }
      if (hasMoved) {
        // Ограничиваем ширину максимум до 420px, чтобы не сжимать вузы
        const newWidth = Math.min(Math.max(startWidth + delta, 280), 420);
        setWidth(newWidth);
        if (!isOpen) onToggle(); // если был закрыт — открываем при потягивании
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';

      // Если мы просто кликнули по ползунку без сдвига — переключаем открыть/закрыть
      if (!hasMoved) {
        onToggle();
      }
    };

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: input }]);
    const userText = input;
    setInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: `По запросу "${userText}": подходящие университеты отображаются в каталоге слева!`
      }]);
    }, 700);
  };

  return (
    <aside
      style={{ width: isOpen ? `${width}px` : '0px' }}
      className="relative bg-white border-l border-slate-200 flex flex-col h-screen sticky top-0 shadow-sm flex-shrink-0 z-40 transition-[width] duration-75"
    >
      {/* 
        САМ СИНИЙ ПОЛЗУНОК
        Он прикреплен к левому краю сайдбара и физически не может оторваться!
        Клик — свернуть/развернуть, потянуть влево/вправо — изменить ширину.
      */}
      <div
        onMouseDown={handleHandleMouseDown}
        className="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2 z-50 bg-[#025a94] text-white p-2 rounded-l-xl shadow-md hover:bg-[#024a7b] flex items-center justify-center cursor-ew-resize select-none active:scale-95 transition-transform"
        title="Потяните для изменения ширины или нажмите для открытия/закрытия"
      >
        <Menu size={18} />
      </div>

      {/* Содержимое чата отображается только когда окно открыто */}
      {isOpen && (
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Шапка чата */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#025a94]">
                <Bot size={20} />
              </div>
              <span className="font-semibold text-slate-800 text-sm">VseVuzy ИИ</span>
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
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
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
                className="absolute right-1.5 p-1.5 bg-[#025a94] text-white rounded-lg hover:bg-[#024a7b] transition cursor-pointer"
              >
                <Send size={15} />
              </button>
            </div>
          </form>
        </div>
      )}
    </aside>
  );
}