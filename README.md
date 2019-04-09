README
======

Prerequisites
-------------
Make sure to have a local node (geth), vyper (v0.1.0-beta.4, breaking changes afterwards) and truffle installed

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
- Factory and FactoryRegistry to manage contract versioning and allow for some ui niceness for swap-box-admin
- Nice admin interface for setup & configuration of machine in swap-box
- Dynamic fee structure to try to stabilize cash balances between machines
- Remittance feature (using backend such as coins.ph).  Will need to think about how to deal with kyc etc and varying user interfaces depending on remittance option chosen.

Issues
------

- Fucking ERC20.  approve etc.  for now to keep thing simple we should
allow only selling of ether (otherwise users would need to call approve
prior to using the machine; maybe have a solution for this).   Hopefully 777 (and its adoption sorts
this out).
