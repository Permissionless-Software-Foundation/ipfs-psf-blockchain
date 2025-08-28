/*
  This is the unit test for the blockchain adapter.
*/

// Global libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local libraries
import BlockchainAdapter from '../../../src/adapters/blockchain.js'

describe('BlockchainAdapter', () => {
  let uut
  let sandbox

  beforeEach(() => {
    uut = new BlockchainAdapter()
    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should create a new instance of the Blockchain', () => {
      assert.property(uut, 'chain')
      assert.property(uut, 'mempool')

      assert.isArray(uut.chain)
      assert.isArray(uut.mempool)
    })
  })

  describe('#createNewBlock', () => {
    it('should create a new block', () => {
      // Add one transaction to the mempool.
      // uut.mempool.push('test')
      uut.createNewTransaction({
        amount: 1,
        sender: 'test',
        recipient: 'test',
        message: 'test'
      })

      const previousBlockHash = uut.getLastBlockHash()
      const hash = uut.hashBlock({
        previousBlockHash,
        currentBlockData: uut.mempool,
        nonce: 100
      })

      const result = uut.createNewBlock({
        nonce: 100,
        previousBlockHash,
        hash
      })
      // console.log('result: ', result)

      // Check that the new block was created with expected properties.
      assert.property(result, 'height')
      assert.property(result, 'timestamp')
      assert.property(result, 'transactions')
      assert.property(result, 'nonce')
      assert.property(result, 'hash')
      assert.property(result, 'previousBlockHash')

      // Check that the new transactions array is empty.
      assert.isEmpty(uut.mempool)

      // Check that the new block was added to the chain.
      assert.equal(uut.chain.length, 2)

      // Assert the block has expected values.
      assert.equal(result.height, 2)
      assert.equal(result.nonce, 100)
      assert.equal(result.previousBlockHash, '0')
    })
  })

  describe('#getLastBlock', () => {
    it('should return the last block in the chain', () => {
      // Create one block with one transaction.
      uut.mempool.push('test')
      uut.createNewBlock({
        nonce: 1,
        previousBlockHash: 'fffaaa',
        hash: 'fffaaa'
      })

      const result = uut.getLastBlock()
      // console.log('getLastBlock() result: ', result)

      assert.deepEqual(result, uut.chain[uut.chain.length - 1])
    })
  })

  describe('#getLastBlockHash', () => {
    it('should return the hash of the last block in the chain', () => {
      // Create one block with one transaction.
      uut.mempool.push('test')
      uut.createNewBlock({
        nonce: 1,
        previousBlockHash: 'fffaaa',
        hash: 'fffaaa'
      })

      const result = uut.getLastBlockHash()
      // console.log('getLastBlockHash() result: ', result)

      assert.equal(result, uut.chain[uut.chain.length - 1].hash)
    })
  })

  describe('#createNewTransaction', () => {
    it('should add a new transaction to the mempool', () => {
      // Create one block with one transaction.
      uut.mempool.push('test')
      uut.createNewBlock({
        nonce: 1,
        previousBlockHash: 'fffaaa',
        hash: 'fffaaa'
      })

      // Add a new transaction to the mempool.
      const result = uut.createNewTransaction({
        amount: 1,
        sender: 'test',
        recipient: 'test'
      })
      console.log('createNewTransaction() result: ', result)
      // console.log('uut.mempool: ', uut.mempool)

      // TODO: Re-write the assertions.

      // The function should return the block height where the transaction will be added.
      // assert.equal(result, 3)

      // newTransaction array should have a single transaction.
      // assert.equal(uut.mempool.length, 0)

      // // The transaction should have the expected properties.
      // assert.property(uut.mempool[0], 'amount')
      // assert.property(uut.mempool[0], 'sender')
      // assert.property(uut.mempool[0], 'recipient')

      // // The transaction should have the expected values.
      // assert.equal(uut.mempool[0].amount, 1)
      // assert.equal(uut.mempool[0].sender, 'test')
    })
  })

  describe('#hashBlock', () => {
    it('should hash the block', () => {
      const result = uut.hashBlock({
        previousBlockHash: 'fffaaa',
        currentBlockData: 'test',
        nonce: 1
      })
      // console.log('hashBlock() result: ', result)

      // The result should be a string.
      assert.isString(result)

      // The result should be 64 characters long.
      assert.equal(result.length, 64)

      // The result should be deterministic.
      assert.equal(result, '23f3474053053e37ce9617359550419c326d35cbf890fba70adad658ec292cbd')
    })
  })

  describe('#proofOfWork', () => {
    it('should return the nonce that satisfies the proof of work', () => {
      // Create genesis block with one transaction.
      uut.mempool.push('test')
      uut.createNewBlock({
        nonce: 1,
        previousBlockHash: 'fffaaa',
        hash: 'fffaaa'
      })

      // Create a new transaction.
      uut.createNewTransaction({
        amount: 1,
        sender: 'test',
        recipient: 'test'
      })

      // Create a new block.
      const newBlock = uut.createNewBlock({
        nonce: 1,
        previousBlockHash: 'fffaaa',
        hash: 'fffaaa'
      })

      // Create a new block with the new transaction.
      const result = uut.proofOfWork({
        previousBlockHash: newBlock.hash,
        currentBlockData: newBlock.transactions
      })

      assert.isNumber(result)
    })
  })
})
