// Middleware to check client security requirements
module.exports = (request, response, next) => {
    if(request.get('Referer') == 'client.example.localhost') {
        next()
    } else {
        response.sendStatus(403);
    }
}