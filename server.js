const restify = require('restify')
const { ensureHeaderContentType, logErrors } = require('./middleware')
require('dotenv').config()
// require('./passport')
require('./db')
const server = restify.createServer()

require('./routes/users')(server)

// middleware
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())
// custom middleware to ensure the request ContentType is application/json
server.use(ensureHeaderContentType)
// check error message in console
server.use(logErrors)

server.listen(process.env.PORT, () => {
  console.log(`server listening at ${process.env.PORT}`)
})
