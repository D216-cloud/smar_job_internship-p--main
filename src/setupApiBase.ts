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

// Patch global fetch with better error handling
const _fetch = window.fetch;
window.fetch = function(input: RequestInfo, init?: RequestInit) {
  try {
    if (typeof input === 'string') {
      input = prependBase(input);
    } else if (input instanceof Request) {
      const url = input.url;
      const newUrl = prependBase(url);
      if (newUrl !== url) {
        input = new Request(newUrl, {
          method: input.method,
          headers: input.headers,
          body: input.body,
          mode: input.mode,
          credentials: input.credentials,
          cache: input.cache,
          redirect: input.redirect,
          referrer: input.referrer,
          integrity: input.integrity,
        });
      }
    }
  } catch (e) {
    console.error('Error prepending base URL to fetch:', e);
  }
  return _fetch.call(this, input as RequestInfo, init);
};

// Patch axios if present with better error handling
try {
  axios.interceptors.request.use((config) => {
    if (!config.url) return config;
    config.url = prependBase(config.url as string);
    return config;
  }, (error) => {
    console.error('Axios request interceptor error:', error);
    return Promise.reject(error);
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 404) {
        console.warn('API endpoint not found:', error.config?.url);
      }
      return Promise.reject(error);
    }
  );
} catch (e) {
  // ignore if axios isn't available yet
  console.warn('Axios not available for interceptor setup');
}

export { BASE };
