// Discord utilities for frontend
export const normalizeArabicText = (text: string): string => {
  return text.trim().toLowerCase().replace(/[^\u0600-\u06FF\s]/g, '');
};

export const validateOathText = (userInput: string, requiredText: string): boolean => {
  const normalizedInput = normalizeArabicText(userInput);
  const normalizedRequired = normalizeArabicText(requiredText);
  return normalizedInput === normalizedRequired;
};
