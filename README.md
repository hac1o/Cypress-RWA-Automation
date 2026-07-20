# Cypress RWA Automation

Cypress end-to-end test automation suite for the Real World App (RWA).

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A running instance of the RWA application

## Installation

```bash
npm install
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CYPRESS_BASE_URL` | Base URL for the application under test | `http://localhost:3000` |

### Cypress Configuration

Edit `cypress.config.js` to customize:
- Base URL
- Viewport dimensions
- Timeout settings
- Screenshot/video options

## Usage

### Run All Tests

```bash
npm test
```

### Open Cypress Test Runner (GUI)

```bash
npm run test:open
```

### Run Tests in Headed Mode

```bash
npm run test:headed
```

### Run Tests in Chrome Browser

```bash
npm run test:chrome
```

## Linting & Formatting

```bash
# Run ESLint
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format
```

## Project Structure

```
├── cypress/
│   ├── e2e/              # Test specifications
│   │   └── auth/         # Authentication tests
│   │       ├── login.cy.js
│   │       ├── logout.cy.js
│   │       └── session-security.cy.js
│   ├── fixtures/         # Test data
│   │   └── users.json
│   └── support/          # Custom commands and utilities
│       ├── commands.js   # Custom Cypress commands
│       └── e2e.js        # Support file entry point
├── cypress.config.js     # Cypress configuration
├── package.json          # Dependencies and scripts
├── .eslintrc.json        # ESLint configuration
└── .prettierrc           # Prettier configuration
```

## Custom Commands

### `cy.login(username, password, rememberMe)`

Login with optional session persistence.

```javascript
// Use default credentials
cy.login();

// Custom credentials
cy.login('username', 'password');

// With remember me
cy.login('username', 'password', true);
```

### `cy.logout()`

Logout and clear session.

```javascript
cy.logout();
```

### `cy.loginViaApi(username, password)`

Faster login via API request.

```javascript
cy.loginViaApi('username', 'password');
```

## Test Fixtures

### Users (`cypress/fixtures/users.json`)

```json
{
  "standardUser": {
    "username": "Heath93",
    "password": "s3cret"
  },
  "invalidUser": {
    "username": "FakeUser",
    "password": "WrongPassword"
  }
}
```

## Reporting

Test reports are generated using Mochawesome. Reports can be found in the `mochawesome-report` directory after test execution.

## License

ISC
