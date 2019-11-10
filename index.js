const { getNode } = require('./utils/functions');
const Miner = require('./models/Miner');

const node = getNode();

if (!node) {
    console.log('Provide a valid node');
    process.exit(1);
}

const miner = new Miner(node);

(async () => {
    while (true) {
        await miner.requestBlock();
        if (miner.blockCandidate) {
            miner.mineBlock();
            // console.log(miner.minedBlock)
            miner.submitBlock();
        }
    }
})();