/**
 * Suppresses hydration warnings caused by browser extensions
 * This is safe to use since extensions commonly modify the DOM
 * and we can't control them from our application
 */
export function suppressHydrationWarnings() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    
    console.error = (...args: unknown[]) => {
      // Suppress hydration warnings caused by browser extensions
      const message = args[0];
      if (
        typeof message === 'string' &&
        (message.includes('A tree hydrated but some attributes of the server rendered HTML') ||
         message.includes('clickup-chrome-ext_installed') ||
         message.includes('suppressHydrationWarning'))
      ) {
        return; // Suppress this warning
      }
      
      // Allow all other console.error calls to proceed normally
      originalError.apply(console, args);
    };
  }
}