/*
  This is the JSON RPC router for the transaction API
*/

// Public npm libraries
import jsonrpc from 'jsonrpc-lite'

// Local libraries
import config from '../../../../config/index.js'

class TransactionRPC {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating Transaction JSON RPC Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating Transaction JSON RPC Controller.'
      )
    }

    // Encapsulate dependencies
    this.jsonrpc = jsonrpc

    // Bind 'this' object to all subfunctions.
    this.transactionRouter = this.transactionRouter.bind(this)
    this.createTransaction = this.createTransaction.bind(this)
    this.syndicateTxToPeers = this.syndicateTxToPeers.bind(this)
  }

  async transactionRouter (rpcData) {
    console.log('debugging: transactionRouter from ipfs-service-provider triggered')

    try {
      const endpoint = rpcData.payload.params.endpoint

      switch (endpoint) {
        case 'syndicateTxToPeers':
          return await this.syndicateTxToPeers(rpcData)
      }
    } catch (err) {
      console.error('Error in TransactionRPC/transactionRouter()')
      // throw err

      return {
        success: false,
        status: err.status || 500,
        message: err.message,
        endpoint: 'transaction'
      }
    }

    return {
      success: true,
      status: 200,
      // message: aboutStr,
      message: JSON.stringify(config.announceJsonLd),
      endpoint: 'about'
    }
  }

  /**
   * @api {JSON} /transaction Create a new transaction
   * @apiPermission public
   * @apiName CreateTransaction
   * @apiGroup JSON Transaction
   *
   * @apiExample Example usage:
   * {"jsonrpc":"2.0","id":"555","method":"transaction","params":{ "endpoint": "createTransaction", "transaction": { "type": "transfer", "amount": 100, "from": "Qmc2uJhg7yrqaNaoTJRDkzrAyVe82e9JMFQcxrBUjbdXyC", "to": "Qmc2uJhg7yrqaNaoTJRDkzrAyVe82e9JMFQcxrBUjbdXyC" }}}
   *
   * @apiDescription
   * This endpoint is used to broadcast a new transactions to other nodes/peers on the network.
   */
  async syndicateTxToPeers (rpcData) {
    try {
      const txObj = rpcData.payload.params.transaction
      await this.useCases.peers.syndicateTxToPeers(txObj)
    } catch (err) {
      console.error('Error in TransactionRPC/syndicateTxToPeers()')
      // throw err

      return {
        success: false,
        status: err.status || 500,
        message: err.message,
        endpoint: 'transaction'
      }
    }
  }
}

export default TransactionRPC
