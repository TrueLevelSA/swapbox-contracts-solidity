README
======

Prerequisites
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
- Figure out how & where to set min exchange rate settings



Issues
------

- Fucking ERC20.  approve etc.  for now to keep thing simple we should
allow only selling of ether (otherwise users would need to call approve
prior to using the machine; maybe have a solution for this).   Hopefully 777 (and its adoption sorts
this out).
- Do we just accept ETH at the main contract address or do we setup a
proxy reciever contract (maybe more than one, but ideally not one per
cusomter, maybe a pool of reciever contracts so the system can process
more than 1 sell at a time)
