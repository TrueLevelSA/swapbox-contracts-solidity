// FIXME Fix the Solidity version
pragma solidity ^0.5.0;

import "./IERC20.sol";
import "./UniswapExchangeInterface.sol";


contract Atola {
    address payable internal owner;
    IERC20 internal basetoken; // 0xb4272071ecadd69d933adcd19ca99fe80664fc08 for xCHF
    address internal baseexchange; // 0x8de0d002dc83478f479dc31f76cb0a8aa7ccea17 for xCHF
    address[] public supportedTokens;

    mapping(address => bool) internal BtmAddresses;
    mapping(address => uint256) internal buyFee; //(eg 1.2 percent -> 120)
    mapping(address => uint256) internal sellFee; //(eg 1.2 percent -> 120)

    event OwnershipTransferred(address previousOwner, address payable newOwner);

    // TO-DO check which fields we need in the event log and whether we can have addresses as indexed
    event CryptoPurchase(address customerAddress, uint256 fiatAmount, uint256 cryptoAmount);
    event CryptoSale(address customerAddress, uint256 cryptoAmount, uint256 fiatAmount);
    event Refund(address customerAddress, uint256 cryptoAmount);
    event EthRecieved(address customerAddress, uint256 cryptoAmount);

    /// uint256 dailyOutLimit = 5.1234567891012131 ether; /* Ether */

    mapping(address => uint256) internal customerBalance;

    /**
     * @dev The Atola constructor sets the original `owner` of the contract to the sender
     * account.
    */
    constructor(address _baseCurrency, address _baseExchange) public {
        owner = msg.sender;
        basetoken = IERC20(_baseCurrency);
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
    function transferOwnership(address payable newOwner) external onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @dev Allows the owner to add/remove a trusted BTM address
     * @param _newBtmAddress The address of the new BTM
     * @param _state Whether the machine is enabled or disabled
     * @param _buyFee Default buy fee on this machine
     * @param _sellFee Default sell fee on this machine
    */
    function modifyBtm(address _newBtmAddress, bool _state, uint256 _buyFee, uint256 _sellFee) external onlyOwner {
        BtmAddresses[_newBtmAddress] = _state;
        buyFee[_newBtmAddress] = _buyFee;
        sellFee[_newBtmAddress] = _sellFee;
    }

    /**
     * @dev Allows the owner to add a trusted token address
     * @param _token The address of the token contract (warning: make sure it's compliant)
    */
    function addToken(address _token) external onlyOwner {
        supportedTokens.push(_token);
    }

    /**
     * @dev Allows the owner to add/remove a trusted BTM address
     * @param _token The address of the token contract (warning: make sure it's compliant)
    */
    function tokenEnabled(address _token) external view returns (bool) {
        return true;//supportedTokens[_token];
    }

    /**
     * @dev Allows the machine to submit a fiat -> eth order
     * @param _amountFiat Amount of fiat machine reports to have recieved (18 decimal places)
     * @param _userAddress Users crypto address
    */
    function fiatToEth(uint256 _amountFiat, uint256 _tolerance, address _userAddress) external onlyBtm returns (bool) {
        require(buyFee[msg.sender] < 10000); // i'm not sure this is a good enough check, if it is we only need to do it once when setting fee
        uint256 fee = (_amountFiat * buyFee[msg.sender]) / 10000;

        //call approve
        basetoken.approve(baseexchange, _amountFiat - fee);

        //call uniswap
        UniswapExchangeInterface ex = UniswapExchangeInterface(baseexchange);
        uint256 ethBought = ex.tokenToEthTransferInput(_amountFiat - fee, _tolerance, block.timestamp, _userAddress);

        emit CryptoPurchase(_userAddress, _amountFiat, ethBought);
    }


    /**
     * @dev Allows the machine to submit a fiat -> basetoken order
     * @param _amountFiat Amount of fiat machine reports to have recieved (18 decimal places)
     * @param _userAddress Users crypto address
    */
    function fiatToBaseTokens(uint256 _amountFiat, address payable _userAddress) external onlyBtm returns (bool) {
        require(buyFee[msg.sender] < 10000); // i'm not sure this is a good enough check, if it is we only need to do it once when setting fee
        uint256 fee = (_amountFiat * buyFee[msg.sender]) / 10000;

        //call transfer
        basetoken.transfer(address(_userAddress), _amountFiat - fee);

        emit CryptoPurchase(_userAddress, _amountFiat, _amountFiat - fee);
    }

    // Owner Functions

    /**
     * @dev Allows the owner to withdraw eth from the contract to the owner address
     * @param _amount Amount of of eth to withdraw (in wei)
    */
    function withdrawEth(uint256 _amount) external onlyOwner {
        owner.transfer(_amount);
    }

    /**
     * @dev Allows the owner to withdraw tokens from the contract to the owner address
     * @param _amount Amount of of tokens to withdraw (in wei)
    */
    function withdrawBaseTokens(uint256 _amount) external onlyOwner {
        basetoken.transfer(owner, _amount);
    }

    /**
     * @dev Allows the owner to withdraw tokens from the contract to the owner address
     * @param _amount Amount of of tokens to withdraw (in wei)
    */
    function withdrawTokens(address token, uint256 _amount) external onlyOwner {
        IERC20 withdrawtoken = IERC20(token);
        withdrawtoken.transfer(owner, _amount);
    }

    /**
     * @dev Allows owner to lookup token balance of contract
    */
    function tokenBalanceAmount() external view onlyOwner returns (uint256) {
        return basetoken.balanceOf(owner);
    }

    /**
     * @dev Allows owner to lookup eth balance of contract
    */
    function ethBalanceAmount() external view onlyOwner returns (uint256) {
        return (address(this).balance);
    }

    /**
     * @dev Allows customer to claim refund if order hasn't been processed (TO-DO add a delay to this to avoid double spend race)
     * @param _user Customer address
     * @param _amount Refund amount
    */
    function refund(address payable _user, uint256 _amount) public {
        require(msg.sender == _user);
        require(customerBalance[_user] > _amount);
        customerBalance[_user] -= _amount;
        _user.transfer(customerBalance[_user]);
        emit Refund(_user, _amount);
    }

    /**
     * @dev Allows customer to sell eth (needs to have already sent eth to the contract).  Called by the machine.
     * @param _user Customer address
     * @param _amountFiat Amount to process
    */
    function ethToFiat(address payable _user, uint256 _amountFiat) public onlyBtm {

        require(sellFee[msg.sender] < 10000); // i'm not sure if this is a good enough check, if it is we only need to do it once when setting fee
        uint256 fee = (_amountFiat * sellFee[msg.sender]) / 10000;
        //call uniswap
        UniswapExchangeInterface ex = UniswapExchangeInterface(baseexchange);

        uint256 ethSold = ex.ethToTokenTransferOutput.value(customerBalance[_user])(_amountFiat + fee, block.timestamp, _user);

        customerBalance[_user] -= ethSold;

        // Send change to the user (the alternative is for the change to be processed on a seperate contract call :/)
        _user.transfer(customerBalance[_user]);

        emit CryptoSale(_user, ethSold, _amountFiat);
    }

    /**
     * @dev Shows the amount of ETH from customer pending sale
     * @param _user Customer crypto address
    */
    function amountForAddress(address _user) public view onlyBtm returns (uint256) {
        return (customerBalance[_user]);
    }

    /**
     * @dev Fallback payable function.  When customer send eth to the contract take note so we can use it to process a transaction.
    */
    function() external payable {
        customerBalance[msg.sender] += msg.value;
        emit EthRecieved(msg.sender, msg.value);
    }


}
