// Initialize Umami Analytics
export const initializeUmami = () => {
  const umamiUrl = import.meta.env.VITE_UMAMI_URL;
  const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID;

  // Only initialize if both environment variables are set
  if (!umamiUrl || !websiteId) {
    console.warn('Umami analytics not configured - missing environment variables');
    return;
  }

  // Create and inject the Umami script tag
  const script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-website-id', websiteId);
  script.src = `${umamiUrl}/script.js`;

  document.head.appendChild(script);

  console.log('Umami analytics initialized');
};
