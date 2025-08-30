import React, { useState, useEffect } from 'react';

const themes = [
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'System', value: 'system' },
];

const Settings: React.FC = () => {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
  }, []);

  return (
    <div className="max-w-xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Theme</h2>
        <div className="flex gap-4">
          {themes.map((t) => (
            <button
              key={t.value}
              className={`px-4 py-2 rounded-lg border transition-all duration-200 ${theme === t.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50'}`}
              onClick={() => setTheme(t.value)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings; 