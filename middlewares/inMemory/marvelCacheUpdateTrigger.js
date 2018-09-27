// Middleware to check cache validity and run update if needed
module.exports = (request, response, next) => {
    if(new Date() > require('../../main.js').inMemoryCache.inMemoryCacheTTL) {
        require('../../main.js').inMemoryCache.startUpdate()
    }
    next()
}