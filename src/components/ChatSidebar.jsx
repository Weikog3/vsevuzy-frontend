import { useState, useEffect, useRef } from "react";
import { Send, Bot, Menu, Key, Copy, AlertCircle, Check } from "lucide-react";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/free";

export default function ChatSidebar({
  isOpen,
  onToggle,
  onSetFilters,
  onOpenProgram,
  onGoBack,
  onResetFilters,
  programs,
}) {
  const [width, setWidth] = useState(340);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Здравствуйте! Я ваш ИИ-ассистент по поступлению в университет. Спрашивайте о программах, проходных баллах, бюджете, форме обучения и т.д.",
    },
  ]);
  const [input, setInput] = useState("");

  const [apiKey, setApiKey] = useState(
    () => sessionStorage.getItem("openrouter_api_key") || "",
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [streaming, setStreaming] = useState(false);

  const messagesEndRef = useRef(null);

  const validateKey = async (key) => {
    setIsValidating(true);
    setError("");
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "VseVuzy",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content: "Привет" }],
          max_tokens: 20,
        }),
      });
      if (res.status === 401 || res.status === 403) {
        setError("Неверный ключ");
        setIsAuthenticated(false);
        sessionStorage.removeItem("openrouter_api_key");
      } else if (res.status === 429) {
        // Key accepted but rate-limited — still treat as valid
        setIsAuthenticated(true);
        sessionStorage.setItem("openrouter_api_key", key);
        setError("");
      } else if (!res.ok) {
        // Other server error — key format may still be valid; accept and let real request confirm
        setIsAuthenticated(true);
        sessionStorage.setItem("openrouter_api_key", key);
        setError("");
      } else {
        setIsAuthenticated(true);
        sessionStorage.setItem("openrouter_api_key", key);
      }
    } catch {
      setError("Нет соединения с сервером");
      setIsAuthenticated(false);
      sessionStorage.removeItem("openrouter_api_key");
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (apiKey) {
      const t = setTimeout(() => validateKey(apiKey), 0);
      return () => clearTimeout(t);
    }
  }, [apiKey]);

  const handleContinue = () => {
    if (apiKey.trim()) validateKey(apiKey.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setApiKey(text);
      setError("");
    } catch {
      // clipboard access denied or unavailable
    }
  };

  const handleKeyIconClick = () => {
    setApiKey("");
    setIsAuthenticated(false);
    setError("");
    sessionStorage.removeItem("openrouter_api_key");
  };

  const systemPrompt = `Ты — ИИ-ассистент сайта VseVuzy (абитуриенты, поступление в вузы Беларуси).

Доступные программы:
${JSON.stringify(
  programs.map((p) => ({
    id: p.id,
    university: p.university,
    title: p.title,
    city: p.city,
    degree: p.degree,
    budgetScore: p.budgetscore,
    paidScore: p.paidscore,
    studyForm: p.studyForm,
    language: p.language,
    duration: p.duration,
    exams: p.exams,
    military: p.militaryDepartment,
  })),
  null,
  2,
)}

Отвечай на вопросы о программах на основе этих данных.

ТЫ ДОЛЖЕН использовать следующие команды в конце ответа (каждая с новой строки):
- Установить фильтр: [ФИЛЬТР] ключ=значение
  Ключи: university, minScore, city, studyForm, budget, paid, exams, specialty, language, duration, military, degrees
  Пример: [ФИЛЬТР] city=Минск
  Пример: [ФИЛЬТР] degrees=Бакалавриат,Магистратура
- Открыть программу: [ПРОГРАММА] id=N
- Вернуться к поиску: [ВЕРНУТЬСЯ]
- Сбросить фильтры: [СБРОСИТЬ_ФИЛЬТРЫ]

Если действие не нужно — не добавляй команды, просто ответь текстом.
Будь кратким и отвечай на русском языке.`;

  const handleHandleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = isOpen ? width : 0;
    let hasMoved = false;
    const onMouseMove = (moveEvent) => {
      const delta = startX - moveEvent.clientX;
      if (Math.abs(delta) > 3) hasMoved = true;
      if (hasMoved) {
        const newWidth = Math.min(Math.max(startWidth + delta, 280), 650);
        setWidth(newWidth);
        if (!isOpen) onToggle();
      }
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      if (!hasMoved) onToggle();
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "ew-resize";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const applyActions = (text) => {
    const filterRegex = /\[ФИЛЬТР\]\s*(\w+)=([^\n\r]+)/g;
    const programRegex = /\[ПРОГРАММА\]\s*id=(\d+)/g;
    const backRegex = /\[ВЕРНУТЬСЯ\]/g;
    const resetRegex = /\[СБРОСИТЬ_ФИЛЬТРЫ\]/g;
    let match;
    const updates = {};
    let wentBack = false;
    let filtersReset = false;
    while ((match = filterRegex.exec(text)) !== null) {
      const key = match[1];
      const raw = match[2].trim();
      if (key === "degrees") {
        updates.degrees = raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (key === "budget" || key === "paid") {
        updates[key] = raw === "true" || raw === "1";
      } else {
        updates[key] = raw;
      }
    }
    while ((match = programRegex.exec(text)) !== null) {
      const id = Number(match[1]);
      const prog = programs.find((p) => p.id === id);
      if (prog) onOpenProgram(prog);
    }
    while (backRegex.test(text)) {
      onGoBack();
      wentBack = true;
    }
    while (resetRegex.test(text)) {
      onResetFilters();
      filtersReset = true;
    }
    return { updates, wentBack, filtersReset };
  };

  const ACTION_REMINDER = `\n\nНапоминание: используй команды [ФИЛЬТР] ключ=значение, [ПРОГРАММА] id=N, [ВЕРНУТЬСЯ], [СБРОСИТЬ_ФИЛЬТРЫ] в конце ответа, если нужно выполнить действие.`;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !isAuthenticated || streaming) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: userText },
    ]);
    setStreaming(true);

    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "VseVuzy",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.slice(1).map((m) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.sender === "user" ? m.text + ACTION_REMINDER : m.text,
            })),
            { role: "user", content: userText + ACTION_REMINDER },
          ],
          max_tokens: 800,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        setError("Неверный ключ");
        setIsAuthenticated(false);
        sessionStorage.removeItem("openrouter_api_key");
        setStreaming(false);
        return;
      }
      if (res.status === 429) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: "bot",
            text: "Превышен дневной лимит бесплатных запросов к OpenRouter. Попробуйте позже или завтра.",
          },
        ]);
        setStreaming(false);
        return;
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Ошибка API: ${res.status} ${errText}`);
      }

      const data = await res.json();
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Пустой ответ от модели");
      }
      const raw = data.choices[0].message.content || "";

      const { updates, wentBack, filtersReset } = applyActions(raw);
      if (Object.keys(updates).length > 0) {
        onSetFilters(updates);
      }

      const clean = raw
        .replace(/\[ФИЛЬТР\][^\n\r]*/g, "")
        .replace(/\[ПРОГРАММА\][^\n\r]*/g, "")
        .replace(/\[ВЕРНУТЬСЯ\]/g, "")
        .replace(/\[СБРОСИТЬ_ФИЛЬТРЫ\]/g, "")
        .trim();

      let reply = clean || "Готово!";
      if (Object.keys(updates).length > 0) {
        reply += "\n\n✅ Фильтры обновлены.";
      }
      if (wentBack) {
        reply += "\n\n🔙 Вернулись к поиску программ.";
      }
      if (filtersReset) {
        reply += "\n\n🔄 Все фильтры сброшены.";
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: `Ошибка: ${err.message || "Попробуйте позже."}`,
        },
      ]);
    } finally {
      setStreaming(false);
    }
  };

  const escapeHtml = (str) =>
    str.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );

  const parseBold = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/);
    return parts.map((part, idx) => {
      if (!part) return null;
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const renderAiText = (text) => {
    const paragraphs = text.split(/\n\n+/);
    return paragraphs.map((para, pIdx) => {
      const lines = para.split(/\n/);
      return (
        <div key={pIdx} className="mb-2 last:mb-0">
          {lines.map((line, lIdx) => (
            <>
              {parseBold(escapeHtml(line))}
              {lIdx < lines.length - 1 && <br />}
            </>
          ))}
        </div>
      );
    });
  };

  return (
    <aside
      style={{ width: isOpen ? `${width}px` : "0px" }}
      className="relative bg-white border-l border-slate-200 flex flex-col h-screen sticky top-0 shadow-sm flex-shrink-0 z-40 transition-[width] duration-75"
    >
      <div
        onMouseDown={handleHandleMouseDown}
        className="absolute left-0 -translate-x-full top-1/2 -translate-y-1/2 z-50 bg-[#025a94] text-white p-2 rounded-l-xl shadow-md hover:bg-[#024a7b] flex items-center justify-center cursor-ew-resize select-none active:scale-95 transition-transform"
        title="Потяните для изменения ширины или нажмите для открытия/закрытия"
      >
        <Menu size={18} />
      </div>

      {isOpen && (
        <div className="flex flex-col h-full w-full overflow-hidden relative">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#025a94]">
                <Bot size={20} />
              </div>
              <span className="font-semibold text-slate-800 text-sm">
                VseVuzy ИИ
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isAuthenticated && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100"></span>
              )}
              {isAuthenticated && (
                <>
                  <button
                    onClick={handleKeyIconClick}
                    className="text-slate-400 hover:text-[#025a94] transition cursor-pointer p-1"
                    title="Сменить API ключ"
                  >
                    <Key size={16} />
                  </button>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-blue-50 text-[#025a94] flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={15} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-[#025a94] text-white rounded-tr-none"
                      : "bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none"
                  }`}
                >
                  {msg.sender === "bot" ? renderAiText(msg.text) : msg.text}
                </div>
              </div>
            ))}
            {streaming && (
              <div className="flex gap-2.5 justify-start">
                <div className="bg-slate-50 text-slate-700 border border-slate-100 p-3.5 rounded-2xl rounded-tl-none max-w-[85%] text-xs sm:text-sm leading-relaxed shadow-sm flex items-center gap-2">
                  <span className="flex gap-1">
                    <span
                      className="w-1 h-1 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-1 h-1 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-1 h-1 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </span>
                  <span className="text-slate-400">думает...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />

            {!isAuthenticated && (
              <div className="absolute inset-0 z-30 bg-white/85 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 w-full max-w-sm mx-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#025a94]">
                      <Key size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm">
                        Вставьте API-ключ OpenRouter
                      </h3>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <input
                        type="password"
                        placeholder="sk-or-v1-..."
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setError("");
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#025a94] focus:bg-white transition"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handlePaste}
                      className="px-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      title="Вставить из буфера"
                    >
                      <Copy size={16} className="text-slate-600" />
                    </button>
                  </div>

                  {error && (
                    <div className="flex items-center gap-1.5 text-red-500 text-xs mb-3 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle size={14} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    onClick={handleContinue}
                    disabled={!apiKey.trim() || isValidating}
                    className="w-full bg-[#025a94] hover:bg-[#024a7b] text-white py-2.5 rounded-xl text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isValidating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Проверка...
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        Продолжить
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="p-3 border-t border-slate-100 bg-white"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder={
                  isAuthenticated
                    ? "Ваш вопрос о поступлении..."
                    : "Введите API ключ OpenRouter..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={!isAuthenticated}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3.5 pr-10 text-xs sm:text-sm focus:outline-none focus:border-[#025a94] focus:bg-white transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!isAuthenticated || streaming}
                className="absolute right-1.5 p-1.5 bg-[#025a94] text-white rounded-lg hover:bg-[#024a7b] transition cursor-pointer disabled:opacity-50"
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
