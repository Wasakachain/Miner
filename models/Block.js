const { sha256 } = require('../utils/functions');

class Block {
    constructor(index, transactionsIncluded, difficulty, expectedReward, rewardAddress, blockDataHash) {
        this.index = index;
        this.transactionsIncluded = transactionsIncluded;
        this.difficulty = difficulty;
        this.expectedReward = expectedReward;
        this.rewardAddress = rewardAddress;
        this.blockDataHash = blockDataHash;

        this.nonce = 0;
        this.dateCreated = new Date().toISOString();
    }

    validProof() {
        return "0".repeat(this.difficulty) === this.hash().slice(0, this.difficulty);
    }

    hash() {
        return sha256(JSON.stringify({ blockDataHash: this.blockDataHash, dateCreated: this.dateCreated, nonce: this.nonce }));
    }

    mine() {
        this.nonce = 0;
        while (!this.validProof()) {
            this.nonce++;
        }
        return {
            blockDataHash: this.blockDataHash,
            dateCreated: this.dateCreated,
            nonce: this.nonce,
            blockHash: this.hash(),
        };
    }

}

module.exports = Block;