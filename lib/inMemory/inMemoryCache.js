/**
 * sfdxCacheManager
 * Copyright(c) 2002-2018 Sebastien Deschamps (sfdx)
 * NO LICENCE Licensed
 */
const util = require('util')
const fetch = require('node-fetch')

/**
 * In-Memory Cache Manager
 */
class sfdxCacheManager {
    /**
     * ------
     * CONSTRUCTOR AND INTERNAL METHODS
     * ----------------------------------------------------------------------
     */

    constructor(sfdxAuth) {
        // Web services properties
        this.sfdxWebServiceUrl = 'https://tokenprovider.example.localhost:443'
        this.sfdxWebServiceOptions = {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(sfdxAuth.user + ':' + sfdxAuth.password).toString('base64')
            },
            body: null,
            redirect: 'error',
            follow: 0,
            timeout: 0,
            compress: true,
            size: 0,
            agent: null
        }
        this.marvelApiUrl = 'https://gateway.marvel.com:443'
        this.marvelApiOptions = {
            method: 'GET',
            headers: {
                'Referer': 'https://marvelapp.sebastien.deschamps.com/'
            },
            body: null,
            redirect: 'follow',
            follow: 20,
            timeout: 0,
            compress: true,
            size: 0,
            agent: null
        }

        // init in-memory cache properties
        this.inMemoryCache = null
        this.inMemoryCacheTTL = null
        this.inMemoryCacheLock = false
        this.inMemoryCacheUpdateFired = false
    }

    /**
     * get cache mapping model
     * @return {JSON}
     * @private
     */
    getCacheModel() {
        let cacheModel = {
            "comics": {
                "meta": {
                    "code": null,
                    "status": null,
                    "copyright": null,
                    "attributionText": null,
                    "attributionHTML": null,
                    "etag": null,
                    "data": {
                        "offset": null,
                        "limit": null,
                        "total": null,
                        "count": null
                    }
                },
                "pool": [],
                "comicsKeywordSearch": []
            },
            "characters":  {
                "meta": {
                    "code": null,
                    "status": null,
                    "copyright": null,
                    "attributionText": null,
                    "attributionHTML": null,
                    "etag": null,
                    "data": {
                        "offset": null,
                        "limit": null,
                        "total": null,
                        "count": null
                    }
                },
                "pool": []
            }
        }
        return cacheModel
    }

    /**
     * Build Keyword front model json
     * @return {Array}
     * @private
     */
    buildComicsKeywordSearch() {
        let comicsKeywordSearch = []
        for(let element in this.inMemoryCache.comics) {
            let comic = {
                "id": element.id,
                "title": element.title,
                "keywords": ""
            }
            comic.keywords = element.title + ' '
            if(element.characters.items.name && typeof element.characters.items.name == Array) {
                element.characters.items.name.forEach(name => {
                    comic.keywords.padEnd(
                        com.keywords.length + name.length + 1,
                        name + ' '
                    )
                    comicsKeywordSearch.push(comic)
                })
            }
            else {
                console.error('[WARNING] Comic with ID ' + element.id + "don't have characters name set!")
            }
        }
        this.comicsKeywordSearch = comicsKeywordSearch
        return true
    }

    /**
     * get comics from Marvel API
     * @return {JSON}
     * @private
     */
    async getOneTo100ComicsAtOffset(num = 1, offset = 0) {
        try {
            let response = await fetch(this.sfdxWebServiceUrl, this.sfdxWebServiceOptions)
            var json
            if(response.ok) {
                json = await response.json()
            } else {
                throw Error('[ERROR] sfdx server error: ' + response.status + ' status with message ' + response.statusText + ' in ' + __filename)
            }

            // valid json response
            if(!json.ts) {
                throw Error("[ERROR] missing sfdx ts: " + json + " in " + __filename)
            } else if(typeof json.ts !== 'string' || json.ts.length != 20) {
                throw Error("[ERROR] sfdx ts is not valid: " + json + " in " + __filename)
            } else if(!json.publicToken) {
                throw Error("[ERROR] missing sfdx publicToken: " + json + " in " + __filename)
            } else if(typeof json.publicToken !== 'string' || json.publicToken.length != 32) {
                throw Error("[ERROR] sfdx publicToken is not valid: " + json + " in " + __filename)
            }else if(!json.privateToken) {
                throw Error("[ERROR] missing sfdx privateToken: " + json + " in " + __filename)
            } else if(typeof json.privateToken !== 'string' || json.privateToken.length != 32) {
                throw Error("[ERROR] sfdx privateToken is not valid: " + json + " in " + __filename)
            }
        } catch (e) {
            console.error(e)
        } finally {
            try {
                let response = await fetch(
                    this.marvelApiUrl + '/v1/public/comics?ts=' + json.ts + '&limit=' + num + '&offset=' + offset + '&apikey=' + json.publicToken + '&hash=' + json.privateToken,
                    this.marvelApiOptions
                )
        		// test response validity
                if(response.ok) {
                    json = await response.json()
                } else {
                    throw Error('[ERROR] marvel server error on comics endpoint: ' + response.status + ' status with message ' + response.statusText + ' in ' + __filename)
                }
                // valid json response success by ensuring type 2xx http status code
                if(!json.code >= 200 && !json.code <= 299) {
                    throw Error('[ERROR] marvel server error on comics endpoint: ' + json.code + ' status with message ' + json.status + ' in ' + __filename)
                }
            } catch (e) {
                console.error(e)
            } finally {
                return json
            }
        }
    }

    /**
     * get characters from marvel API
     * @return {JSON}
     * @private
     */
    async getOneTo100CharactersAtOffset(num = 1, offset = 0) {
        try {
            let response = await fetch(this.sfdxWebServiceUrl, this.sfdxWebServiceOptions)
            var json
            if(response.ok) {
                json = await response.json()
            } else {
                throw Error('[ERROR] sfdx server error: ' + response.status + ' status with message ' + response.statusText + ' in ' + __filename)
            }

            // valid json response
            if(!json.ts) {
                throw Error("[ERROR] missing sfdx ts: " + json + " in " + __filename)
            } else if(typeof json.ts !== 'string' || json.ts.length != 20) {
                throw Error("[ERROR] sfdx ts is not valid: " + json + " in " + __filename)
            } else if(!json.publicToken) {
                throw Error("[ERROR] missing sfdx publicToken: " + json + " in " + __filename)
            } else if(typeof json.publicToken !== 'string' || json.publicToken.length != 32) {
                throw Error("[ERROR] sfdx publicToken is not valid: " + json + " in " + __filename)
            }else if(!json.privateToken) {
                throw Error("[ERROR] missing sfdx privateToken: " + json + " in " + __filename)
            } else if(typeof json.privateToken !== 'string' || json.privateToken.length != 32) {
                throw Error("[ERROR] sfdx privateToken is not valid: " + json + " in " + __filename)
            }
        } catch (e) {
            console.error(e)
        } finally {
            try {
                let response = await fetch(
                    this.marvelApiUrl + '/v1/public/characters?ts=' + json.ts + '&limit=' + num + '&offset=' + offset + '&apikey=' + json.publicToken + '&hash=' + json.privateToken,
                    this.marvelApiOptions
                )
                // test response validity
                if(response.ok) {
                    json = await response.json()
                } else {
                    throw Error('[ERROR] marvel server error on characters endpoint: ' + response.status + ' status with message ' + response.statusText + ' in ' + __filename)
                }
                // valid json response success by ensuring type 2xx http status code
                if(!json.code >= 200 && !json.code <= 299) {
                    throw Error('[ERROR] marvel server error on characters endpoint: ' + json.code + ' status with message ' + json.status + ' in ' + __filename)
                }
            } catch (e) {
                console.error(e)
            } finally {
                return json
            }
        }
    }

    /**
     * Download and format in-memory cache from Marvel
     * @return {boolean}
     * @private
     */
    async download() {
        /**
         * --
         * ----
         * ------
         * Comics entity workflow.
         * Get COMICS Entities as inMemoryCache namespaced comics property
         *
         * 1°) Get first 100 comics from offset 0
         * 2°) Initialize result template and populate datas on it with comics results
         * 3°) Calculate how many times hundred set of comics next and foreach
         *     get hundred and populate initialized result template in the same time
         * 4°) Finish getting and populating with < 100 comics rest
         * ------
         * ----
         * --
         */
        util.log('start of comics download')
        /**
         * Step 1:
         * Get first 100 Comics (limit) from offset 0
         */
        let buffer = await this.getOneTo100ComicsAtOffset(100, 0)
        /**
         * Step 2:
         * Initialize result template and populate datas on it with comics results
         */
        let _result = this.getCacheModel()
        _result.comics.meta.copyright = buffer.copyright
        _result.comics.meta.attributionText = buffer.attributionText
        _result.comics.meta.attributionHTML = buffer.attributionHTML
        _result.comics.meta.etag = buffer.etag
        _result.comics.meta.data.offset = buffer.data.offset
        _result.comics.meta.data.limit = buffer.data.limit
        _result.comics.meta.data.total = buffer.data.total
        _result.comics.meta.data.count = buffer.data.count
        buffer.data.results.forEach((element) => {
            delete element.digitalId
            delete element.issueNumber
            delete element.isbn
            delete element.upc
            delete element.diamondCode
            delete element.ean
            delete element.issn
            delete element.format
            delete element.series
            delete element.variants
            delete element.collections
            delete element.collectedIssues
            delete element.prices
            delete element.creators
            delete element.stories
            delete element.events
        })
        _result.comics.pool = buffer.data.results
        /**
         * Step 3:
         * Calculate how many times hundred set of comics next and foreach
         * get hundred and populate initialized result template in the same time
         */
	    let hits = Math.ceil((_result.comics.meta.data.total - 100) / 100)
        for(let i = 1; i < hits; i++) {
            buffer = await this.getOneTo100ComicsAtOffset(100, i)
            // Push only entities into comics
            _result.comics.pool.push(buffer.data.result)
            // update count + 100
            _result.comics.meta.data.count = _result.comics.meta.data.count + 100
        }
        /**
         * Step 4:
         * Finish getting and populating for the < 100 comics rest
         */
        let rest = _result.comics.meta.data.total - _result.comics.meta.data.count
        let offset = _result.comics.meta.data.total - rest

        buffer = await this.getOneTo100ComicsAtOffset(rest, offset)
        // Push only entities into comics
        _result.comics.pool.push(buffer.data.result)
        // update count + rest
        _result.comics.meta.data.count = _result.comics.meta.data.count + rest

        util.log('End of comics download (' + _result.comics.meta.data.count + '/' + _result.comics.meta.data.total + ' comics loaded).')

        /**
         * --
         * ----
         * ------
         * Characters entity workflow.
         * Get CHARACTERS Entities as inMemoryCache namespaced characters property
         *
         * 1°) Get first 100 characters from offset 0
         * 2°) Initialize result template and populate datas on it with characters results
         * 3°) Calculate how many times hundred set of characters next and foreach
         *     get hundred and populate initialized result template in the same time
         * 4°) Finish getting and populating with < 100 characters rest
         * ------
         * ----
         * --
         */
        util.log('start of characters download')
        /**
         * Step 1:
         * Get first 100 characters from offset 0
         */
        buffer = await this.getOneTo100CharactersAtOffset(100, 0)
        /**
         * Step 2:
         * Initialize result template and populate datas on it with characters results
         */
        _result.characters.meta.copyright = buffer.copyright
        _result.characters.meta.attributionText = buffer.attributionText
        _result.characters.meta.attributionHTML = buffer.attributionHTML
        _result.characters.meta.etag = buffer.etag
        _result.characters.meta.data.offset = buffer.data.offset
        _result.characters.meta.data.limit = buffer.data.limit
        _result.characters.meta.data.total = buffer.data.total
        _result.characters.meta.data.count = buffer.data.count
        buffer.data.results.forEach((element) => {
            delete element.events
        })
        _result.characters.pool = buffer.data.results
        /**
         * Step 3:
         * Calculate how many times hundred set of characters next and foreach
         * get hundred and populate initialized result template in the same time
         */
	    hits = Math.ceil((_result.characters.meta.data.total - 100) / 100)
        for(let i = 1; i < hits; i++) {
            buffer = await this.getOneTo100CharactersAtOffset(100, i)
            // Push only entities into comics
            _result.characters.pool.push(buffer.data.result)
            // update count + 100
            _result.characters.meta.data.count = _result.characters.meta.data.count + 100
        }
        /**
         * Step 4:
         * Finish getting and populating for the < 100 characters rest
         */
        rest = _result.characters.meta.data.total - _result.characters.meta.data.count
        offset = _result.characters.meta.data.total - rest

        buffer = await this.getOneTo100CharactersAtOffset(rest, offset)
        // Push only entities into comics
        _result.characters.pool.push(buffer.data.result)
        // update count + rest
        _result.characters.meta.data.count = _result.characters.meta.data.count + rest

        util.log('End of characters download (' + _result.comics.meta.data.count + '/' + _result.comics.meta.data.total + ' characters loaded).')

        /**
         * --
         * ----
         * ------
         * Final step:
         *
         * 1°) Lock inMemoryCache during writting
         * 2°) Set TTL date from now + 48h
         * 3°) Write in-memory cache model
         * 4°) building frontend specific result sets for each endpoints that needs it (always after writting this.inMemoryCache)
         * 5°) Unlock inMemoryCache during writting
         * 6°) Unlock update cache method
         * ------
         * ----
         * --
         */
        // Step 1
        this.inMemoryCacheLock = true
        // Step 2
        let date = new Date()
        this.inMemoryCacheTTL = date.setDate(date.getDate() + 2)
        // Step 3
        this.inMemoryCache = _result
        // Step 4
        await this.buildComicsKeywordSearch()
        // Step 5
        this.inMemoryCacheLock = false
        // Step 6
        this.inMemoryCacheUpdateFired = false
    }

    /**
     * get cache mapping model
     * @return {JSON}
     * @public
     */
    getData(endpoint = 'all') {
        if(this.inMemoryCacheLock != true && this.inMemoryCache != null) {
            switch (endpoint) {
                case 'comics':
                    return this.inMemoryCache.comics.pool

                case 'comicsMeta':
                    return this.inMemoryCache.comics.meta

                case 'comicsSearch':
                    return this.inMemoryCache.comics.comicsKeywordSearch

                case 'characters':
                    return this.inMemoryCache.characters.pool

                case 'charactersMeta':
                    return this.inMemoryCache.characters.meta

                default:
                    return this.inMemoryCache
            }
        } else {
            return 'await'
        }
    }

    /**
     * self-lock it for another possible call and start cache update
     * @return {JSON}
     * @public
     */
    startUpdate() {
        if(this.inMemoryCacheUpdateFired == false) {
            this.inMemoryCacheUpdateFired = true
            this.download()
        }
    }
}

module.exports = sfdxCacheManager
