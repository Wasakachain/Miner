const crypto = require('crypto');
const Url = require('url');
const http = require('http');
const querystring = require('querystring');

/**
 * Return formated headers
 * @param {*} data to calculate data length
 */
function __setHeaders(data = null) {
    let header = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    if (data) {
        header['Content-Length'] = Buffer.byteLength(querystring.stringify(data));
    }
    return header;
}

/**
 * Get the nodeURL given in command line parameters
 * @returns {string}
 */
exports.getNode = function () {
    return process.argv[2];
}

/**
 * Send a request
 * @param {string} url 
 * @param {string} method
 * @param {data} data
 *   
 * @returns {Promise}
 */
exports.request = (url, method = 'GET', data) => {
    return new Promise((resolve, reject) => {
        let parsedUrl = Url.parse(url);
        const handler = parsedUrl.port == 443 ? https : http;

        let output = '';
        const req = handler.request({
            host: `${parsedUrl.hostname}`, port: parsedUrl.port, path: parsedUrl.path, method, headers: __setHeaders(data)
        }, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                output += chunk;
            });

            res.on('end', () => {
                let response = JSON.parse(output);
                if (res.statusCode >= 300) {
                    reject({ status: res.statusCode, data: response });
                    return;
                }
                resolve({ status: res.statusCode, data: response });
            });
        });

        req.on('error', (err) => {
            reject({ error: err });
        });

        if (data) {
            req.write(querystring.stringify(data));
        }

        req.end();
    })
};

/**
 * Create sha256 hash from given data
 * @param {string} data data to hash
 */
exports.sha256 = function (data) {
    return crypto.createHash('sha256').update(data).digest('hex')
}
