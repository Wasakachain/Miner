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
        this.minedBlock = this.blockCandidate.mine();
        this.blockCandidate = null;
        console.log('Block mined!');
    }

    /**
     * Send the mined block to the connected node
     */
    async submitBlock() {
        try {
            const res = await request(`${this.node}/mining/submit-mined-block`, 'POST', this.minedBlock);
            this.minedBlock = null;
            console.log(res.data.message);
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = Miner