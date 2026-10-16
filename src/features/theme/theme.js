import { useEffect, useState } from "react";

const THEME_STORAGE_KEY = "cosmos-theme";
const THEME_CHANGE_EVENT = "cosmos-theme-change";

function isTheme(value) {
  return value === "dark" || value === "light";
}

export function getSavedTheme() {
  if (typeof window === "undefined") return "dark";

  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(savedTheme) ? savedTheme : "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme, { persist = true } = {}) {
  const nextTheme = isTheme(theme) ? theme : "dark";

  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = nextTheme;
  }

  if (typeof window !== "undefined") {
    if (persist) {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // 저장 공간을 사용할 수 없어도 현재 화면의 테마 전환은 유지합니다.
      }
    }
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: nextTheme }));
  }

  return nextTheme;
}

export function initializeTheme() {
  return applyTheme(getSavedTheme(), { persist: false });
}

export function useTheme() {
  const [theme, setThemeState] = useState(getSavedTheme);

  useEffect(() => {
    const handleThemeChange = (event) => setThemeState(event.detail);
    const handleStorage = (event) => {
      if (event.key === THEME_STORAGE_KEY && isTheme(event.newValue)) {
        applyTheme(event.newValue, { persist: false });
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setTheme = (nextTheme) => applyTheme(nextTheme);
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return { theme, setTheme, toggleTheme };
}
