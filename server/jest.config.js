module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'controllers/cardController.js',
    'routes/cardRoutes.js',
    'middleware/auth.js',
  ],
};
