import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Bot, Menu, Key, Copy, AlertCircle, Check } from "lucide-react";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
// openrouter/free rotates between models; some truncate JSON or ignore the schema.
// This pinned free model returned valid JSON consistently in testing.
const MODEL =
  import.meta.env.VITE_OPENROUTER_MODEL ||
  "nvidia/nemotron-3-ultra-550b-a55b:free";
const FALLBACK_MODEL = "openrouter/free";
const MAX_HISTORY_TURNS = 6;
const CANDIDATE_LIMIT = 12;
const MAX_OUTPUT_TOKENS = 3000;

const ENUM_VALUES = {
  studyForm: ["all", "Очная", "Заочная"],
  language: [
    "all",
    "Русский",
    "Русский, иностранные языки",
    "Белорусский",
    "Английский",
  ],
  military: ["any", "Есть", "Не указано", "Нет"],
  degrees: ["Бакалавриат", "Магистратура", "Специальное"],
};

const ENUM_ALIASES = {
  очная: "Очная",
  заочная: "Заочная",
  все: "all",
  любой: "all",
  неважно: "any",
  русский: "Русский",
  белорусский: "Белорусский",
  английский: "Английский",
  есть: "Есть",
  да: "Есть",
  нет: "Не указано",
  "не указано": "Не указано",
  бакалавриат: "Бакалавриат",
  магистратура: "Магистратура",
  специальное: "Специальное",
};

const KEY_ALIASES = {
  vuz: "university",
  universityname: "university",
  min_ball: "minScore",
  minball: "minScore",
  score: "minScore",
  cityname: "city",
  form: "studyForm",
  lang: "language",
  specialty: "specialty",
  militarydepartment: "military",
};

const STRING_KEYS = ["university", "city", "exams", "specialty", "duration"];
const BOOL_KEYS = ["budget", "paid"];
const ENUM_KEYS = ["studyForm", "language", "military"];

const FILTER_LABELS = {
  university: "вуз",
  minScore: "балл от",
  city: "город",
  studyForm: "форма",
  budget: "бюджет",
  paid: "платное",
  exams: "экзамены",
  specialty: "специальность",
  keywords: "направление",
  language: "язык",
  duration: "срок",
  military: "военная кафедра",
  degrees: "ступень",
};

// Broad categories are matched against titles instead of one exact substring.
const KEYWORD_SETS = {
  it: ["информац", "программ", "компьютер", "кибер", "искусственн"],
  айти: ["информац", "программ", "компьютер", "кибер", "искусственн"],
  "it-специальности": ["информац", "программ", "компьютер", "кибер", "искусственн"],
  программирование: ["программ", "информац", "компьютер"],
  медицина: ["медиц", "врач", "леч"],
  экономика: ["эконом", "финанс", "маркетинг"],
  юриспруденция: ["правовед", "юрид"],
};

const STOP_WORDS = new Set([
  "и", "в", "во", "на", "с", "со", "по", "для", "от", "до", "из", "за",
  "про", "что", "как", "какой", "какая", "какие", "есть", "ли", "или",
  "а", "но", "не", "нет", "них", "мне", "меня", "мой", "моя", "мои",
  "хочу", "ищу", "нужно", "найди", "покажи", "дай", "программа",
  "программы", "вуз", "вузы", "поступление", "поступить", "лучшая",
  "лучший", "лучшие", "сравни", "посоветуй", "привет", "здравствуйте",
  "спасибо",
]);

const SYNONYMS = {
  it: ["информац", "программ", "компьютер", "кибер", "айти"],
  айти: ["информац", "программ", "компьютер", "кибер"],
  медицина: ["медиц", "врач", "леч"],
  экономика: ["эконом", "финанс", "маркетинг"],
  юрист: ["правовед", "юрид"],
  инженер: ["инженер", "техник"],
};

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[^a-zа-яё0-9]+/i)
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

