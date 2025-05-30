import { useSelector } from 'react-redux';

export default function useTranslationFallback() {
  const { language } = useSelector((state) => state.language);
  
  // Basic translation function (replace with your real translation implementation)
  const t = (key) => {
    const translations = {
      'guest.Suqee': 'Suqee',
      'guest.Login': 'Login',
      'guest.Home': 'Home',
      'guest.Start Now': 'Start Now',
      'guest.YouTube video player': 'YouTube video player',
      'guest.Feature 1 Title': 'Feature 1 Title',
      'guest.Feature 1 Description': 'Feature 1 Description',
      'guest.Feature 2 Title': 'Feature 2 Title',
      'guest.Feature 2 Description': 'Feature 2 Description',
      'guest.Feature 3 Title': 'Feature 3 Title',
      'guest.Feature 3 Description': 'Feature 3 Description',
      'guest.Business Owner': 'Business Owner',
      'guest.Retail Manager': 'Retail Manager',
      'guest.Store Owner': 'Store Owner',
      'guest.Testimonial 1': 'This platform transformed my business operations!',
      'guest.Testimonial 2': 'The best inventory management system I\'ve used.',
      'guest.Testimonial 3': 'Increased my productivity by 50% in just a month.',
      'guest.Suqee system': 'Suqee system',
      'guest.All rights reserved.': 'All rights reserved.'
    };
    return translations[key] || key;
  };

  return { t, language };
} 