import { useState, useEffect } from 'react';
import HeroPage from './components/HeroPage';
import BrandSetup from './components/BrandSetup';
import MainPage from './components/MainPage';
import { getBrandConfig } from './utils/storage';
import { getTheme, setTheme } from './utils/theme';

export default function App() {
  const [brandConfig, setBrandConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showHero, setShowHero] = useState(true);
  const [isDark, setIsDark] = useState(() => getTheme() === 'dark');

  useEffect(() => {
    setTheme(getTheme());
    const config = getBrandConfig();
    setBrandConfig(config);
    setIsLoading(false);
    // Skip hero if brand is already set up
    if (config) setShowHero(false);
  }, []);

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
    setIsDark(!isDark);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-0 flex items-center justify-center">
        <div className="w-5 h-5 border border-black/10 border-t-black/40 rounded-full animate-spin" />
      </div>
    );
  }

  if (showHero) {
    return <HeroPage onEnter={() => setShowHero(false)} onToggleTheme={toggleTheme} isDark={isDark} />;
  }

  if (!brandConfig) {
    return <BrandSetup onComplete={setBrandConfig} onBack={() => setShowHero(true)} onToggleTheme={toggleTheme} isDark={isDark} />;
  }

  return (
    <MainPage
      brandConfig={brandConfig}
      onResetBrand={() => { setBrandConfig(null); setShowHero(true); }}
      onUpdateBrand={setBrandConfig}
      onToggleTheme={toggleTheme}
      isDark={isDark}
    />
  );
}
