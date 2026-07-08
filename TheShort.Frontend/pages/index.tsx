import { useCallback, useState, useEffect, useRef } from "react";

const DOMAIN = "theshort.ru";

type Lang = "en" | "ru";

const t: Record<Lang, Record<string, string>> = {
  en: {
    title: "theshort",
    desc: "Paste a link, choose a domain, and press",
    descEnter: "Enter",
    descEnd: "to get a short link.",
    placeholder: "Paste the link you want to shorten...",
    processing: "Processing...",
    btnShorten: "Shorten",
    success: "Link shortened!",
    copied: "Copied!",
    copy: "Copy",
    errorEmpty: "Please enter a URL",
    errorInvalid: "Invalid URL. Must be a valid http/https link with a domain name.",
    errorServer: "Failed to connect to server",
    errorInvalidFormat: "Invalid URL format.",
    errorOnlyHttp: "Only HTTP and HTTPS protocols are supported.",
    errorNoDomain: "URL must contain a valid domain name.",
    errorNotFound: "Source link not found",
    errorTooLong: "Source URL is too long. Maximum 1024 characters.",
    clipboard: "Copied to clipboard!",
    madeWith: 'made with love by <a href="https://escal3de.site" class="footer-link" target="_blank" rel="noopener noreferrer">escal3de</a> <3',
  },
  ru: {
    title: "theshort",
    desc: "Вставь ссылку, выбери домен и нажми",
    descEnter: "Enter",
    descEnd: "чтобы получить готовую ссылку.",
    placeholder: "Вставьте ссылку которую хотите сократить...",
    processing: "Обработка...",
    btnShorten: "Сократить",
    success: "Ссылка создана!",
    copied: "Готово!",
    copy: "Копировать",
    errorEmpty: "Введите URL",
    errorInvalid: "Некорректный URL. Должен быть http/https ссылкой с доменом.",
    errorServer: "Не удалось подключиться к серверу",
    errorInvalidFormat: "Неверный формат URL.",
    errorOnlyHttp: "Поддерживаются только протоколы HTTP и HTTPS.",
    errorNoDomain: "URL должен содержать валидное доменное имя.",
    errorNotFound: "Исходная ссылка не найдена",
    errorTooLong: "Ссылка слишком длинная. Максимум 1024 символа.",
    clipboard: "Скопировано в буфер обмена!",
    madeWith: 'сделано с любовью от <a href="https://escal3de.site" class="footer-link" target="_blank" rel="noopener noreferrer">эскалейда</a> <3',
  },
};

const errorMap: Record<string, keyof (typeof t)["en"]> = {
  "Source url cannot be empty.": "errorEmpty",
  "Invalid URL format.": "errorInvalidFormat",
  "Only HTTP and HTTPS protocols are supported.": "errorOnlyHttp",
  "URL must contain a valid domain name.": "errorNoDomain",
  "Source link not found": "errorNotFound",
  "Source url is too long.": "errorTooLong",
  "Cannot shorten links from theshort.ru domain.": "errorInvalid",
};

function translateError(msg: string, lang: Lang): string {
  const key = errorMap[msg];
  return key ? t[lang][key] : msg;
}

