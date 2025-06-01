# Web3DExplorer

3D web visualization library with TDD-driven testing framework for Three.js applications. Features Tokyo Station exploration with GIS integration.

## Project Structure

```
Web3DExplorer/
├── three-test-suite/       # Testing framework for Three.js
│   ├── src/                # Test library source
│   │   └── PuppeteerManager.js
│   └── __tests__/          # Tests for the test library
│       └── PuppeteerManager.test.js
├── src/                    # Main application source
├── __tests__/              # Main application tests
└── docs/                   # Documentation
```

## Development Phases

### Phase 1: Test Framework Development (Issues #1-#10)
Building the `three-test-suite` library with TDD approach.

### Phase 2: Main Project Foundation (Issues #11-#13)
Basic React + Three.js application setup.

### Phase 3: Tokyo Station Implementation (Issues #14-#16)
3D Tokyo Station model integration and testing.

### Phase 4: GIS Integration
Cesium.js integration for real-world mapping.

## Getting Started

```bash
# Clone repository
git clone https://github.com/usaganikki/Web3DExplorer.git
cd Web3DExplorer

# Install dependencies
npm install

# Install test suite dependencies
cd three-test-suite
npm install
cd ..

# Run Issue #1 tests
cd three-test-suite && npm test
```

## Current Status

✅ **Issue #1**: PuppeteerManager - ブラウザ起動・終了機能 (COMPLETED - TDD RED+GREEN)

**Next**: Issue #2: PuppeteerManager - WebGL有効化機能

## TDD Development

This project follows strict TDD methodology:

1. **Red**: Write failing tests first ✅
2. **Green**: Write minimal code to pass tests ✅  
3. **Refactor**: Clean up code while keeping tests green

### Issue #1 Progress

✅ **RED Phase**: Test cases written first  
✅ **GREEN Phase**: Minimal implementation passes all tests  
🎯 **Ready for Issue #2**

## Running Tests

```bash
# Run test suite tests
cd three-test-suite && npm test

# Watch mode for development
cd three-test-suite && npm run test:watch
```

## Contributing

Please follow TDD approach:
1. Write tests first (RED)
2. Make tests pass (GREEN) 
3. Refactor while keeping tests green
4. Repeat for next feature

## Files Implemented

- `three-test-suite/src/PuppeteerManager.js` - Core Puppeteer browser management
- `three-test-suite/__tests__/PuppeteerManager.test.js` - Comprehensive test suite
- Project configuration (Jest, ESLint, Prettier)

Test coverage: 6 test cases covering initialization, cleanup, options, and edge cases.