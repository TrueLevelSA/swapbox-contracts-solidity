pragma solidity 0.5.0;

/// import "./ConvertLib.sol";
import "./math.sol";

contract Atola is DSMath {
		address payable internal owner;
		mapping(address => bool) private BtmAddresses;
		event OwnershipTransferred(address previousOwner, address payable newOwner);

		// TO-DO check which fields we need in the event log and whether we can have addresses as indexed
		event CryptoBought(address customerAddress, uint fiatAmount, uint exchangeRate);
		event CryptoSold(address customerAddress, uint cryptoAmount, uint exchangeRate);

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
	    constructor() public {
	        owner = msg.sender;
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

	    function enoughMoney (uint _amount) internal returns(bool){
					require(address(this).balance > _amount);
	        return true;
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
    function FiatToCrypto(uint _amountFiat, uint _exchangeRate, address payable _userAddress) external onlyBtm returns(bool){
				// this assumes _exchangeRate is passed in as wad already
				uint netAmountWad = wmul(_amountFiat * 10 ** 18, _exchangeRate);
				uint netAmount = netAmountWad / (10 ** 18);
				// ?? add require for enoughMoney ??
				require(enoughMoney(netAmount));
        _userAddress.transfer(netAmount);
				emit CryptoBought(_userAddress, _amountFiat, _exchangeRate);
    }

    function withdraw(uint _amount) external onlyOwner {
				// ?? add require for enoughMoney ??
				require(enoughMoney(_amount));
        owner.transfer(_amount);
    }

    function BalanceAmount() external view onlyOwner returns(uint){
        return(address(this).balance);
    }

    function refund(address payable _user, uint _amount) public{
        require(msg.sender == _user);
        require(UserToAmountCrypto[_user] > _amount);
        UserToAmountCrypto[_user] -= _amount;
        _user.transfer(UserToAmountCrypto[_user]);
    }

    function CryptoToFiat(address _user, uint _amountCrypto) public onlyBtm {
        require(UserToAmountCrypto[_user] > _amountCrypto);
        UserToAmountCrypto[_user] -= _amountCrypto;
    }

    function AmountForAddress(address _user) public view onlyBtm returns(uint) {
        return(UserToAmountCrypto[_user]);
    }

    function () external payable {
        UserToAmountCrypto[msg.sender] += msg.value;
    }


}
