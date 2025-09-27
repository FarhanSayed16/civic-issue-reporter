import { useState, useEffect } from 'react';

export const useHCaptcha = () => {
  const [siteKey, setSiteKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSiteKey = async () => {
      try {
        const response = await fetch('http://localhost:8585/auth/hcaptcha/site-key');
        if (!response.ok) {
          throw new Error('Failed to fetch hCaptcha site key');
        }
        const data = await response.json();
        setSiteKey(data.site_key);
      } catch (err) {
        console.error('Error fetching hCaptcha site key:', err);
        setError(err.message);
        // Fallback to your real site key
        setSiteKey('8ad28422-5884-4800-b902-12b625c68852');
      } finally {
        setLoading(false);
      }
    };

    fetchSiteKey();
  }, []);

  return { siteKey, loading, error };
};
