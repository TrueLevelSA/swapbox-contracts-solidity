* [Atola](#atola)
  * [withdrawTokens](#function-withdrawtokens)
  * [ethBalanceAmount](#function-ethbalanceamount)
  * [amountForAddress](#function-amountforaddress)
  * [refund](#function-refund)
  * [ethToFiat](#function-ethtofiat)
  * [removeToken](#function-removetoken)
  * [removeMachine](#function-removemachine)
  * [fiatToEth](#function-fiattoeth)
  * [fiatToBaseTokens](#function-fiattobasetokens)
  * [withdrawBaseTokens](#function-withdrawbasetokens)
  * [withdrawEth](#function-withdraweth)
  * [addToken](#function-addtoken)
  * [tokenBalanceAmount](#function-tokenbalanceamount)
  * [modifyBtm](#function-modifybtm)
  * [addMachine](#function-addmachine)
  * [transferOwnership](#function-transferownership)
  * [OwnershipTransferred](#event-ownershiptransferred)
  * [CryptoPurchase](#event-cryptopurchase)
  * [CryptoSale](#event-cryptosale)
  * [Refund](#event-refund)
  * [EthRecieved](#event-ethrecieved)

# Atola


## *function* withdrawTokens

Atola.withdrawTokens(token, _amount) `nonpayable` `06b091f9`

> Allows the owner to withdraw tokens from the contract to the owner address

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | token | Token contract address |
| *uint256* | _amount | Amount of of tokens to withdraw (in wei) |


## *function* ethBalanceAmount

Atola.ethBalanceAmount() `view` `22cc73f1`

> Allows owner to lookup eth balance of contract




## *function* amountForAddress

Atola.amountForAddress(_user) `view` `2a861533`

> Shows the amount of ETH from customer pending sale

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _user | Customer crypto address |


## *function* refund

Atola.refund(_user, _amount) `nonpayable` `410085df`

> Allows customer to claim refund if order hasn't been processed (TO-DO add a delay to this to avoid double spend race)

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _user | Customer address |
| *uint256* | _amount | Refund amount |


## *function* ethToFiat

Atola.ethToFiat(_user, _amountFiat) `nonpayable` `4a6a038d`

> Allows customer to sell eth (needs to have already sent eth to the contract).  Called by the machine.

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _user | Customer address |
| *uint256* | _amountFiat | Amount to process |


## *function* removeToken

Atola.removeToken(_tokenAddress) `nonpayable` `5fa7b584`

> Allows the owner to remove a supported token

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _tokenAddress | The address of the token contract |


## *function* removeMachine

Atola.removeMachine(_machineAddress) `nonpayable` `6b10ea6a`

> Allows the owner to remove a trusted BTM address

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _machineAddress | The address of the BTM |


## *function* fiatToEth

Atola.fiatToEth(_amountFiat, _tolerance, _userAddress) `nonpayable` `6f8c459e`

> Allows the machine to submit a fiat -> eth order

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | _amountFiat | Amount of fiat machine reports to have recieved (18 decimal places) |
| *uint256* | _tolerance | undefined |
| *address* | _userAddress | Users crypto address |


## *function* fiatToBaseTokens

Atola.fiatToBaseTokens(_amountFiat, _userAddress) `nonpayable` `8f611eeb`

> Allows the machine to submit a fiat -> basetoken order

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | _amountFiat | Amount of fiat machine reports to have recieved (18 decimal places) |
| *address* | _userAddress | Users crypto address |


## *function* withdrawBaseTokens

Atola.withdrawBaseTokens(_amount) `nonpayable` `bc360f49`

> Allows the owner to withdraw tokens from the contract to the owner address

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | _amount | Amount of of tokens to withdraw (in wei) |


## *function* withdrawEth

Atola.withdrawEth(_amount) `nonpayable` `c311d049`

> Allows the owner to withdraw eth from the contract to the owner address

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | _amount | Amount of of eth to withdraw (in wei) |


## *function* addToken

Atola.addToken(_token) `nonpayable` `d48bfca7`

> Allows the owner to add a trusted token address

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _token | The address of the token contract (warning: make sure it's compliant) |


## *function* tokenBalanceAmount

Atola.tokenBalanceAmount() `view` `e3ae37b0`

> Allows owner to lookup token balance of contract




## *function* modifyBtm

Atola.modifyBtm(_machineAddress, _buyFee, _sellFee) `nonpayable` `ebc8f190`

> Allows the owner to add/remove a trusted BTM address

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _machineAddress | The address of the BTM |
| *uint256* | _buyFee | Default buy fee on this machine |
| *uint256* | _sellFee | Default sell fee on this machine |


## *function* addMachine

Atola.addMachine(_machineAddress) `nonpayable` `ef56731f`

> Allows the owner to add a trusted BTM address

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _machineAddress | The address of the BTM |


## *function* transferOwnership

Atola.transferOwnership(newOwner) `nonpayable` `f2fde38b`

> Allows the current owner to transfer control of the contract to a newOwner.

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | newOwner | The address to transfer ownership to. |



## *event* OwnershipTransferred

Atola.OwnershipTransferred(previousOwner, newOwner) `8be0079c`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | previousOwner | not indexed |
| *address* | newOwner | not indexed |

## *event* CryptoPurchase

Atola.CryptoPurchase(customerAddress, fiatAmount, cryptoAmount) `3b42f591`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | customerAddress | not indexed |
| *uint256* | fiatAmount | not indexed |
| *uint256* | cryptoAmount | not indexed |

## *event* CryptoSale

Atola.CryptoSale(customerAddress, cryptoAmount, fiatAmount) `ac6fef5f`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | customerAddress | not indexed |
| *uint256* | cryptoAmount | not indexed |
| *uint256* | fiatAmount | not indexed |

## *event* Refund

Atola.Refund(customerAddress, cryptoAmount) `bb28353e`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | customerAddress | not indexed |
| *uint256* | cryptoAmount | not indexed |

## *event* EthRecieved

Atola.EthRecieved(customerAddress, cryptoAmount) `14173446`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | customerAddress | not indexed |
| *uint256* | cryptoAmount | not indexed |


---
