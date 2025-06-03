// Jest setup for three-test-suite
process.on('unhandledRejection', (reason, promise) => {
  console.warn('Unhandled Rejection at:', promise, 'reason:', reason);
});

if (process.env.NODE_ENV === 'test') {
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  
  console.log = (...args) => {
    if (args.some(arg => String(arg).includes('DEBUG'))) {
      originalConsoleLog(...args);
    }
  };
  
  console.warn = (...args) => {
    if (args.some(arg => String(arg).includes('WARNING') || String(arg).includes('Unhandled'))) {
      originalConsoleWarn(...args);
    }
  };
}
