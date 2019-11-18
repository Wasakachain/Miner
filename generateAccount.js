const ethers = require('ethers');
const bip39 = require('bip39');
const bip32 = require('bip32');
const elliptic = require('elliptic');
const secp256k1 = new elliptic.ec('secp256k1');
const ripemd160 = require('ripemd160');
const fs = require('fs');

const purpose = "m/44";
// our picked unused number for wasakachain coin.
// picked from: https://github.com/satoshilabs/slips/blob/master/slip-0044.md
const coinType = "/696969'";
const account = "/0'"
const change = "/0"

const mainPath = purpose + coinType + account + change;

fs.writeFileSync('./account.json', JSON.stringify(loadAccount(generateMnemonic())), { encoding: 'UTF8' });

function toHexString(value) {
    let hexString = value.toString(16);
    let padding = 64 - hexString.length;
    if (!padding) {
        return hexString;
    }
    padding = new Array(padding).fill('0');
    return `${padding.join('')}${hexString}`;
}

function generateEntropy(length = 16) {
    return ethers.utils.randomBytes(length); // cryptographyc secure seed
}

function getAddress(publicKeyCompressed) {
    return new ripemd160().update(publicKeyCompressed).digest('hex');
}

function getCompressedPublicKey(publicPoints) {
    return `${toHexString(publicPoints.x)}${publicPoints.encodeCompressed('hex').substring(0, 2) === '02' ? 0 : 1}`;
}

function createAccount(rootKey, index) {
    let pathFromRootKey = rootKey.derivePath(mainPath + '/' + index);
    let keyPair = secp256k1.keyFromPrivate(pathFromRootKey.privateKey);
    let publicKey = getCompressedPublicKey(keyPair.getPublic());
    let address = '0x' + getAddress(publicKey);
    publicKey = '0x' + publicKey;
    let privateKey = '0x' + keyPair.getPrivate().toString('hex');
    return {
        publicKey, address, privateKey
    }
}

function generateMnemonic() {
    return ethers.utils.HDNode.entropyToMnemonic(generateEntropy(16)); // cryptographyc secure seed
}

function loadAccount(mnemonic, count = 1) {
    seed = bip39.mnemonicToSeedSync(mnemonic);
    const rootKey = bip32.fromSeed(seed);
    return createAccount(rootKey, count);
}


