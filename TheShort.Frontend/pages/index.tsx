import { useCallback, useState, useEffect, useRef } from "react";

const DOMAIN = "theshort.ru";

const asciiLogo = `
████████╗██╗  ██╗███████╗███████╗██╗  ██╗ ██████╗ ██████╗ ████████╗
╚══██╔══╝██║  ██║██╔════╝██╔════╝██║  ██║██╔═══██╗██╔══██╗╚══██╔══╝
   ██║   ███████║█████╗  ███████╗███████║██║   ██║██████╔╝   ██║   
   ██║   ██╔══██║██╔══╝  ╚════██║██╔══██║██║   ██║██╔══██╗   ██║   
   ██║   ██║  ██║███████╗███████║██║  ██║╚██████╔╝██║  ██║   ██║   
   ╚═╝   ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   
`;

type Lang = "en" | "ru";

const t: Record<Lang, Record<string, string>> = {
  en: {
    terminal: "THESHORT-TERMINAL-v1.0",
    online: "ONLINE",
    offline: "OFFLINE",
    subtitle: "[URL SHORTENING SYSTEM]",
    tabShorten: "[SHORTEN]",
    tabInfo: "[INFO]",
    promptShorten: "$ theshort --shorten",
    labelUrl: "[URL] Enter URL to shorten:",
    placeholder: "https://example.com/very/long/url",
    processing: "PROCESSING...",
    btnShorten: "[SHORTEN URL]",
    success: "[+] Short link created successfully!",
    labelShortened: "SHORTENED:",
    copied: "DONE",
    copy: "COPY",
    errorEmpty: "Please enter a URL",
    errorInvalid: "Invalid URL. Must be a valid http/https link with a domain name.",
    errorServer: "Failed to connect to server",
    errorInvalidFormat: "Invalid URL format.",
    errorOnlyHttp: "Only HTTP and HTTPS protocols are supported.",
    errorNoDomain: "URL must contain a valid domain name.",
    errorNotFound: "Source link not found",
    errorTooLong: "Source URL is too long. Maximum 1024 characters.",
    tabSwitch: "[TAB] SWITCH",
    enterExecute: "[ENTER] EXECUTE",
    clipboard: "Copied to clipboard!",
    promptInfo: "$ theshort --about",
    domain: "DOMAIN:",
    version: "VERSION:",
    stack: "STACK:",
    about: "Fast and simple URL shortener with a nostalgic retro terminal interface.",
    madeWith: "Made with love by <a href=\"https://escal3de.site\">escal3de</a> <3",
  },
  ru: {
    terminal: "THESHORT-ТЕРМИНАЛ-v1.0",
    online: " ONLINE",
    offline: "OFFLINE",
    subtitle: "[СИСТЕМА СОКРАЩЕНИЯ ССЫЛОК]",
    tabShorten: "[СОКРАТИТЬ]",
    tabInfo: "[ИНФО]",
    promptShorten: "$ theshort --shorten",
    labelUrl: "[URL] Введите ссылку для сокращения:",
    placeholder: "https://example.com/очень/длинная/ссылка",
    processing: "ОБРАБОТКА...",
    btnShorten: "[СОКРАТИТЬ ССЫЛКУ]",
    success: "[+] Ссылка успешно создана!",
    labelShortened: "ГОТОВО:",
    copied: "ГОТОВО",
    copy: "КОПИРОВАТЬ",
    errorEmpty: "Введите URL",
    errorInvalid: "Некорректный URL. Должен быть http/https ссылкой с доменом.",
    errorServer: "Не удалось подключиться к серверу",
    errorInvalidFormat: "Неверный формат URL.",
    errorOnlyHttp: "Поддерживаются только протоколы HTTP и HTTPS.",
    errorNoDomain: "URL должен содержать валидное доменное имя.",
    errorNotFound: "Исходная ссылка не найдена",
    errorTooLong: "Ссылка слишком длинная. Максимум 1024 символа.",
    tabSwitch: "[TAB] ПЕРЕКЛЮЧИТЬ",
    enterExecute: "[ENTER] ВЫПОЛНИТЬ",
    clipboard: "Скопировано в буфер обмена!",
    promptInfo: "$ theshort --about",
    domain: "ДОМЕН:",
    version: "ВЕРСИЯ:",
    stack: "СТЕК:",
    about: "Быстрый и простой сокращатель ссылок с ностальгическим ретро-терминальным интерфейсом.",
    madeWith: "Сделано с любовью от <a href=\"https://escal3de.site\">Эскалейда</a> <3",
  },
};

