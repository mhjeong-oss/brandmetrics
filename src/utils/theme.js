export function getTheme() {
  return localStorage.getItem('theme') || 'light';
}
export function setTheme(theme) {
  localStorage.setItem('theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.style.setProperty('--bg', '#1C1C1A');
    document.documentElement.style.setProperty('--surface1', '#262624');
    document.documentElement.style.setProperty('--surface2', '#2C2C2A');
    document.documentElement.style.setProperty('--key', '#CB3439');
    document.documentElement.style.setProperty('--text', 'rgba(255,255,255,0.88)');
    document.documentElement.style.setProperty('--text-muted', 'rgba(255,255,255,0.40)');
    document.documentElement.style.setProperty('--border', 'rgba(255,255,255,0.08)');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.setProperty('--bg', '#FAFAF8');
    document.documentElement.style.setProperty('--surface1', '#F2F1EE');
    document.documentElement.style.setProperty('--surface2', '#ECECEA');
    document.documentElement.style.setProperty('--key', '#D5292A');
    document.documentElement.style.setProperty('--text', 'rgba(26,26,24,0.88)');
    document.documentElement.style.setProperty('--text-muted', 'rgba(26,26,24,0.40)');
    document.documentElement.style.setProperty('--border', 'rgba(0,0,0,0.08)');
  }
}
