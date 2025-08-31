// This module normalizes API base URL for fetch and axios.
// It prepends VITE_API_URL to relative paths that start with '/api' or '/uploads'.
import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function prependBase(url: string) {
  if (!BASE) return url;
  // Only prepend for relative API paths
  if (url.startsWith('/api') || url.startsWith('/uploads') || url.startsWith('/resume')) {
    return `${BASE}${url}`;
  }
  // if url already absolute, return unchanged
  if (/^https?:\/\//i.test(url)) return url;
  return url;
}

// Patch global fetch
const _fetch = window.fetch;
window.fetch = function(input: RequestInfo, init?: RequestInit) {
  try {
    if (typeof input === 'string') {
      input = prependBase(input);
    } else if (input instanceof Request) {
      const url = input.url;
      const newUrl = prependBase(url);
      if (newUrl !== url) {
        input = new Request(newUrl, input);
      }
    }
  } catch (e) {
    console.error('Error prepending base URL to fetch:', e);
  }
  return _fetch.call(this, input as any, init);
};

// Patch axios if present
try {
  axios.interceptors.request.use((config) => {
    if (!config.url) return config;
    config.url = prependBase(config.url as string);
    return config;
  });
} catch (e) {
  // ignore if axios isn't available yet
}

export { BASE };
