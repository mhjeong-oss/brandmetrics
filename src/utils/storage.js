const BRAND_KEY = 'brandmetrics_config';

export function getBrandConfig() {
  try {
    const raw = localStorage.getItem(BRAND_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveBrandConfig(config) {
  localStorage.setItem(BRAND_KEY, JSON.stringify(config));
}

export function clearBrandConfig() {
  localStorage.removeItem(BRAND_KEY);
}