function normalizeEnumValue(value, allowed) {
  const raw = String(value ?? "").trim().toLowerCase();
  const direct = allowed.find((item) => item.toLowerCase() === raw);
  if (direct) return direct;
  return ENUM_ALIASES[raw] && allowed.includes(ENUM_ALIASES[raw])
    ? ENUM_ALIASES[raw]
    : null;
}

function normalizeKeywords(rawValue) {
  const items = Array.isArray(rawValue)
    ? rawValue
    : String(rawValue ?? "").split(",");

  return [
    ...new Set(
      items
        .flatMap((item) => {
          const value = String(item ?? "").trim();
          if (!value) return [];
          return KEYWORD_SETS[value.toLowerCase()] || [value.toLowerCase()];
        })
        .filter((keyword) => keyword.length > 1),
    ),
  ];
}

function normalizeFilters(rawFilters) {
  const values = {};
  const rejected = [];

  if (!rawFilters || typeof rawFilters !== "object" || Array.isArray(rawFilters)) {
    return { values, rejected };
  }

  for (const [originalKey, rawValue] of Object.entries(rawFilters)) {
    const key = KEY_ALIASES[originalKey.toLowerCase()] || originalKey;

    if (key === "minScore") {
      const digits = String(rawValue ?? "").replace(/[^\d]/g, "");
      if (digits) values.minScore = digits;
      else rejected.push(originalKey);
    } else if (BOOL_KEYS.includes(key)) {
      const text = String(rawValue ?? "").toLowerCase();
      if (["true", "1", "да", "есть", "yes"].includes(text)) values[key] = true;
      else if (["false", "0", "нет", "без", "no"].includes(text)) values[key] = false;
      else rejected.push(originalKey);
    } else if (key === "degrees") {
      const items = Array.isArray(rawValue) ? rawValue : String(rawValue ?? "").split(",");
      const degrees = [
        ...new Set(
          items
            .map((item) => normalizeEnumValue(item, ENUM_VALUES.degrees))
            .filter(Boolean),
        ),
      ];
      if (degrees.length) values.degrees = degrees;
      else rejected.push(originalKey);
    } else if (key === "keywords") {
      const keywords = normalizeKeywords(rawValue);
      if (keywords.length) values.keywords = keywords;
      else rejected.push(originalKey);
    } else if (key === "specialty") {
      const value = String(rawValue ?? "").trim();
      if (!value) {
        rejected.push(originalKey);
      } else if (KEYWORD_SETS[value.toLowerCase()]) {
        values.keywords = normalizeKeywords(value);
      } else {
        values.specialty = value;
      }
    } else if (ENUM_KEYS.includes(key)) {
      const value = normalizeEnumValue(rawValue, ENUM_VALUES[key]);
      if (value) values[key] = value;
      else rejected.push(originalKey);
    } else if (STRING_KEYS.includes(key)) {
      const value = String(rawValue ?? "").trim();
      if (value) values[key] = value;
      else rejected.push(originalKey);
    } else {
      rejected.push(originalKey);
    }
  }

  return { values, rejected };
}

function describeFilters(values) {
  return Object.entries(values)
    .map(([key, value]) => {
      const label = FILTER_LABELS[key] || key;
      if (BOOL_KEYS.includes(key)) return `${label}: ${value ? "да" : "нет"}`;
      if (key === "keywords") {
        const isIt =
          value.includes("информац") && value.includes("программ");
        return `${label}: ${isIt ? "IT" : value.slice(0, 3).join(", ")}`;
      }
      if (Array.isArray(value)) return `${label}: ${value.join(", ")}`;
      return `${label}: ${value}`;
    })
    .join(", ");
}

