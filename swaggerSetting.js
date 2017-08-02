
// swagger definition
var swaggerDefinition = {
  info: {
    title: 'CDMIS REST API',
    version: '2.0.0',
    description: '肾事管家'
  },
  host: '121.43.107.106:4060',
  basePath: '/api/v2'
}

module.exports = {
  // options for the swagger docs
  options: {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./routes/routes_v2.js']
  }
}
