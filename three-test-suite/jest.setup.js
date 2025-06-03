// Jest setup for three-test-suite
// Puppeteer tests cleanup configuration

// Handle unhandled promise rejections during tests
process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Suppress console output during tests unless explicitly needed
if (process.env.NODE_ENV === 'test') {
  // Keep console.error for debugging
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  
  console.log = (...args) => {
    // Only log if it contains "DEBUG" or test explicitly needs it
    if (args.some(arg => String(arg).includes('DEBUG'))) {
      originalConsoleLog(...args);
    }
  };
  
  console.warn = (...args) => {
    // Only warn for important warnings
    if (args.some(arg => String(arg).includes('WARNING') || String(arg).includes('Unhandled'))) {
      originalConsoleWarn(...args);
    }
  };
}
