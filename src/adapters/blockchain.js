/*
  This is the adapter for the blockchain.

*/

class BlockchainAdapter {
  constructor () {
    this.chain = []
    this.newTransactions = []

    // Bind 'this' object to all methods
    this.createNewBlock = this.createNewBlock.bind(this)
  }

  createNewBlock (inObj = {}) {
    const { nonce, previousBlockHash, hash } = inObj

    const newBlock = {
      index: this.chain.length + 1,
      timestamp: new Date().toISOString(),
      transactions: this.newTransactions,
      nonce,
      hash, // Hash of the newTransactions array.
      previousBlockHash
    }

    this.newTransactions = []

    return newBlock
  }
}

export default BlockchainAdapter
