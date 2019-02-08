const restify = require('restify')
const { ensureHeaderContentType, logErrors } = require('./middleware')
const rjwt = require('restify-jwt-community')
require('dotenv').config()
// require('./passport')
require('./db')
const server = restify.createServer()

require('./routes/users')(server)
require('./routes/auth')(server)

// middleware
server.use(restify.plugins.queryParser())
server.use(restify.plugins.bodyParser())
server.use(
  rjwt({ secret: process.env.JWT_SECRET }).unless({ path: ['/auth/login'] })
)
// custom middleware to ensure the request ContentType is application/json
server.use(ensureHeaderContentType)
// check error message in console
server.use(logErrors)

server.listen(process.env.PORT, () => {
  console.log(`server listening at ${process.env.PORT}`)
})
