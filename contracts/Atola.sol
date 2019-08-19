pragma solidity 0.5.8;

import "./IERC20.sol";
import "./UniswapExchangeInterface.sol";


contract Atola {
    address payable internal owner;
    IERC20 internal basetoken; // 0xb4272071ecadd69d933adcd19ca99fe80664fc08 for xCHF
    address public baseexchange; // 0x8de0d002dc83478f479dc31f76cb0a8aa7ccea17 for xCHF
    address[] public supportedTokensArr;
    address[] public machineAddressesArr;

    mapping(address => uint256) public machineAddresses; // maps to index of machineAddressesArr
    mapping(address => uint256) public supportedTokens; // maps to index of supportedTokensArr
    mapping(address => uint256) internal buyFee; //(eg 1.2 percent -> 120)
    mapping(address => uint256) internal sellFee; //(eg 1.2 percent -> 120)

    event OwnershipTransferred(address previousOwner, address payable newOwner);

    // TO-DO check which fields we need in the event log and whether we can have addresses as indexed
    event CryptoPurchase(address customerAddress, uint256 fiatAmount, uint256 cryptoAmount);
    event CryptoSale(address customerAddress, uint256 cryptoAmount, uint256 fiatAmount);
    event Refund(address customerAddress, uint256 cryptoAmount);
    event EthReceived(address customerAddress, uint256 cryptoAmount);

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
        require(msg.sender == owner, "not owner");
        _;
    }

    /**
     * @dev Throws if called by any account other than thoses in the machineAddresses list
    */
    modifier onlyBtm() {
        require(machineAddresses[msg.sender] > 0, "not a btm");
        _;
    }

    function getTokenCount() public view returns(uint count) {
        return supportedTokensArr.length;
    }

    // ideally should do the following to avoid having the two functions above, included for testing
    function removeItemFromArrayAndMapping(address[] storage array, mapping (address => uint256) storage itemMapping, address _itemToDelete) internal {
      require(itemMapping[_itemToDelete] > 0, "item not present");
      uint index = itemMapping[_itemToDelete];

      if (array.length > 1) {
        array[index] = array[array.length-1];
        itemMapping[array[index]] = index; // as we moved last element to index, we should update the mapping to reflect this
      }
      delete itemMapping[_itemToDelete];
      array.length--; // Implicitly recovers gas from last element storage
    }

    /**
     * @dev Allows the current owner to transfer control of the contract to a newOwner.
     * @param _newOwner The address to transfer ownership to.
    */
    function transferOwnership(address payable _newOwner) external onlyOwner {
        require(_newOwner != address(0), "owner cannot be zero");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    /**
     * @dev Allows the owner to add a trusted BTM address
     * @param _machineAddress The address of the BTM
    */
    function addMachine(address _machineAddress) external onlyOwner {
        require(_machineAddress != address(0), "machine cannot be zero");
        uint256 len = machineAddressesArr.push(_machineAddress);
        machineAddresses[_machineAddress] = len;
    }

    /**
     * @dev Allows the owner to remove a trusted BTM address
     * @param _machineAddress The address of the BTM
    */
    function removeMachine(address _machineAddress) external onlyOwner {
        removeItemFromArrayAndMapping(machineAddressesArr, machineAddresses, _machineAddress);
    }

    /**
     * @dev Allows the owner to add/remove a trusted BTM address
     * @param _machineAddress The address of the BTM
     * @param _buyFee Default buy fee on this machine
     * @param _sellFee Default sell fee on this machine
    */
    function modifyBtm(address _machineAddress, uint256 _buyFee, uint256 _sellFee) external onlyOwner {
        require(buyFee[msg.sender] < 10000, "buy fee must be under 100%");   // prevent underflow
        require(sellFee[msg.sender] < 10000, "sell fee must be under 100%"); // prevent underflow
        buyFee[_machineAddress] = _buyFee;
        sellFee[_machineAddress] = _sellFee;
    }

    /**
     * @dev Allows the owner to add a trusted token address
     * @param _token The address of the token contract (warning: make sure it's compliant)
    */
    function addToken(address _token) external onlyOwner {
      require(_token != address(0), "token cannot be zero");
      uint256 len = supportedTokensArr.push(_token);
      supportedTokens[_token] = len;
    }

    /**
     * @dev Allows the owner to remove a supported token
     * @param _tokenAddress The address of the token contract
    */
    function removeToken(address _tokenAddress) external onlyOwner {
        removeItemFromArrayAndMapping(supportedTokensArr, supportedTokens, _tokenAddress);
    }

    /**
     * @dev Allows the machine to submit a fiat -> eth order
     * @param _amountFiat Amount of fiat machine reports to have recieved (18 decimal places)
     * @param _userAddress Users crypto address
    */
    function fiatToEth(uint256 _amountFiat, uint256 _tolerance, address _userAddress) external onlyBtm returns (bool) {
        uint256 fee = (_amountFiat * buyFee[msg.sender]) / 10000;
        uint256 amountLessFee = _amountFiat - fee;
        uint256 deadline = block.timestamp + 120;

        // approve exchange for Atola
        basetoken.approve(baseexchange, amountLessFee);

        //call uniswap
        UniswapExchangeInterface ex = UniswapExchangeInterface(baseexchange);
        uint256 ethBought = ex.tokenToEthTransferInput(
          amountLessFee,
          _tolerance,
          deadline,
          _userAddress
        );

        emit CryptoPurchase(_userAddress, _amountFiat, ethBought);
    }


    /**
     * @dev Allows the machine to submit a fiat -> basetoken order
     * @param _amountFiat Amount of fiat machine reports to have recieved (18 decimal places)
     * @param _userAddress Users crypto address
    */
    /* function fiatToBaseTokens(uint256 _amountFiat, address payable _userAddress) external onlyBtm returns (bool) {
        uint256 fee = (_amountFiat * buyFee[msg.sender]) / 10000;

        //call transfer
        basetoken.transfer(address(_userAddress), _amountFiat - fee);

        emit CryptoPurchase(_userAddress, _amountFiat, _amountFiat - fee);
    } */

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
     * @param token Token contract address
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
     * @param _amount Refund amount
    */
    function refund(uint256 _amount) public {
        require(customerBalance[msg.sender] > _amount, "cannot refund more than the balance");
        customerBalance[msg.sender] -= _amount;
        msg.sender.transfer(_amount);
        emit Refund(msg.sender, _amount);
    }

    /**
     * @dev Allows customer to sell eth (needs to have already sent eth to the contract).  Called by the machine.
     * @param _user Customer address
     * @param _amountFiat Amount to process
    */
    function ethToFiat(address payable _user, uint256 _amountFiat) public onlyBtm {
        uint256 fee = (_amountFiat * sellFee[msg.sender]) / 10000;
        //call uniswap
        UniswapExchangeInterface ex = UniswapExchangeInterface(baseexchange);

        uint256 ethSold = ex.ethToTokenTransferOutput.value(customerBalance[_user])(_amountFiat + fee, block.timestamp, _user);
        require(ethSold <= customerBalance[_user], "cannot sell more than the customer has");
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
        emit EthReceived(msg.sender, msg.value);
    }
}