function buildCatalog(programs) {
  const tally = (key) =>
    programs.reduce((acc, program) => {
      const value = program[key];
      if (value != null && value !== "") acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});

  const subjects = {};
  programs.forEach((program) => {
    String(program.exams || "")
      .split(",")
      .forEach((part) => {
        const subject = part.replace(/\([^)]*\)/g, "").trim();
        if (subject && subject.length < 60) {
          subjects[subject] = (subjects[subject] || 0) + 1;
        }
      });
  });

  const range = (key) => {
    const numbers = programs.map((program) => program[key]).filter((n) => n != null);
    return numbers.length ? [Math.min(...numbers), Math.max(...numbers)] : null;
  };

  return {
    total: programs.length,
    universities: tally("university"),
    cities: tally("city"),
    degrees: tally("degree"),
    studyForms: tally("studyForm"),
    languages: tally("language"),
    military: tally("militaryDepartment"),
    durations: tally("duration"),
    scoreRanges: { budget: range("budgetScore"), paid: range("paidScore") },
    examSubjects: Object.entries(subjects)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => `${name} (${count})`),
  };
}

function compactCandidate(program) {
  return {
    id: program.id,
    title: program.title,
    university: program.university,
    city: program.city,
    degree: program.degree,
    budgetScore: program.budgetScore,
    paidScore: program.paidScore,
    studyForm: program.studyForm,
    language: program.language,
    duration: program.duration,
    military: program.militaryDepartment,
    exams: String(program.exams || "").split(",").slice(0, 3).join(",").trim(),
  };
}

