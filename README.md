# Web3DExplorer

3D web visualization library with TDD-driven testing framework for Three.js applications. Features Tokyo Station exploration with GIS integration.

## Project Structure

```
Web3DExplorer/
├── three-test-suite/       # Testing framework for Three.js
│   ├── src/                # Test library source
│   └── __tests__/          # Tests for the test library
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

# Run tests
npm run test:suite

# Development server (後で実装)
npm run dev
```

## Current Status

🚀 **Issue #1**: PuppeteerManager - ブラウザ起動・終了機能 (Ready to implement)

## TDD Development

This project follows strict TDD methodology:

1. **Red**: Write failing tests first
2. **Green**: Write minimal code to pass tests
3. **Refactor**: Clean up code while keeping tests green

## Contributing

Please follow TDD approach:
1. Write tests first
2. Make tests pass
3. Refactor
4. Repeat