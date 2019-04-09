
const swap = Atola.deployed()

swap.owner

web3.eth.getBalance(swap.address)

// get owner address
web3.eth.getStorageAt(swap.address, 0);

// get current account
web3.eth.getAccounts((err, res) => { console.log(res[0]) })
