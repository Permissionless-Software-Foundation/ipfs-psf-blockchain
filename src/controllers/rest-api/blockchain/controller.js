/*
  REST API Controller library for the /usage route
*/

// Global npm libraries

// Local libraries
import wlogger from '../../../adapters/wlogger.js'

class BlockchainRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /blockchain REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /blockchain REST Controller.'
      )
    }

    // Encapsulate dependencies

    // Bind 'this' object to all subfunctions
    this.getStatus = this.getStatus.bind(this)
    this.handleError = this.handleError.bind(this)
  }

  /**
   * @api {get} /blockchain Get status on blockchain infrastructure
   * @apiPermission public
   * @apiName GetBlockchainStatus
   * @apiGroup REST Blockchain
   *
   * @apiExample Example usage:
   * curl -H "Content-Type: application/json" -X GET localhost:5020/blockchain
   *
   */
  getStatus (ctx) {
    try {
      const chain = this.adapters.blockchain.chain

      ctx.body = { chain }
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
export default BlockchainRESTControllerLib
