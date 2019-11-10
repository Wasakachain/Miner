const { getNode } = require('./utils/functions');
const Miner = require('./models/Miner');

const node = getNode(); // get the URL of the node given in the terminal parameters

if (!node) {
    console.log('Provide a valid node');
    process.exit(1);
}

const miner = new Miner(node); // create miner instance

(async () => {
    while (true) {
        await miner.requestBlock(); // request a block candidate
        if (miner.blockCandidate) { // if there are block candidate
            miner.mineBlock();  // mine block candidate
            miner.submitBlock(); // send the mined block
        }
    }
})();