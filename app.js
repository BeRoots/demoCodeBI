/**
 * --
 * ----
 * ------
 * Dependencies
 * ------
 * ----
 * --
 */
const express = require('express')

/**
 * --
 * ----
 * ------
 * Express application properties
 * ------
 * ----
 * --
 */
const app = express()
const port = (process.env.NODE_EXPRESS_PORT) ? process.env.NODE_EXPRESS_PORT : 63000

/**
 * --
 * ----
 * ------
 * Middlewares
 * ------
 * ----
 * --
 */
app.use(require('./middleware/clientValidator/clientValidator.js'))
app.use(require('./middleware/inMemory/marverCacheUpdateTrigger.js'))
app.use(express.json())

/**
 * --
 * ----
 * ------
 *  Routes definitions
 * ------
 * ----
 * --
 */

/**
 * Route to get comicsMeta json
 * @return {json|HTML}
 */
app.get(
    "/comics-meta",
    require('./middleware/inMemory/inMemorySureFire.js'),
    function(request, response) {
        if(require('./main').inMemoryCache.getData('comics').meta) {
            response.json(require('./main').inMemoryCache.getData('comics').meta)
        } else response.status(404).send('./public/404.html')
    }
)
/**
 * Route to get comics json
 * @return {json|HTML}
 */
app.get(
    "/getComics",
    require('./middleware/inMemory/inMemorySureFire.js'),
    function(request, response) {
        if(require('./main').inMemoryCache.getData('comics').pool.length > 0) {
                response.json(require('./main').inMemoryCache.getData('comics').pool)
        } else response.status(404).send('./public/404.html')
    }
)
/**
 * Route to get comic json by id
 * @param {int} comicId
 * @return {json|HTML}
 */
app.get(
    "/getComicsById/:comicId",
    require('./middleware/inMemory/inMemorySureFire.js'),
    function(request, response) {
        if(require('./main').inMemoryCache.getData('comics').pool[request.params.comicId]) {
                response.json(require('./main').inMemoryCache.getData('comics').pool[request.params.comicId])
        } else response.status(404).send('./public/404.html')
    }
)
/**
 * Route to get comic json by offset
 * @param {int} offsetId
 * @return {json|HTML}
 */
app.get(
    "/getComicsByOffset/:comicOffset",
    require('./middleware/inMemory/inMemorySureFire.js'),
    function(request, response) {
        if(require('./main').inMemoryCache.getData('comics').pool[request.params.comicOffset]) {
                response.json(require('./main').inMemoryCache.getData('comics').pool[request.params.comicOffset])
        } else response.status(404).send('./public/404.html')
    }
)
/**
 * Route to get charactersMeta json
 * @return {json|HTML}
 */
app.get(
    "/getCharactersMeta",
    require('./middleware/inMemory/inMemorySureFire.js'),
    function(request, response) {
        if(require('./main').inMemoryCache.getData('characters').meta) {
            response.json(require('./main').inMemoryCache.getData('characters').meta)
        } else response.status(404).send('./public/404.html')
    }
)
/**
 * Route to get characters json
 * @return {json|HTML}
 */
app.get(
    "/getCharacters",
    require('./middleware/inMemory/inMemorySureFire.js'),
    function(request, response) {
        if(require('./main').inMemoryCache.getData('characters').pool.length > 0) {
                response.json(require('./main').inMemoryCache.getData('characters').pool)
        } else response.status(404).send('./public/404.html')
    }
)
/**
 * Route to get character json by id
 * @param {int} characterId
 * @return {json|HTML}
 */
app.get(
    "/getCharacterById/:characterId",
    require('./middleware/inMemory/inMemorySureFire.js'),
    function(request, response) {
        if(require('./main').inMemoryCache.getData('characters').pool[request.params.characterId]) {
                response.json(require('./main').inMemoryCache.getData('characters').pool[request.params.characterId])
        } else response.status(404).send('./public/404.html')
    }
)
/**
 * Route to get character json by offset
 * @param {int} characterOffset
 * @return {json|HTML}
 */
app.get(
    "/getCharacterByOffset/:characterOffset",
    require('./middleware/inMemory/inMemorySureFire.js'),
    function(request, response) {
        if(require('./main').inMemoryCache.getData('characters').pool[request.params.characterOffset]) {
                response.json(require('./main').inMemoryCache.getData('characters').pool[request.params.characterOffset])
        } else response.status(404).send('./public/404.html')
    }
)
/**
 * Route to get comicsKeywordSearch json
 * @return {json|HTML}
 */
app.get(
    "/getComicsSearchKeyword",
    require('./middleware/inMemory/inMemorySureFire.js'),
    function(request, response) {
        if (require('./main').inMemoryCache.comics.comicsSearchKeyword) {
            response.json(require('./main').inMemoryCache.comics.comicsSearchKeyword)
        } else response.status(404).send('./public/404.html')
    }
)

/**
 * --
 * ----
 * ------
 * Server start listening
 * ------
 * ----
 * --
 */
app.listen(port, () => console.log('Server started and listening on port' + port + '... (Ctrl+C to quit)'))
