* [Atola](#atola)
  * [withdrawTokens](#function-withdrawtokens)
  * [machineAddressesArr](#function-machineaddressesarr)
  * [ethBalanceAmount](#function-ethbalanceamount)
  * [refund](#function-refund)
  * [amountForAddress](#function-amountforaddress)
  * [ethToFiat](#function-ethtofiat)
  * [removeToken](#function-removetoken)
  * [supportedTokens](#function-supportedtokens)
  * [removeMachine](#function-removemachine)
  * [machineAddresses](#function-machineaddresses)
  * [fiatToEth](#function-fiattoeth)
  * [getTokenCount](#function-gettokencount)
  * [baseexchange](#function-baseexchange)
  * [withdrawBaseTokens](#function-withdrawbasetokens)
  * [withdrawEth](#function-withdraweth)
  * [supportedTokensArr](#function-supportedtokensarr)
  * [addToken](#function-addtoken)
  * [tokenBalanceAmount](#function-tokenbalanceamount)
  * [modifyBtm](#function-modifybtm)
  * [addMachine](#function-addmachine)
  * [transferOwnership](#function-transferownership)
  * [OwnershipTransferred](#event-ownershiptransferred)
  * [CryptoPurchase](#event-cryptopurchase)
  * [CryptoSale](#event-cryptosale)
  * [Refund](#event-refund)
  * [EthReceived](#event-ethreceived)
* [IERC20](#ierc20)
  * [approve](#function-approve)
  * [totalSupply](#function-totalsupply)
  * [transferFrom](#function-transferfrom)
  * [balanceOf](#function-balanceof)
  * [transfer](#function-transfer)
  * [allowance](#function-allowance)
  * [Transfer](#event-transfer)
  * [Approval](#event-approval)
* [UniswapExchangeInterface](#uniswapexchangeinterface)
  * [tokenToEthSwapOutput](#function-tokentoethswapoutput)
  * [name](#function-name)
  * [approve](#function-approve)
  * [ethToTokenTransferOutput](#function-ethtotokentransferoutput)
  * [totalSupply](#function-totalsupply)
  * [transferFrom](#function-transferfrom)
  * [getTokenToEthOutputPrice](#function-gettokentoethoutputprice)
  * [decimals](#function-decimals)
  * [addLiquidity](#function-addliquidity)
  * [getEthToTokenOutputPrice](#function-getethtotokenoutputprice)
  * [setup](#function-setup)
  * [ethToTokenSwapOutput](#function-ethtotokenswapoutput)
  * [balanceOf](#function-balanceof)
  * [tokenToEthTransferInput](#function-tokentoethtransferinput)
  * [getTokenToEthInputPrice](#function-gettokentoethinputprice)
  * [symbol](#function-symbol)
  * [tokenToEthSwapInput](#function-tokentoethswapinput)
  * [factoryAddress](#function-factoryaddress)
  * [tokenToExchangeTransferOutput](#function-tokentoexchangetransferoutput)
  * [tokenAddress](#function-tokenaddress)
  * [transfer](#function-transfer)
  * [ethToTokenTransferInput](#function-ethtotokentransferinput)
  * [tokenToTokenSwapOutput](#function-tokentotokenswapoutput)
  * [tokenToExchangeSwapInput](#function-tokentoexchangeswapinput)
  * [getEthToTokenInputPrice](#function-getethtotokeninputprice)
  * [tokenToEthTransferOutput](#function-tokentoethtransferoutput)
  * [allowance](#function-allowance)
  * [tokenToTokenSwapInput](#function-tokentotokenswapinput)
  * [tokenToExchangeSwapOutput](#function-tokentoexchangeswapoutput)
  * [tokenToExchangeTransferInput](#function-tokentoexchangetransferinput)
  * [ethToTokenSwapInput](#function-ethtotokenswapinput)
  * [tokenToTokenTransferOutput](#function-tokentotokentransferoutput)
  * [tokenToTokenTransferInput](#function-tokentotokentransferinput)
  * [removeLiquidity](#function-removeliquidity)

# Atola


## *function* withdrawTokens

Atola.withdrawTokens(token, _amount) `nonpayable` `06b091f9`

> Allows the owner to withdraw tokens from the contract to the owner address

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | token | Token contract address |
| *uint256* | _amount | Amount of of tokens to withdraw (in wei) |


## *function* machineAddressesArr

Atola.machineAddressesArr() `view` `0c1ad560`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* |  | undefined |


## *function* ethBalanceAmount

Atola.ethBalanceAmount() `view` `22cc73f1`

> Allows owner to lookup eth balance of contract




## *function* refund

Atola.refund(_amount) `nonpayable` `278ecde1`

> Allows customer to claim refund if order hasn't been processed (TO-DO add a delay to this to avoid double spend race)

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | _amount | Refund amount |


## *function* amountForAddress

Atola.amountForAddress(_user) `view` `2a861533`

> Shows the amount of ETH from customer pending sale

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _user | Customer crypto address |


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


## *function* supportedTokens

Atola.supportedTokens() `view` `68c4ac26`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* |  | undefined |


## *function* removeMachine

Atola.removeMachine(_machineAddress) `nonpayable` `6b10ea6a`

> Allows the owner to remove a trusted BTM address

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _machineAddress | The address of the BTM |


## *function* machineAddresses

Atola.machineAddresses() `view` `6c7122e5`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* |  | undefined |


## *function* fiatToEth

Atola.fiatToEth(_amountFiat, _tolerance, _userAddress) `nonpayable` `6f8c459e`

> Allows the machine to submit a fiat -> eth order

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | _amountFiat | Amount of fiat machine reports to have recieved (18 decimal places) |
| *uint256* | _tolerance | undefined |
| *address* | _userAddress | Users crypto address |


## *function* getTokenCount

Atola.getTokenCount() `view` `78a89567`





## *function* baseexchange

Atola.baseexchange() `view` `7c6b8e01`





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


## *function* supportedTokensArr

Atola.supportedTokensArr() `view` `d219384a`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* |  | undefined |


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

Atola.transferOwnership(_newOwner) `nonpayable` `f2fde38b`

> Allows the current owner to transfer control of the contract to a newOwner.

Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _newOwner | The address to transfer ownership to. |



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

## *event* EthReceived

Atola.EthReceived(customerAddress, cryptoAmount) `85177f28`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | customerAddress | not indexed |
| *uint256* | cryptoAmount | not indexed |


---
# IERC20


## *function* approve

IERC20.approve(spender, value) `nonpayable` `095ea7b3`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | spender | undefined |
| *uint256* | value | undefined |


## *function* totalSupply

IERC20.totalSupply() `view` `18160ddd`





## *function* transferFrom

IERC20.transferFrom(from, to, value) `nonpayable` `23b872dd`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | from | undefined |
| *address* | to | undefined |
| *uint256* | value | undefined |


## *function* balanceOf

IERC20.balanceOf(who) `view` `70a08231`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | who | undefined |


## *function* transfer

IERC20.transfer(to, value) `nonpayable` `a9059cbb`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | to | undefined |
| *uint256* | value | undefined |


## *function* allowance

IERC20.allowance(owner, spender) `view` `dd62ed3e`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | owner | undefined |
| *address* | spender | undefined |

## *event* Transfer

IERC20.Transfer(from, to, value) `ddf252ad`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | from | indexed |
| *address* | to | indexed |
| *uint256* | value | not indexed |

## *event* Approval

IERC20.Approval(owner, spender, value) `8c5be1e5`

Arguments

| **type** | **name** | **description** |
|-|-|-|
| *address* | owner | indexed |
| *address* | spender | indexed |
| *uint256* | value | not indexed |


---
# UniswapExchangeInterface


## *function* tokenToEthSwapOutput

UniswapExchangeInterface.tokenToEthSwapOutput(eth_bought, max_tokens, deadline) `nonpayable` `013efd8b`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | eth_bought | undefined |
| *uint256* | max_tokens | undefined |
| *uint256* | deadline | undefined |


## *function* name

UniswapExchangeInterface.name() `view` `06fdde03`





## *function* approve

UniswapExchangeInterface.approve(_spender, _value) `nonpayable` `095ea7b3`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _spender | undefined |
| *uint256* | _value | undefined |


## *function* ethToTokenTransferOutput

UniswapExchangeInterface.ethToTokenTransferOutput(tokens_bought, deadline, recipient) `payable` `0b573638`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | tokens_bought | undefined |
| *uint256* | deadline | undefined |
| *address* | recipient | undefined |


## *function* totalSupply

UniswapExchangeInterface.totalSupply() `view` `18160ddd`





## *function* transferFrom

UniswapExchangeInterface.transferFrom(_from, _to, value) `nonpayable` `23b872dd`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _from | undefined |
| *address* | _to | undefined |
| *uint256* | value | undefined |


## *function* getTokenToEthOutputPrice

UniswapExchangeInterface.getTokenToEthOutputPrice(eth_bought) `view` `2640f62c`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | eth_bought | undefined |


## *function* decimals

UniswapExchangeInterface.decimals() `view` `313ce567`





## *function* addLiquidity

UniswapExchangeInterface.addLiquidity(min_liquidity, max_tokens, deadline) `payable` `422f1043`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | min_liquidity | undefined |
| *uint256* | max_tokens | undefined |
| *uint256* | deadline | undefined |


## *function* getEthToTokenOutputPrice

UniswapExchangeInterface.getEthToTokenOutputPrice(tokens_bought) `view` `59e94862`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | tokens_bought | undefined |


## *function* setup

UniswapExchangeInterface.setup(token_addr) `nonpayable` `66d38203`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | token_addr | undefined |


## *function* ethToTokenSwapOutput

UniswapExchangeInterface.ethToTokenSwapOutput(tokens_bought, deadline) `payable` `6b1d4db7`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | tokens_bought | undefined |
| *uint256* | deadline | undefined |


## *function* balanceOf

UniswapExchangeInterface.balanceOf(_owner) `view` `70a08231`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _owner | undefined |


## *function* tokenToEthTransferInput

UniswapExchangeInterface.tokenToEthTransferInput(tokens_sold, min_eth, deadline, recipient) `nonpayable` `7237e031`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | tokens_sold | undefined |
| *uint256* | min_eth | undefined |
| *uint256* | deadline | undefined |
| *address* | recipient | undefined |


## *function* getTokenToEthInputPrice

UniswapExchangeInterface.getTokenToEthInputPrice(tokens_sold) `view` `95b68fe7`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | tokens_sold | undefined |


## *function* symbol

UniswapExchangeInterface.symbol() `view` `95d89b41`





## *function* tokenToEthSwapInput

UniswapExchangeInterface.tokenToEthSwapInput(tokens_sold, min_eth, deadline) `nonpayable` `95e3c50b`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | tokens_sold | undefined |
| *uint256* | min_eth | undefined |
| *uint256* | deadline | undefined |


## *function* factoryAddress

UniswapExchangeInterface.factoryAddress() `view` `966dae0e`





## *function* tokenToExchangeTransferOutput

UniswapExchangeInterface.tokenToExchangeTransferOutput(tokens_bought, max_tokens_sold, max_eth_sold, deadline, recipient, exchange_addr) `nonpayable` `981a1327`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | tokens_bought | undefined |
| *uint256* | max_tokens_sold | undefined |
| *uint256* | max_eth_sold | undefined |
| *uint256* | deadline | undefined |
| *address* | recipient | undefined |
| *address* | exchange_addr | undefined |


## *function* tokenAddress

UniswapExchangeInterface.tokenAddress() `view` `9d76ea58`





## *function* transfer

UniswapExchangeInterface.transfer(_to, _value) `nonpayable` `a9059cbb`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _to | undefined |
| *uint256* | _value | undefined |


## *function* ethToTokenTransferInput

UniswapExchangeInterface.ethToTokenTransferInput(min_tokens, deadline, recipient) `payable` `ad65d76d`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | min_tokens | undefined |
| *uint256* | deadline | undefined |
| *address* | recipient | undefined |


## *function* tokenToTokenSwapOutput

UniswapExchangeInterface.tokenToTokenSwapOutput(tokens_bought, max_tokens_sold, max_eth_sold, deadline, token_addr) `nonpayable` `b040d545`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | tokens_bought | undefined |
| *uint256* | max_tokens_sold | undefined |
| *uint256* | max_eth_sold | undefined |
| *uint256* | deadline | undefined |
| *address* | token_addr | undefined |


## *function* tokenToExchangeSwapInput

UniswapExchangeInterface.tokenToExchangeSwapInput(tokens_sold, min_tokens_bought, min_eth_bought, deadline, exchange_addr) `nonpayable` `b1cb43bf`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | tokens_sold | undefined |
| *uint256* | min_tokens_bought | undefined |
| *uint256* | min_eth_bought | undefined |
| *uint256* | deadline | undefined |
| *address* | exchange_addr | undefined |


## *function* getEthToTokenInputPrice

UniswapExchangeInterface.getEthToTokenInputPrice(eth_sold) `view` `cd7724c3`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | eth_sold | undefined |


## *function* tokenToEthTransferOutput

UniswapExchangeInterface.tokenToEthTransferOutput(eth_bought, max_tokens, deadline, recipient) `nonpayable` `d4e4841d`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | eth_bought | undefined |
| *uint256* | max_tokens | undefined |
| *uint256* | deadline | undefined |
| *address* | recipient | undefined |


## *function* allowance

UniswapExchangeInterface.allowance(_owner, _spender) `view` `dd62ed3e`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *address* | _owner | undefined |
| *address* | _spender | undefined |


## *function* tokenToTokenSwapInput

UniswapExchangeInterface.tokenToTokenSwapInput(tokens_sold, min_tokens_bought, min_eth_bought, deadline, token_addr) `nonpayable` `ddf7e1a7`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | tokens_sold | undefined |
| *uint256* | min_tokens_bought | undefined |
| *uint256* | min_eth_bought | undefined |
| *uint256* | deadline | undefined |
| *address* | token_addr | undefined |


## *function* tokenToExchangeSwapOutput

UniswapExchangeInterface.tokenToExchangeSwapOutput(tokens_bought, max_tokens_sold, max_eth_sold, deadline, exchange_addr) `nonpayable` `ea650c7d`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | tokens_bought | undefined |
| *uint256* | max_tokens_sold | undefined |
| *uint256* | max_eth_sold | undefined |
| *uint256* | deadline | undefined |
| *address* | exchange_addr | undefined |


## *function* tokenToExchangeTransferInput

UniswapExchangeInterface.tokenToExchangeTransferInput(tokens_sold, min_tokens_bought, min_eth_bought, deadline, recipient, exchange_addr) `nonpayable` `ec384a3e`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | tokens_sold | undefined |
| *uint256* | min_tokens_bought | undefined |
| *uint256* | min_eth_bought | undefined |
| *uint256* | deadline | undefined |
| *address* | recipient | undefined |
| *address* | exchange_addr | undefined |


## *function* ethToTokenSwapInput

UniswapExchangeInterface.ethToTokenSwapInput(min_tokens, deadline) `payable` `f39b5b9b`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | min_tokens | undefined |
| *uint256* | deadline | undefined |


## *function* tokenToTokenTransferOutput

UniswapExchangeInterface.tokenToTokenTransferOutput(tokens_bought, max_tokens_sold, max_eth_sold, deadline, recipient, token_addr) `nonpayable` `f3c0efe9`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | tokens_bought | undefined |
| *uint256* | max_tokens_sold | undefined |
| *uint256* | max_eth_sold | undefined |
| *uint256* | deadline | undefined |
| *address* | recipient | undefined |
| *address* | token_addr | undefined |


## *function* tokenToTokenTransferInput

UniswapExchangeInterface.tokenToTokenTransferInput(tokens_sold, min_tokens_bought, min_eth_bought, deadline, recipient, token_addr) `nonpayable` `f552d91b`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | tokens_sold | undefined |
| *uint256* | min_tokens_bought | undefined |
| *uint256* | min_eth_bought | undefined |
| *uint256* | deadline | undefined |
| *address* | recipient | undefined |
| *address* | token_addr | undefined |


## *function* removeLiquidity

UniswapExchangeInterface.removeLiquidity(amount, min_eth, min_tokens, deadline) `nonpayable` `f88bf15a`


Inputs

| **type** | **name** | **description** |
|-|-|-|
| *uint256* | amount | undefined |
| *uint256* | min_eth | undefined |
| *uint256* | min_tokens | undefined |
| *uint256* | deadline | undefined |


---