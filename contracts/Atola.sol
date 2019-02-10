pragma solidity 0.5.0;

/// import "./ConvertLib.sol";
import "./math.sol";
import "./IERC20.sol";
import "./UniswapExchangeInterface.sol";


contract Atola is DSMath {
		address payable internal owner;
		address internal basecurrency; // 0xb4272071ecadd69d933adcd19ca99fe80664fc08 for xCHF
		address internal baseexchange; // 0x8de0d002dc83478f479dc31f76cb0a8aa7ccea17 for xCHF
		mapping(address => bool) private BtmAddresses;
		event OwnershipTransferred(address previousOwner, address payable newOwner);

		// TO-DO check which fields we need in the event log and whether we can have addresses as indexed
		event CryptoBought(address customerAddress, uint fiatAmount);
		event CryptoSold(address customerAddress, uint cryptoAmount);
		event CancelledRefund(address customerAddress, uint cryptoAmount);

    /// uint dailyOutLimit = 5.1234567891012131 ether; /* Ether */
    /* To buy, user put money in, and machine send fiat amount. We transfer the fiat using the oracle price */
    /* To sell, user send to smart contract, smart contract makes a list of money input to address, and the ATM can ask for removing money owed to this address, to output cash.
    User have a redeem code that machine links to the public address.
    User can get direct refund by calling a function in smart contract.(to see) */

    mapping(address => uint) UserToAmountCrypto;

		/**
	   * @dev The Atola constructor sets the original `owner` of the contract to the sender
	   * account.
	   */
	    constructor(address _baseCurrency, address _baseExchange) public {
	        owner = msg.sender;
					basecurrency = _baseCurrency;
					baseexchange = _baseExchange;
	    }

	  /**
	   * @dev Throws if called by any account other than the owner.
	   */
	    modifier onlyOwner() {
	        require(msg.sender == owner);
	        _;
	    }

	  /**
	   * @dev Throws if called by any account other than thoses in the BtmAddresses list
	   */
	    modifier onlyBtm() {
	        require(BtmAddresses[msg.sender]);
	        _;
	    }

	  /**
	   * @dev Allows the current owner to transfer control of the contract to a newOwner.
	   * @param newOwner The address to transfer ownership to.
	   */
	    function transferOwnership(address payable newOwner) public onlyOwner {
	        require(newOwner != address(0));
	        emit OwnershipTransferred(owner, newOwner);
	        owner = newOwner;
	    }

	  /**
	   * @dev Allows the owner to add/remove a trusted BTM address
	   * @param _newBtmAddress The address of the new BTM
	   */
	    function modifyBtm(address _newBtmAddress, bool state) public onlyOwner {
	        BtmAddresses[_newBtmAddress] = state;
	    }

			// TO-DO:  Use price oracle with signature
    function FiatToEth(uint _amountFiat, address payable _userAddress) external onlyBtm returns(bool){
				// this assumes _exchangeRate is passed in as wad already
				// uint netAmountWad = wmul(_amountFiat * 10 ** 18, _exchangeRate);
				// uint netAmount = netAmountWad / (10 ** 18);

				//call approve
				IERC20 tok = IERC20(basecurrency);
				tok.approve(address(this), _amountFiat);

				//call uniswap
				UniswapExchangeInterface ex = UniswapExchangeInterface(baseexchange);

				/* # @param tokens_sold Amount of Tokens sold.
				# @param min_eth Minimum ETH purchased.
				# @param deadline Time after which this transaction can no longer be executed.
				# @param recipient The address that receives output ETH.
				# @return Amount of ETH bought. */
				ex.tokenToEthTransferInput(_amountFiat, _amountFiat, block.timestamp, _userAddress);

				emit CryptoBought(_userAddress, _amountFiat);
    }

		function FiatToTokens(uint _amountFiat, address payable _userAddress) external onlyBtm returns(bool){
				//call approve
				IERC20 tok = IERC20(basecurrency);
				tok.approve(address(this), _amountFiat);
				//call uniswap
				UniswapExchangeInterface ex = UniswapExchangeInterface(baseexchange);

				//ex.tokenToTokenTransferInput(tokens_sold: uint256, min_tokens_bought: uint256, min_eth_bought: uint256(wei), deadline: timestamp, recipient: address, token_addr: address)

				emit CryptoBought(_userAddress, _amountFiat);
		}

		// Owner Functions

		function withdrawEth(uint _amount) external onlyOwner {
			  IERC20 tok = IERC20(basecurrency);
	      tok.transfer(owner, _amount);
    }

		function withdrawTokens(uint _amount) external onlyOwner {
			  IERC20 tok = IERC20(basecurrency);
	      tok.transfer(owner, _amount);
    }

		function TokenBalanceAmount() external view onlyOwner returns(uint){
				IERC20 tok = IERC20(basecurrency);
				return tok.balanceOf(owner);
    }
    function EthBalanceAmount() external view onlyOwner returns(uint){
        return(address(this).balance);
    }

		// Selling crypto stuff.

		// TO-DO:
		/* - ?Use pool of reciever contracts so different customers send to different address? (you know for the idiots who dont read the screen and send from an exchange).
			Ideally this is out of scope and we can require that people use an address they control
		- Handle ERC20.  Lazy way is for customer to approve while the machine polls then calls some function with a transferfrom.
			Ideally, esp if using reciever contracts we could handle transfer of erc20 (easier for user), while the machine waits for transfer event.  Some user safety can be included in the reciever contract (for them to claim their tokens back)
		- Ensure a way for owner to withdraw even non compliant tokens so they dont get stuck */

    function refund(address payable _user, uint _amount) public{
        require(msg.sender == _user);
        require(UserToAmountCrypto[_user] > _amount);
        UserToAmountCrypto[_user] -= _amount;
        _user.transfer(UserToAmountCrypto[_user]);
				emit CancelledRefund(_user, _amount);
    }

    function CryptoToFiat(address _user, uint _amountCrypto) public onlyBtm {
        require(UserToAmountCrypto[_user] > _amountCrypto);
        UserToAmountCrypto[_user] -= _amountCrypto;
				emit CryptoSold(_user, _amountCrypto);
    }

    function AmountForAddress(address _user) public view onlyBtm returns(uint) {
        return(UserToAmountCrypto[_user]);
    }

    function () external payable {
        UserToAmountCrypto[msg.sender] += msg.value;
    }


}
