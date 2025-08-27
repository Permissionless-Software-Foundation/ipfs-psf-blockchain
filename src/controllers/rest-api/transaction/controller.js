/*
  REST API Controller library for the /transaction route
*/

// Global npm libraries

// Local libraries
import wlogger from '../../../adapters/wlogger.js'

class TransactionRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /transaction REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /transaction REST Controller.'
      )
    }

    // Encapsulate dependencies

    // Bind 'this' object to all subfunctions
    this.newTransaction = this.newTransaction.bind(this)
    this.handleError = this.handleError.bind(this)
  }

  /**
   * @api {get} /transaction Get status on transaction infrastructure
   * @apiPermission public
   * @apiName GetTransactionStatus
   * @apiGroup REST Transaction
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X POST -d '{"amount": 100, "sender": "alice", "recipient": "bob", "message": "test transaction"}' localhost:5020/transaction
   *
   */
  newTransaction (ctx) {
    try {
      const { amount, sender, recipient, message } = ctx.request.body

      const blockHeight = this.adapters.blockchain.createNewTransaction({ amount, sender, recipient, message })

      ctx.body = { blockHeight }
    } catch (err) {
      wlogger.error('Error in blockchain/controller.js/getStatus(): ')
      // ctx.throw(422, err.message)
      this.handleError(ctx, err)
    }
  }

  // DRY error handler
  handleError (ctx, err) {
    // If an HTTP status is specified by the buisiness logic, use that.
    if (err.status) {
      if (err.message) {
        ctx.throw(err.status, err.message)
      } else {
        ctx.throw(err.status)
      }
    } else {
      // By default use a 422 error if the HTTP status is not specified.
      ctx.throw(422, err.message)
    }
  }
}

// module.exports = IpfsRESTControllerLib
export default TransactionRESTControllerLib
