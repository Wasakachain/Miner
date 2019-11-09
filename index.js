const { getNode } = require('./utils/functions');
const Miner = require('./models/Miner');

const node = getNode();

if (!node) {
    console.log('Provide a valid node');
    process.exit(1);
}

const miner = new Miner(node, '0'.repeat(64));

(async () => {
    while (true) {
        miner.requestBlock();
        if (miner.blockCandidate) {
            miner.mineBlock();
            miner.submitBlock();
        }
    }
})();