const errorMap: Record<string, keyof (typeof t)["en"]> = {
  "Source url cannot be empty.": "errorEmpty",
  "Invalid URL format.": "errorInvalidFormat",
  "Only HTTP and HTTPS protocols are supported.": "errorOnlyHttp",
  "URL must contain a valid domain name.": "errorNoDomain",
  "Source link not found": "errorNotFound",
  "Source url is too long.": "errorTooLong",
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

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortLink, setShortLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"shortener" | "info">("shortener");
  const [online, setOnline] = useState(true);
  const [lang, setLang] = useState<Lang>("ru");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theshort-lang") as Lang | null;
    if (saved === "en" || saved === "ru") setLang(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("theshort-lang", lang);
  }, [lang]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "ru" : "en"));
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

    setLoading(true);
    try {
      const res = await fetch(apiUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: trimmed }),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text ? translateError(text, lang) : t[lang].errorServer);
        setOnline(false);
        return;
      }

      const data = await res.json();
      setShortLink(data.shortLink);
      setOnline(true);
      setUrl("");
    } catch {
      setError(t[lang].errorServer);
      setOnline(false);
    } finally {
      setLoading(false);
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
    setTimeout(() => setCopied(false), 2000);
  }, [shortLink]);

  return (
    <div className="crt-monitor">
      <div className="crt-screen crt-flicker">
        <div className="scanlines" />

        <div className="status-bar">
          <div className="left">
            <span>{t[lang].terminal}</span>
            <button className="lang-btn" onClick={toggleLang}>
              [{lang === "en" ? "RU" : "EN"}]
            </button>
          </div>
          <div className="right">
            <span>{online ? t[lang].online : t[lang].offline}</span>
            <span className={`status-light ${online ? "online" : "offline"}`} />
          </div>
        </div>

        <div className="ascii-logo">
          <pre>{asciiLogo}</pre>
          <div className="subtitle">{t[lang].subtitle}</div>
        </div>

        <div className="tabs">
          <button
            className={`tab ${tab === "shortener" ? "active" : ""}`}
            onClick={() => setTab("shortener")}
          >
            {t[lang].tabShorten}
          </button>
          <button
            className={`tab ${tab === "info" ? "active" : ""}`}
            onClick={() => setTab("info")}
          >
            {t[lang].tabInfo}
          </button>
        </div>

        <div className="content">
          {tab === "shortener" && (
            <>
              <div className="terminal-prompt">
                {t[lang].promptShorten}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    {t[lang].labelUrl}
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    className={`retro-input ${error ? "error" : ""}`}
                    placeholder={t[lang].placeholder}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="retro-button"
                  disabled={loading}
                  style={{ marginTop: 8 }}
                >
                  {loading
                    ? <><span className="spinner" /> {t[lang].processing}</>
                    : t[lang].btnShorten}
                </button>
              </form>

              {shortLink && (
                <div className="result-box">
                  <div className="success-check">
                    {t[lang].success}
                  </div>
                  <div className="label">{t[lang].labelShortened}</div>
                  <div className="short-url-row">
                    <a
                      className="url"
                      href={`https://${DOMAIN}/${shortLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://{DOMAIN}/{shortLink}
                    </a>
                    <button className="copy-btn" onClick={handleCopy}>
                      {copied ? t[lang].copied : t[lang].copy}
                    </button>
                  </div>
                </div>
              )}

              {error && <div className="error-box">ERROR: {error}</div>}
            </>
          )}

          {tab === "info" && (
            <div>
              <div className="terminal-prompt">
                {t[lang].promptInfo}
              </div>
              <div className="result-box" style={{ fontSize: "0.75rem", lineHeight: 1.8 }}>
                <div><span style={{ color: "var(--theme-text-dim)" }}>{t[lang].domain}</span> {DOMAIN}</div>
                <div><span style={{ color: "var(--theme-text-dim)" }}>{t[lang].version}</span> 1.0.0</div>
                <div><span style={{ color: "var(--theme-text-dim)" }}>{t[lang].stack}</span> ASP.NET Core + Next.js</div>
                <div style={{ marginTop: 8, color: "var(--theme-text-dim)" }}>
                  {t[lang].about}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="footer-bar">
          <div className="keys">
            <span>{t[lang].tabSwitch}</span>
            <span>{t[lang].enterExecute}</span>
          </div>
          <div
            className="made-with"
            dangerouslySetInnerHTML={{ __html: t[lang].madeWith }}
          />
        </div>
      </div>

      {copied && (
        <div className="copied-toast">{t[lang].clipboard}</div>
      )}
    </div>
  );
}