function apiUrl(): string {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5192/api/short-links";
  }
  return "/api/short-links";
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" d="M1.25 8A.75.75 0 0 1 2 7.25h10.19L9.47 4.53a.75.75 0 0 1 1.06-1.06l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 1 1-1.06-1.06l2.72-2.72H2A.75.75 0 0 1 1.25 8" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" width="1rem" height="1rem">
      <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14m3.1-8.55a.75.75 0 1 0-1.2-.9L7.419 8.858 6.03 7.47a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.13-.08z" clipRule="evenodd" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" d="M8 13.5a5.5 5.5 0 0 0 2.263-10.514 5.5 5.5 0 0 1-7.278 7.278A5.5 5.5 0 0 0 8 13.5M1.045 8.795a7.001 7.001 0 1 0 7.75-7.75l-.028-.003A7 7 0 0 0 8 1c-.527 0-.59.842-.185 1.18a4 4 0 0 1 .342.322A4 4 0 1 1 2.18 7.814C1.842 7.41 1 7.474 1 8a7 7 0 0 0 .045.794" clipRule="evenodd" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor">
      <path fillRule="evenodd" d="M8 3a.75.75 0 0 1-.75-.75V.75a.75.75 0 0 1 1.5 0v1.5A.75.75 0 0 1 8 3m0 7.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m-.75 3.25a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-1.5 0zM13 8a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 13 8M.75 7.25a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5zm10.786-2.786a.75.75 0 0 1 0-1.06l1.06-1.06a.75.75 0 0 1 1.06 1.06l-1.06 1.06a.75.75 0 0 1-1.06 0m-9.193 8.132a.75.75 0 0 0 1.06 1.06l1.062-1.06a.75.75 0 0 0-1.061-1.06zm9.193-1.06a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06M3.404 2.343a.75.75 0 0 0-1.06 1.06l1.06 1.061a.75.75 0 1 0 1.06-1.06z" clipRule="evenodd" />
    </svg>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortLink, setShortLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [lang, setLang] = useState<Lang>("ru");
  const [focusProgress, setFocusProgress] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem("theshort-lang") as Lang | null;
    if (savedLang === "en" || savedLang === "ru") setLang(savedLang);

    const savedTheme = localStorage.getItem("theshort-theme") as "dark" | "light" | null;
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const t = prefersDark ? "dark" : "light";
      setTheme(t);
      document.documentElement.setAttribute("data-theme", t);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theshort-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("theshort-lang", lang);
  }, [lang]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [lang]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "ru" : "en"));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShortLink(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError(t[lang].errorEmpty);
      return;
    }
    if (!isValidUrl(trimmed)) {
      setError(t[lang].errorInvalid);
      return;
    }
    if (/theshort\.ru/i.test(trimmed)) {
      setError("ERROR: Cannot shorten links from this domain.");
      return;
    }

    setLoading(true);
    setFocusProgress(true);
    try {
      const res = await fetch(apiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: trimmed }),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text ? translateError(text, lang) : t[lang].errorServer);
        return;
      }

      const data = await res.json();
      setShortLink(data.shortLink);
      setUrl("");
    } catch {
      setError(t[lang].errorServer);
    } finally {
      setLoading(false);
      setFocusProgress(false);
    }
  }, [url, lang]);

  const handleCopy = useCallback(async () => {
    if (!shortLink) return;
    const fullUrl = `https://${DOMAIN}/${shortLink}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
    } catch {
      const el = document.createElement("input");
      el.value = fullUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    showToast(t[lang].clipboard);
    setTimeout(() => setCopied(false), 2000);
  }, [shortLink, lang, showToast]);

  return (
    <div className="page">
      <div className="orb orb--1" />
      <div className="orb orb--2" />
      <div className="orb orb--3" />

      <div className="main">
        <div className="main-inner">
          <div className="brand-row">
            <div className="brand-icon">
              <LinkIcon />
              <div className="brand-glow" />
            </div>
            <div className="brand-title">
              @<span className="accent">{t[lang].title}</span>
            </div>
          </div>

          <div className="description">
            {t[lang].desc}{" "}
            <span className="highlight">{t[lang].descEnter}</span>
            {" "}{t[lang].descEnd}
          </div>

          <form onSubmit={handleSubmit} className="action-row">
            <div className="input-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="input"
                placeholder={t[lang].placeholder}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                onFocus={() => setFocusProgress(true)}
                onBlur={() => setFocusProgress(false)}
              />
              <div className={`input-progress ${focusProgress ? "active" : ""}`}>
                <div className="bar" style={{ width: loading ? "60%" : url.length > 0 ? "100%" : "0%" }} />
              </div>
            </div>

            <div className="controls-row">
              <button type="button" className="domain-btn" disabled>
                {DOMAIN}
                <svg className="chevron" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M3.58 4.109a.75.75 0 0 0 1.061 1.06L8 1.811l3.354 3.353a.75.75 0 0 0 1.06-1.06L8.53.22a.75.75 0 0 0-1.06 0zm8.84 7.782a.75.75 0 1 0-1.061-1.06l-3.36 3.358-3.353-3.353a.75.75 0 1 0-1.06 1.06L7.47 15.78a.75.75 0 0 0 1.06 0z" clipRule="evenodd" />
                </svg>
              </button>

              <div className="submit-wrap">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <span className="spinner" /> : <ArrowIcon />}
                </button>
                <div className="submit-glow" />
              </div>
            </div>
          </form>

          {shortLink && (
            <div className="result-area">
              <div className="result-card">
                <a
                  className="url"
                  href={`https://${DOMAIN}/${shortLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://{DOMAIN}/{shortLink}
                </a>
                <button
                  className={`copy-btn ${copied ? "copied" : ""}`}
                  onClick={handleCopy}
                >
                  {copied ? <CheckIcon /> : null}
                  {copied ? t[lang].copied : t[lang].copy}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="error-area">
              <div className="error-box">{error}</div>
            </div>
          )}
        </div>
      </div>

      <div className="footer">
        <div className="footer-inner">
          <div className="footer-row">
            <span
              className="footer-text"
              dangerouslySetInnerHTML={{ __html: t[lang].madeWith }}
            />
            <span className="footer-sep">✦</span>
            <button className="footer-btn" onClick={toggleLang}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, fontFamily: "var(--font)" }}>
                {lang === "en" ? "RU" : "EN"}
              </span>
            </button>
            <span className="footer-sep">✦</span>
            <button className="footer-btn" onClick={toggleTheme}>
              {theme === "dark" ? <MoonIcon /> : <SunIcon />}
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast">{toastMsg}</div>
      )}
    </div>
  );
}
