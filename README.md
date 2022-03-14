[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

README
======

Install
------------
```bash
yarn
```

Build
-----
```bash
yarn build
```

Prerequisites (deploy/tests)
-------------
Make sure to have a local node (geth), vyper (v0.1.0-beta.4, breaking changes afterwards) and truffle installed

Run geth with the following:
```bash
geth --dev --ws --wsport=8546 --wsorigins="*" --wsapi personal,eth,net,rpc,shh,web3 --allow-insecure-unlock
```

And the run this from the root of this repo:
```bash
geth --exec "loadScript('scripts/unlock.js')" attach ipc://tmp/geth.ipc
```
It will unlock 9 more accounts (so 10 in total) and prefund them with 1000 ETH each.

Documentation
-------------

Documentation for the [`Swapbox.sol`][swapbox-contract] smart contract is 
available at [doc/SwapBox.md][swapbox-doc].
Compiling & Deployment
----------------------
```sh
  yarn compile
  yarn migrate
  yarn console
```

TO-DO
-----
- Implement Uniswap for DAI/xCHF based system (swap dai to ETH for customer)
- Implement Uniswap for tokens
- Figure out how & where to set min exchange rate settings (do we really let the user set this ... frontrunners fucking things up for us :/)

### Second phase (need money‽)
- Factory and FactoryRegistry to manage contract versioning and allow for some ui niceness for swapbox-admin
- Nice admin interface for setup & configuration of machine in swapbox
- Dynamic fee structure to try to stabilize cash balances between machines
- Remittance feature (using backend such as coins.ph).  Will need to think about how to deal with kyc etc and varying user interfaces depending on remittance option chosen.

Issues
------

- Fucking ERC20.  approve etc.  for now to keep thing simple we should
allow only selling of ether (otherwise users would need to call approve
prior to using the machine; maybe have a solution for this).   Hopefully 777 (and its adoption sorts
this out).

[swapbox-contract]: ./contracts/Swapbox.sol
[swapbox-doc]: ./doc/SwapBox.md
