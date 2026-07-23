const assert = require('node:assert/strict');
const cases = ['NOT_FOUND','ACCESS_DENIED','NOT_MARKDOWN','NETWORK_ERROR','TIMEOUT','TOO_LARGE'];
assert.deepEqual(cases, ['NOT_FOUND','ACCESS_DENIED','NOT_MARKDOWN','NETWORK_ERROR','TIMEOUT','TOO_LARGE']);
console.log('fetch classification cases documented:', cases.join(', '));
