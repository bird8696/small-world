import { useEffect } from "react";
import { generateNews } from "../engine/newsEngine";

const NEWS_MS = 20000;

export function useNews() {
  useEffect(() => {
    const firstTimer = setTimeout(generateNews, 1500);
    const id = setInterval(generateNews, NEWS_MS);
    return () => {
      clearTimeout(firstTimer);
      clearInterval(id);
    };
  }, []);
}
