const { getNode } = require('./utils/functions');
const Miner = require('./models/Miner');
const { generateMnemonic, loadAccount } = require('./utils/account');
const fs = require('fs');

const node = getNode(); // get the URL of the node given in the terminal parameters

if (!node) {
    console.log('Provide a valid node');
    process.exit(1);
}

let account;

if (fs.existsSync('./account.json')) {
    account = JSON.parse(fs.readFileSync('./account.json', { encoding: 'UTF8' }));
} else {
    account = loadAccount(generateMnemonic());
    fs.writeFileSync('./account.json', JSON.stringify(account), { encoding: 'UTF8' });
}

const miner = new Miner(node, account.address); // create miner instance

(async () => {
    while (true) {
        await miner.requestBlock(); // request a block candidate
        if (miner.blockCandidate) { // if there are block candidate
            miner.mineBlock();  // mine block candidate
            miner.submitBlock(); // send the mined block
        }
    }
})();