/**
 * inMemoryProxyServer main.js
 * Copyright(c) 2002-2018 Sebastien Deschamps
 * NO LICENCE Licensed
 */
const util = require('util')
const v8 = require('v8')
const fs = require('fs')
const prompt = require('prompt')

function getCredentials () {
    var schema = {
        properties: {
            name: {
                pattern: /^[a-zA-Z0-9_\-]+$/,
                message: 'Name must be only letters, digits, underscores, or dashes',
                required: true
            },
            password: {
                hidden: true,
                required: true
            }
        }
    }

    prompt.start()

    return new Promise((resolve, reject) => {
        prompt.get(schema, function (err, result) {
            if(typeof err === "undefined") {
                return reject(err)
            } else {
                resolve({user: result.name, password: result.password})
            }
        })
    })
}

async function main() {
    try {
        // Print server banner
        let banner = fs.readFileSync("lib/banner/banner.txt", "utf8")
        console.log(banner)
        delete banner
    
        // Display welcome message
        console.log('Welcome on my marvel in-memory cache proxy server')
    
        // Prompt sfdx web service credentials
        util.log('[INFO] ' + __filename + ':')
        console.log('Enter sfdx web service credentials:')

        // Read for sfdx webservice user and password
        let sfdxAuth = await getCredentials()

        // Initialise serveur
        util.log('[INFO] ' + __filename + ':')
        console.log('Server Initialisation in progress...')

        // Init In-Memory singleton instance
        let inMemoryCacheFactory = require('./lib/inMemory/inMemoryCacheFactory.js')
        let inMemoryCache = await inMemoryCacheFactory.getInMemoryCache(sfdxAuth)
        module.exports.inMemoryCache = inMemoryCache
        // clear sfdx webservice user and password
        sfdxAuth = null
    } catch (e) {
        // Catch launching errors
        util.log('[ERROR] Error catched in ' + __filename)
        console.log(e.message)
        process.exit(1)
    } finally {
        /**
         * Now you can performing the HTTP REST API and start listening
         * without any data access errors from out.
         */
        util.log('[INFO] ' + __filename + ':')
        console.log('Server Initialized. Starting express application (listening)')
        require('./app.js')
console.log("-----------------------------")
console.log("--- Heap Statistics debug ---")
console.log("-----------------------------")
console.log(v8.getHeapStatistics)
console.log("-----------------------------")
console.log(v8.getHeapStatistics())
console.log("-----------------------------")
console.log(v8.getHeapSpaceStatistics)
console.log("-----------------------------")
console.log(v8.getHeapSpaceStatistics())
    }
}

main()