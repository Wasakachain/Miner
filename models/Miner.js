const { request } = require('../utils/functions');
const Block = require('./Block');

class Miner {
    constructor(node, address) {
        this.node = node;
        this.address = address
        this.blockCandidate = null;
        this.minedBlock = null;
    }
    async requestBlock() {
        try {
            const { data } = await request(`${this.node}/mining/get-mining-job/${this.address}`, 'GET');
            this.blockCandidate = new Block(data);
        } catch (error) { }
    }

    mineBlock() {
        this.minedBlock = this.blockCandidate.mine();
        this.blockCandidate = null;
    }

    async submitBlock() {
        try {
            const res = await request(`${this.node}/mining/submit-mined-block`, 'POST', this.minedBlock);
            this.minedBlock = null;
        } catch (error) { }
    }
}

module.exports = Miner