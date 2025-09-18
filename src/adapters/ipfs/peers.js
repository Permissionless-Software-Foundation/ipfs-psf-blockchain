/*
  Adapter library for interacting with blockchain peers over JSON RPC.
*/

// import { v4 as uid } from 'uuid'
// import jsonrpc from 'jsonrpc-lite'

class PeersAdapter {
  constructor (localConfig = {}) {
    this.ipfs = localConfig.ipfs
    if (!this.ipfs) {
      throw new Error(
        'An instance of IPFS must be passed when instantiating the IPFS Peers Adapter library.'
      )
    }

    // Bind 'this' object to all subfunctions.
    this.sendTxToPeer = this.sendTxToPeer.bind(this)
    this.waitForRPCResponse = this.waitForRPCResponse.bind(this)
  }

  // Send a message to a peer.
  async sendTxToPeer (peer, txObj) {
    try {
      // TODO: Input validation on peer ID

      const rpcData = {
        endpoint: 'newTransaction',
        tx: txObj
      }

      // Generate a UUID for the call.
      const rpcId = this.uid()

      // Generate a JSON RPC command.
      const cmd = this.jsonrpc.request(rpcId, 'peers', rpcData)
      const cmdStr = JSON.stringify(cmd)
      console.log('cmdStr: ', cmdStr)

      // Send the RPC command to selected wallet service.
      const thisNode = this.ipfs.ipfsCoordAdapter.ipfsCoord.thisNode
      await this.ipfs.ipfsCoordAdapter.ipfsCoord.useCases.peer.sendPrivateMessage(
        peer,
        cmdStr,
        thisNode
      )

      // Wait for data to come back from the wallet service.
      const data = await this.waitForRPCResponse(rpcId)
      console.log('data: ', data)

      return data
    } catch (err) {
      console.error('Error in peers.js/sendTxToPeer(): ', err)
      throw err
    }
  }

  // Returns a promise that resolves to data when the RPC response is recieved.
  async waitForRPCResponse (rpcId) {
    try {
      // Initialize variables for tracking the return data.
      let dataFound = false
      let cnt = 0

      // Default return value, if the remote computer does not respond in time.
      let data = {
        success: false,
        message: 'request timed out',
        data: ''
      }

      // Loop that waits for a response from the service provider.
      do {
        // console.log(`this.rpcDataQueue.length: ${this.rpcDataQueue.length}`)
        for (let i = 0; i < this.rpcDataQueue.length; i++) {
          const rawData = this.rpcDataQueue[i]
          // console.log(`rawData: ${JSON.stringify(rawData, null, 2)}`)

          if (rawData.payload.id === rpcId) {
            dataFound = true
            // console.log('data was found in the queue')

            data = rawData.payload.result.value

            // Remove the data from the queue
            this.rpcDataQueue.splice(i, 1)

            break
          }
        }

        // Wait between loops.
        // await this.sleep(1000)
        await this.ipfs.ipfsCoordAdapter.wallet.bchjs.Util.sleep(2000)

        cnt++

        // Exit if data was returned, or the window for a response expires.
      } while (!dataFound && cnt < 10)
      // console.log(`dataFound: ${dataFound}, cnt: ${cnt}`)

      return data
    } catch (err) {
      console.error('Error in waitForRPCResponse()')
      throw err
    }
  }
}

export default PeersAdapter
