/**
 * Date utility functions for task grouping and comparison
 * Used for organizing tasks by date categories (today, tomorrow, etc.)
 */

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Check if a date is day after tomorrow (2 days from now)
 */
export function isDayAfter(date: Date): boolean {
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  return (
    date.getDate() === dayAfter.getDate() &&
    date.getMonth() === dayAfter.getMonth() &&
    date.getFullYear() === dayAfter.getFullYear()
  );
}

/**
 * Check if a date is later (beyond day after tomorrow)
 */
export function isLater(date: Date): boolean {
  return !isToday(date) && !isTomorrow(date) && !isDayAfter(date);
}

/**
 * Get relative date description for display
 */
export function getRelativeDateDescription(date: Date): string {
  if (isToday(date)) return 'Bugün';
  if (isTomorrow(date)) return 'Yarın';
  if (isDayAfter(date)) return 'Ertesi Gün';
  return 'Sonraki';
}

/**
 * Format date for display in Turkish locale
 */
export function formatDateTurkish(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    ...options
  };
  
  return date.toLocaleDateString('tr-TR', defaultOptions);
}

/**
 * Check if a date is overdue (before today)
 */
export function isOverdue(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day
  
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  return compareDate < today;
}