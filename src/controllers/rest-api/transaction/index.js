/*
  REST API library for the /transaction route.
*/

// Public npm libraries.
import Router from 'koa-router'

// Local libraries.
import TransactionRESTControllerLib from './controller.js'
import Validators from '../middleware/validators.js'

class TransactionRouter {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Transaction REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Transaction REST Controller.'
      )
    }

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Encapsulate dependencies.
    this.transactionRESTController = new TransactionRESTControllerLib(dependencies)
    this.validators = new Validators(dependencies)

    // Instantiate the router and set the base route.
    const baseUrl = '/transaction'
    this.router = new Router({ prefix: baseUrl })
  }

  attach (app) {
    if (!app) {
      throw new Error(
        'Must pass app object when attaching REST API controllers.'
      )
    }

    // Define the routes and attach the controller.
    this.router.post('/', this.transactionRESTController.newTransaction)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }
}

export default TransactionRouter
