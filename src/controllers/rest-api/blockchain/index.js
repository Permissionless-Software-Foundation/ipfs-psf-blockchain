/*
  REST API library for the /blockchain route.
*/

// Public npm libraries.
import Router from 'koa-router'

// Local libraries.
import BlockchainRESTControllerLib from './controller.js'
import Validators from '../middleware/validators.js'

class BlockchainRouter {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Blockchain REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Blockchain REST Controller.'
      )
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Encapsulate dependencies.
    this.blockchainRESTController = new BlockchainRESTControllerLib(dependencies)
    this.validators = new Validators(dependencies)

    // Instantiate the router and set the base route.
    const baseUrl = '/blockchain'
    this.router = new Router({ prefix: baseUrl })

    // _this = this
  }

  attach (app) {
    if (!app) {
      throw new Error(
        'Must pass app object when attaching REST API controllers.'
      )
    }

    // Define the routes and attach the controller.
    this.router.get('/', this.blockchainRESTController.getStatus)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }
}

// module.exports = BchRouter
export default BlockchainRouter
