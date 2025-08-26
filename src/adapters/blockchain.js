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
    this.hashBlock = this.hashBlock.bind(this)
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
    const { amount, sender, recipient } = inObj

    const newTransaction = {
      amount,
      sender,
      recipient
    }

    this.mempool.push(newTransaction)

    // Get the block height of the future block where this transaction should be included.
    return this.getLastBlock().height + 1
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
}

export default BlockchainAdapter
