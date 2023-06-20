// jest.setup.js
global.setImmediate = global.setTimeout;
global.clearImmediate = global.clearTimeout;
