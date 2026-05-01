import { formatTimestamp } from './formatters';
const CACHE_KEY = 'sfrta_cache_v1';
function todayKey() {
    return new Date().toISOString().slice(0, 10);
}
export function loadOrSeedCache() {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
            const cache = JSON.parse(raw);
            if (cache.day === todayKey()) {
                const updatedElement = document.getElementById('updated');
                if (updatedElement)
                    updatedElement.textContent = formatTimestamp(cache.timestamp);
                const ageHours = (Date.now() - new Date(cache.timestamp).getTime()) / 3600000;
                if (ageHours > 18) {
                    document.getElementById('staleWarn')?.classList.add('show');
                }
                return;
            }
        }
    }
    catch (_) { /* localStorage unavailable */ }
    refreshCache();
}
export function refreshCache() {
    const now = new Date().toISOString();
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ day: todayKey(), timestamp: now }));
    }
    catch (_) { /* localStorage unavailable */ }
    const updatedElement = document.getElementById('updated');
    if (updatedElement)
        updatedElement.textContent = formatTimestamp(now);
    document.getElementById('staleWarn')?.classList.remove('show');
}
export function forceRefresh(renderCallback) {
    refreshCache();
    const board = document.getElementById('board');
    if (board)
        board.innerHTML = '';
    setTimeout(renderCallback, 20);
}