function selectCandidates(programs, query, previousIds) {
  const tokens = tokenize(query);
  if (!tokens.length) {
    return previousIds
      .map((id) => programs.find((program) => program.id === id))
      .filter(Boolean);
  }

  const expanded = [
    ...new Set(
      tokens.flatMap((token) => [token, ...(SYNONYMS[token] || [])]),
    ),
  ];

  const thresholdMatch = String(query).match(/(?:от|выше|более|не ниже)\s*(\d{2,3})/i);
  const threshold = thresholdMatch ? Number(thresholdMatch[1]) : null;

  const scored = programs
    .map((program) => {
      const hay = [
        program.title,
        program.university,
        program.shortName,
        program.city,
        program.degree,
        program.exams,
        program.duration,
        program.budgetScore,
        program.paidScore,
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      expanded.forEach((token) => {
        const variants = [
          token,
          ...(token.length > 4 ? [token.slice(0, -1), token.slice(0, -2)] : []),
        ];
        if (variants.some((variant) => hay.includes(variant))) score += 1;
        if (
          variants.some((variant) =>
            String(program.title || "").toLowerCase().includes(variant),
          )
        ) {
          score += 2;
        }
      });

      if (threshold != null) {
        if (program.budgetScore != null && program.budgetScore >= threshold) score += 3;
        else score -= 3;
      }

      return { program, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const picked = scored.slice(0, CANDIDATE_LIMIT).map((item) => item.program);
  if (picked.length) return picked;

  // Follow-ups like "а какая из них лучшая" have no useful keywords.
  return previousIds
    .map((id) => programs.find((program) => program.id === id))
    .filter(Boolean);
}

function repairJson(text) {
  return String(text || "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/^\uFEFF/, "")
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/\/\/[^\n\r]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

function extractJson(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidates = [fenced ? fenced[1] : trimmed];

  const open = trimmed.indexOf("{");
  const close = trimmed.lastIndexOf("}");
  if (open !== -1 && close > open) candidates.push(trimmed.slice(open, close + 1));

  for (const candidate of candidates) {
    for (const attempt of [candidate, repairJson(candidate)]) {
      try {
        const parsed = JSON.parse(attempt);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // try the next candidate
      }
    }
  }
  return null;
}

function stripCommands(text) {
  return String(text || "")
    .replace(/```(?:json)?[\s\S]*?```/gi, "")
    .replace(/\[ФИЛЬТР\][^\n\r]*/g, "")
    .replace(/\[ПРОГРАММА\][^\n\r]*/g, "")
    .replace(/\[ВЕРНУТЬСЯ\]/g, "")
    .replace(/\[СБРОСИТЬ_ФИЛЬТРЫ\]/g, "")
    .trim();
}

// Backwards compatibility for models that ignore JSON mode.
function parseLegacyCommands(text) {
  const updates = {};
  const openIds = [];

  const filterRegex = /\[ФИЛЬТР\]\s*(\w+)=([^\n\r]+)/g;
  const programRegex = /\[ПРОГРАММА\]\s*id=(\d+)/g;
  let match;

  while ((match = filterRegex.exec(text)) !== null) {
    updates[match[1]] = match[2].trim();
  }
  while ((match = programRegex.exec(text)) !== null) {
    openIds.push(Number(match[1]));
  }
  const wentBack = /\[ВЕРНУТЬСЯ\]/.test(text);
  const filtersReset = /\[СБРОСИТЬ_ФИЛЬТРЫ\]/.test(text);

  return { updates, openIds, wentBack, filtersReset };
}

// Used when the model returns malformed JSON. Keeps common requests working.
function deriveLocalIntent(text, programs) {
  const lower = String(text || "").toLowerCase();
  const filters = {};
  let action = "none";

  if (/сброс|очист/.test(lower)) action = "reset";
  else if (/верн|назад/.test(lower)) action = "back";

  const minMatch = lower.match(/(?:от|выше|более|не ниже)\s*(\d{2,3})/);
  if (minMatch) filters.minScore = minMatch[1];

  if (/только бюджет|только на бюджет/.test(lower)) filters.paid = false;
  if (/только платн/.test(lower)) filters.budget = false;
  if (/бюджет/.test(lower) && !/без бюджет|нет бюджет/.test(lower)) {
    filters.budget = true;
  }
  if (/платн/.test(lower)) filters.paid = true;

  if (/заочн/.test(lower)) filters.studyForm = "Заочная";
  else if (/очн/.test(lower)) filters.studyForm = "Очная";

  if (/магистрат/.test(lower)) filters.degrees = ["Магистратура"];
  else if (/бакалавр/.test(lower)) filters.degrees = ["Бакалавриат"];
  else if (/специальное/.test(lower)) filters.degrees = ["Специальное"];

  if (/без военн|нет военн/.test(lower)) filters.military = "Не указано";
  else if (/военн/.test(lower)) filters.military = "Есть";

  if (/\bit\b|айти|ит-|ит /i.test(lower)) {
    filters.keywords = normalizeKeywords("it");
  } else if (/медицин|врач/.test(lower)) {
    filters.keywords = normalizeKeywords("медицина");
  } else if (/эконом|финанс/.test(lower)) {
    filters.keywords = normalizeKeywords("экономика");
  } else if (/юрид|правовед/.test(lower)) {
    filters.keywords = normalizeKeywords("юриспруденция");
  }

  const city = [...new Set(programs.map((program) => program.city).filter(Boolean))].find(
    (item) => lower.includes(item.toLowerCase().slice(0, 4)),
  );
  if (city) filters.city = city;

  const university = [
    ...new Set(programs.map((program) => program.university).filter(Boolean)),
  ].find((item) => lower.includes(item.toLowerCase()));
  if (university) filters.university = university;

  return { filters, action };
}

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
  const messagesContainerRef = useRef(null);
  const previousCandidateIds = useRef([]);

  const catalogContext = useMemo(
    () => JSON.stringify(buildCatalog(programs)),
    [programs],
  );

  const systemPrompt = useMemo(
    () => `Ты — ИИ-ассистент сайта VseVuzy (абитуриенты, поступление в вузы Беларуси).

Краткий справочник по каталогу (все программы уже загружены в приложении):
${catalogContext}

В каждом сообщении пользователя есть список КАНДИДАТОВ — программ, подобранных локально по его вопросу. Это единственные программы, о которых ты можешь говорить как о конкретных. Используй их id, не выдумывай новые. Полные данные программы (форма обучения, язык, срок, военная кафедра) видны пользователю после открытия программы — не говори, что таких данных нет.

Верни ТОЛЬКО валидный JSON без обёрток и комментариев:
{
  "reply": "краткий содержательный ответ на русском",
  "filters": null или объект,
  "openProgramId": null или number,
  "action": "none" | "reset" | "back"
}

Допустимые ключи filters:
- university, city, exams, specialty, duration — строки;
- keywords — массив коротких основ слов (например ["информац","программ"] для IT);
- minScore — число;
- budget, paid — true/false;
- studyForm — ${JSON.stringify(ENUM_VALUES.studyForm)};
- language — ${JSON.stringify(ENUM_VALUES.language)};
- military — ${JSON.stringify(ENUM_VALUES.military)};
- degrees — массив из ${JSON.stringify(ENUM_VALUES.degrees)}.

Правила:
- Если пользователь просит показать/отфильтровать программы — заполни filters и напиши в reply, что изменилось.
- Если просит открыть конкретную программу — поставь её id из кандидатов в openProgramId.
- Если просит вернуться к поиску — action="back"; сбросить фильтры — action="reset".
- Если просто задал вопрос — ответь в reply по кандидатам, остальные поля оставь null/"none".
- Не утверждай факты о программах, которых нет в списке кандидатов. Если данных недостаточно — скажи об этом в reply.
- Не пиши "Готово!". Ответ всегда содержит конкретную информацию.`,
    [catalogContext],
  );

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
      } else {
        setIsAuthenticated(true);
        sessionStorage.setItem("openrouter_api_key", key);
        setError("");
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
      const timer = setTimeout(() => validateKey(apiKey), 0);
      return () => clearTimeout(timer);
    }
  }, [apiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

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

  const handleHandleMouseDown = (event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = isOpen ? width : 0;
    let hasMoved = false;

    const onMouseMove = (moveEvent) => {
      const delta = startX - moveEvent.clientX;
      if (Math.abs(delta) > 3) hasMoved = true;
      if (hasMoved) {
        setWidth(Math.min(Math.max(startWidth + delta, 280), 650));
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

    document.body.style.userSelect = "";
    document.body.style.cursor = "ew-resize";
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    if (!input.trim() || !isAuthenticated || streaming) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: userText },
    ]);
    setStreaming(true);

    try {
      const candidates = selectCandidates(
        programs,
        userText,
        previousCandidateIds.current,
      );
      previousCandidateIds.current = candidates.map((program) => program.id);

      const history = messages.slice(1).slice(-MAX_HISTORY_TURNS);
      const currentMessage = candidates.length
        ? `Вопрос пользователя: ${userText}\n\nКандидаты (используй только их):\n${JSON.stringify(
            candidates.map(compactCandidate),
          )}`
        : `Вопрос пользователя: ${userText}\n\nКандидатов по этому запросу не найдено. Не выдумывай программы.`;

      const requestBody = {
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...history.map((message) => ({
            role: message.sender === "user" ? "user" : "assistant",
            content: message.text,
          })),
          { role: "user", content: currentMessage },
        ],
        max_tokens: MAX_OUTPUT_TOKENS,
      };

      const sendRequest = (body = requestBody) =>
        fetch(OPENROUTER_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "VseVuzy",
          },
          body: JSON.stringify(body),
        });

      let res = await sendRequest();
      // If the pinned free model disappears, fall back to the router.
      if (res.status === 404) {
        requestBody.model = FALLBACK_MODEL;
        res = await sendRequest();
      }

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
      let raw = data?.choices?.[0]?.message?.content || "";
      let parsed = extractJson(raw);

      // One repair attempt for malformed or truncated JSON.
      if (!parsed && raw.trim()) {
        const repairBody = {
          ...requestBody,
          messages: [
            ...requestBody.messages,
            { role: "assistant", content: raw.slice(0, 6000) },
            {
              role: "user",
              content:
                "Предыдущий ответ не является валидным JSON. Верни только компактный валидный JSON по схеме. Без reasoning, markdown и пояснений.",
            },
          ],
        };
        const repairRes = await sendRequest(repairBody);
        if (repairRes.ok) {
          const repairData = await repairRes.json();
          const repairRaw = repairData?.choices?.[0]?.message?.content || "";
          const repaired = extractJson(repairRaw);
          if (repaired) {
            raw = repairRaw;
            parsed = repaired;
          }
        }
      }

      if (import.meta.env.DEV && !parsed) {
        console.warn("AI response could not be parsed as JSON:", raw);
      }

      let replyText = "";
      let updates = {};
      let openId = null;
      let wentBack = false;
      let filtersReset = false;
      let rejected = [];
      let usedLocalFilters = false;

      if (parsed) {
        replyText =
          typeof parsed.reply === "string" ? stripCommands(parsed.reply) : "";
        ({ values: updates, rejected } = normalizeFilters(parsed.filters));
        openId = parsed.openProgramId == null ? null : Number(parsed.openProgramId);
        wentBack = parsed.action === "back";
        filtersReset = parsed.action === "reset";
      } else {
        const legacy = parseLegacyCommands(raw);
        replyText = stripCommands(raw);
        ({ values: updates, rejected } = normalizeFilters(legacy.updates));
        openId = legacy.openIds[0] ?? null;
        wentBack = legacy.wentBack;
        filtersReset = legacy.filtersReset;
      }

      const lowerUser = userText.toLowerCase();
      const showIntent =
        /покаж|найд|подбер|какие|какая|какой|есть ли|от \d{2,3}|бюджет|платн|очн|заочн/.test(
          lowerUser,
        );
      const local = deriveLocalIntent(userText, programs);

      // Model often lists candidates but forgets to fill filters.
      if (!Object.keys(updates).length && showIntent && Object.keys(local.filters).length) {
        updates = local.filters;
        usedLocalFilters = true;
      }

      // Deterministic navigation intents beat model interpretation.
      if (/верн|назад/.test(lowerUser)) {
        wentBack = true;
        filtersReset = false;
        replyText = "Возвращаюсь к поиску.";
      } else if (/сброс|очист/.test(lowerUser)) {
        filtersReset = true;
        wentBack = false;
        replyText = "Сбрасываю фильтры.";
      } else if (
        !replyText &&
        !Object.keys(updates).length &&
        openId == null &&
        !wentBack &&
        !filtersReset
      ) {
        updates = local.filters;
        wentBack = local.action === "back";
        filtersReset = local.action === "reset";
      }

      const notes = [];
      const candidateIds = new Set(candidates.map((program) => program.id));

      if (Object.keys(updates).length) {
        onSetFilters(updates);
        notes.push(`✅ ${describeFilters(updates)}`);
      }

      if (openId != null && Number.isFinite(openId)) {
        const program = programs.find((item) => item.id === openId);
        const userMentionsId = new RegExp(`\\b${openId}\\b`).test(userText);
        if (program && (candidateIds.has(openId) || userMentionsId)) {
          onOpenProgram(program);
          notes.push(`📄 Открыта программа «${program.title}»`);
        } else if (program) {
          notes.push(
            "⚠️ Модель предложила программу вне найденных вариантов — не открываю.",
          );
        } else {
          notes.push("⚠️ Программа с таким id не найдена");
        }
      }

      if (wentBack) {
        onGoBack();
        notes.push("🔙 Вернулись к поиску программ");
      }
      if (filtersReset) {
        onResetFilters();
        notes.push("🔄 Все фильтры сброшены");
      }
      if (rejected.length && !usedLocalFilters) {
        notes.push(`⚠️ Не распознано: ${rejected.join(", ")}`);
      }

      let baseReply = replyText.trim();
      if (!baseReply && candidates.length) {
        const examples = candidates
          .slice(0, 3)
          .map((program) => `«${program.title}» (${program.university})`)
          .join("; ");
        baseReply = `Подобрал ${candidates.length} программ. Ближайшие варианты: ${examples}.`;
      }
      if (!baseReply && !notes.length) {
        baseReply =
          "Не удалось разобрать ответ модели. Уточните запрос — например, город, вуз, специальность или минимальный балл.";
      }

      const visibleText = [baseReply, ...notes].filter(Boolean).join("\n\n");

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: visibleText },
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
            <span key={lIdx}>
              {parseBold(escapeHtml(line))}
              {lIdx < lines.length - 1 && <br />}
            </span>
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

          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 relative"
          >
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
