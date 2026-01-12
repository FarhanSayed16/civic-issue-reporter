// Demo Mode Utility
// Checks if demo mode is enabled via environment variable

export const isDemoMode = () => {
  return import.meta.env.VITE_DEMO_MODE === 'true';
};

// Load mock data from public folder
export const loadMockData = async (filename) => {
  try {
    const response = await fetch(`/mock_data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load mock data: ${filename}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading mock data:', error);
    throw error;
  }
};

// Get mock AI detection result
export const getMockAIDetection = async () => {
  const data = await loadMockData('ai_detections.json');
  // Return a random detection for variety
  const randomIndex = Math.floor(Math.random() * data.detections.length);
  return {
    detections: [data.detections[randomIndex]]
  };
};

// Get mock text analysis result
export const getMockTextAnalysis = async () => {
  return await loadMockData('text_analysis.json');
};

// Get mock analytics data
export const getMockAnalytics = async () => {
  return await loadMockData('analytics.json');
};

// Get mock location
export const getMockLocation = async () => {
  const data = await loadMockData('sample_locations.json');
  const randomIndex = Math.floor(Math.random() * data.addresses.length);
  return data.addresses[randomIndex];
};

