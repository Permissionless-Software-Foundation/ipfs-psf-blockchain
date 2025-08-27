/*
  Use case library for managing peers.
*/

class PeersUseCases {
  constructor (localConfig = {}) {
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Use Cases library.'
      )
    }

    // Bind 'this' object to all subfunctions.
    this.checkForNewPeers = this.checkForNewPeers.bind(this)

    // State
    this.knownPeers = []
  }

  // Filter out all peers that are not PSF-BLOCKCHAIN nodes.
  // If new ones are found, add them to the knownPeers array.
  async checkForNewPeers () {
    try {
      const peers = await this.adapters.ipfs.getPeers(true)
      // console.log('peers: ', JSON.stringify(peers, null, 2))

      for (let i = 0; i < peers.length; i++) {
        const peer = peers[i]
        // console.log('peer: ', peer)

        if (peer.peerData && peer.peerData.data) {
          const peerJsonLd = peer.peerData.data.jsonLd
          // console.log('peer: ', JSON.stringify(peer, null, 2))

          if (peerJsonLd.protocol === 'psf-blockchain') {
            // Check if we already know about this peer.
            if (!this.knownPeers.includes(peer.peer)) {
              this.knownPeers.push(peer.peer)
              console.log('New PSF-BLOCKCHAIN node found: ', peer.peer)
            }
          }
        }
      }
    } catch (err) {
      console.error('Error in peers-use-cases.js/checkForNewPeers(): ', err)
    }
  }
}

export default PeersUseCases
