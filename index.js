const { getNode } = require('./utils/functions');
const node = getNode();

if (!node) {
    console.log('Provide a valid node');
    process.exit(1);
}
