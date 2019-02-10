README
======

Prerequisites
-------------

Install truffle
```
npm install -g truffle
```

Compiling & Deployment
----------------------

```
truffle compile
truffle migrate
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
