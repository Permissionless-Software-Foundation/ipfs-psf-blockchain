/*
  This is the adapter for the blockchain.

*/

// Global libaries
import sha256 from 'sha256'

class BlockchainAdapter {
  constructor () {
    // Holds the chain of blocks.
    this.chain = []

    // Holds the new transactions that are being mined
    this.mempool = []

    // Bind 'this' object to all methods
    this.createNewBlock = this.createNewBlock.bind(this)
    this.getLastBlock = this.getLastBlock.bind(this)
    this.getLastBlockHash = this.getLastBlockHash.bind(this)
    this.createNewTransaction = this.createNewTransaction.bind(this)
    this.addTransactionToMempool = this.addTransactionToMempool.bind(this)
    this.hashBlock = this.hashBlock.bind(this)
    this.createGenesisBlock = this.createGenesisBlock.bind(this)

    // Create the genesis block.
    this.createGenesisBlock()
  }

  createNewBlock (inObj = {}) {
    const { nonce, previousBlockHash, hash } = inObj

    // Assemble a new block
    const newBlock = {
      height: this.chain.length + 1,
      timestamp: new Date().toISOString(),
      transactions: this.mempool,
      nonce,
      hash, // Hash of the newTransactions array.
      previousBlockHash
    }

    // Clear the new transactions array
    this.mempool = []

    // Add the new block to the chain
    this.chain.push(newBlock)

    // Return the new block
    return newBlock
  }

  getLastBlock () {
    return this.chain[this.chain.length - 1]
  }

  getLastBlockHash () {
    return this.getLastBlock().hash
  }

  // Create a new transaction and add it to the mempool.
  // Return the expected block height of the blockwhere the transaction will
  // be included.
  createNewTransaction (inObj = {}) {
    const { amount, sender, recipient, message } = inObj

    const newTransaction = {
      amount,
      sender,
      recipient,
      message
    }

    // Calculate a transaction ID by create a sha256 hash of the transaction
    // object. Add it to the transaction object.
    const txAsString = JSON.stringify(newTransaction)
    const txHash = sha256(txAsString)
    newTransaction.transactionId = txHash

    return newTransaction
  }

  addTransactionToMempool (transactionObj = {}) {
    // Check if the transaction is already in the mempool.
    if (this.mempool.find(tx => tx.transactionId === transactionObj.transactionId)) {
      return false
    }

    this.mempool.push(transactionObj)
  }

  hashBlock (inObj = {}) {
    const { previousBlockHash, currentBlockData, nonce } = inObj

    // Convert all the data into a single string.
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData)

    // Hash the block data
    const hash = sha256(dataAsString)

    // Return the hash
    return hash
  }

  proofOfWork (inObj = {}) {
    const { previousBlockHash, currentBlockData } = inObj
    let nonce = 0
    let hash = this.hashBlock({ previousBlockHash, currentBlockData, nonce })
    while (hash.substring(0, 4) !== '0000') {
      nonce++
      hash = this.hashBlock({ previousBlockHash, currentBlockData, nonce })
    }
    return nonce
  }

  // Create the first block in the blockchain.
  createGenesisBlock () {
    // Create a single transaction in the mempool.
    const firstTx = {
      amount: 0,
      sender: 'genesis',
      recipient: 'genesis',
      message: 'This is the PSF blockchain. It is a simple time-stamp blockchain where transaction can contain a small text message.'
    }
    this.mempool.push(firstTx)

    return this.createNewBlock({
      nonce: 100,
      previousBlockHash: '0',
      hash: '0'
    })
  }
}

export default BlockchainAdapter
