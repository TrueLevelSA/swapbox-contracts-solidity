const Web3 = require('web3')

// It's ridiculous that we need to instantiate a provider just to access the utils
const web3 = new Web3('http://localhost:8545', null, {})

module.exports = {
  zeroAddress: "0x0000000000000000000000000000000000000000",
  stringToBytes32: str => web3.utils.padLeft(web3.utils.toHex(str), 64),
  numberToBytes32: int => web3.utils.padLeft(web3.utils.toHex(int), 64),
  numberToUint: num => web3.utils.toHex(num)
}
