let inMemoryCache = require('./inMemoryCache.js')

module.exports = {
    getInMemoryCache: async function (credentials) {
        let imc = new inMemoryCache(credentials)
        await imc.download()
        return imc
    }
}