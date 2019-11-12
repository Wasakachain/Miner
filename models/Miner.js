const { request } = require('../utils/functions');
const Block = require('./Block');

class Miner {
    /**
     * Miner representation class
     * @param {string} node node url
     */
    constructor(node, address) {
        this.node = node;
        this.address = address;
        this.blockCandidate = null;
        this.minedBlock = null;
    }

    /**
     * Request block candidate to the connected node
     */
    async requestBlock() {
        try {
            const { data } = await request(`${this.node}/mining/get-mining-job/${this.address}`, 'GET');
            this.blockCandidate = new Block(data);
        } catch (error) { }
    }

    /**
     * Mine the block candidate
     */
    mineBlock() {
        console.log('\x1b[43m%s\x1b[0m', `Mining block candidate #${this.blockCandidate.index}`)
        this.minedBlock = this.blockCandidate.mine();
        this.blockCandidate = null;
        console.log('\x1b[36m%s\x1b[0m', 'Block mined!');
    }

    /**
     * Send the mined block to the connected node
     */
    async submitBlock() {
        try {
            const res = await request(`${this.node}/mining/submit-mined-block`, 'POST', this.minedBlock);
            this.minedBlock = null;
            console.log('\x1b[42m%s\x1b[0m', res.data.message);
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = Miner