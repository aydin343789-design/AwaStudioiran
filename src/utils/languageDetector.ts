/**
 * Smart zero-API client-side Language Detector & Text Sanitizer
 */

export function detectLanguage(text: string): 'fa' | 'en' {
  if (!text || !text.trim()) return 'fa';

  // Count Persian/Arabic characters vs English Latin characters
  const persianMatches = text.match(/[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF]/g) || [];
  const englishMatches = text.match(/[a-zA-Z]/g) || [];

  if (englishMatches.length > persianMatches.length) {
    return 'en';
  }
  return 'fa';
}

// Clean and optimize English text for natural cadence
export function optimizeEnglishText(text: string): string {
  let res = text.trim();
  // Ensure appropriate spacing after punctuation
  res = res.replace(/([,;:.?!])([a-zA-Z])/g, '$1 $2');
  // Expand common contractions if helpful for speech
  res = res.replace(/\bw\/\b/g, 'with');
  res = res.replace(/\bw\/o\b/g, 'without');
  res = res.replace(/\bapprox\.\b/gi, 'approximately');
  res = res.replace(/\be\.g\.\b/gi, 'for example');
  res = res.replace(/\bi\.e\.\b/gi, 'that is');
  return res;
}
