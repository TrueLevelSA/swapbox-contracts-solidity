// SPDX-License-Identifier: AGPL-3.0

// Swapbox
// Copyright (C) 2022  TrueLevel SA
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.


pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./UniswapExchangeInterface.sol";


contract Swapbox is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    struct Fee {
        // divisor is hardcoded to 100. A fee of 120 is 1.2% fee.
        uint256 buy;
        uint256 sell;
    }
    uint256 public constant MAX_FEE = 10000;

    mapping(address => bool) private _authorizedMachines;
    mapping(address => Fee) private _machineFees;

    EnumerableSet.AddressSet private supportedTokens;

    IERC20 internal baseToken; // 0xb4272071ecadd69d933adcd19ca99fe80664fc08 for xCHF
    address public baseExchange; // 0x8de0d002dc83478f479dc31f76cb0a8aa7ccea17 for xCHF


    //TODO: check which fields we need in the event log and whether we can have addresses as indexed
    event MachineAuthorized(address machineAddress);
    event MachineRevoked(address machineAddress);
    event CryptoPurchase(address customerAddress, uint256 fiatAmount, uint256 cryptoAmount);
    event CryptoSale(address customerAddress, uint256 cryptoAmount, uint256 fiatAmount);
    event Refund(address customerAddress, uint256 cryptoAmount);
    event EthReceived(address customerAddress, uint256 cryptoAmount);

    mapping(address => uint256) internal customerBalance;

    /**
     * @dev The Swapbox constructor.
    */
    constructor(address _baseCurrency, address _baseExchange) {
        baseToken = IERC20(_baseCurrency);
        baseExchange = _baseExchange;
    }

    /**
     * @dev Modifier that revert if the sender is not an authorized machine.
     */
    modifier onlyAuthorizedMachine() {
        require(isAuthorized(msg.sender), "Swapbox: Machine is not authorized");
        _;
    }

    function getTokenCount() public view returns(uint count) {
        return supportedTokens.length();
    }

    /**
     * @dev Returns `true` if `machineAddress` is authorized.
     * @param machineAddress The address of the machine to authorize.
     */
    function isAuthorized(address machineAddress) public view returns (bool) {
        return _authorizedMachines[machineAddress];
    }

    /**
     * @dev Allows the `owner` to add an authorized machine address.
     * @param machineAddress The address of the machine to authorize.
     */
    function authorizeMachine(address machineAddress) external onlyOwner {
        if (!isAuthorized(machineAddress)) {
            _authorizedMachines[machineAddress] = true;
            emit MachineAuthorized(machineAddress);
        }
    }

    /**
     * @dev Allows the `owner` to remove a authorized machine address.
     * @param machineAddress The address of the machine to authorize.
     */
    function revokeMachine(address machineAddress) external onlyOwner {
        if (isAuthorized(machineAddress)) {
            _authorizedMachines[machineAddress] = false;
            emit MachineRevoked(machineAddress);
        }
    }

    /**
     * @dev Allows the owner to edit a machine's fees
     * @param machineAddress The address of the BTM
     * @param buyFee Default buy fee on this machine
     * @param sellFee Default sell fee on this machine
    */
    function updateMachineFees(
        address machineAddress,
        uint256 buyFee,
        uint256 sellFee
    ) external onlyOwner {
        // prevents underflow
        require(_machineFees[msg.sender].buy < MAX_FEE, "Swapbox: buy fee must be under 100%");
        require(_machineFees[msg.sender].sell < MAX_FEE, "Swapbox: sell fee must be under 100%");
        _machineFees[machineAddress] = Fee(buyFee, sellFee);
    }

    /**
     * @dev Allows the owner to add a trusted token address
     * @param tokenAddress The address of the token contract (warning: make sure it's compliant)
    */
    function addToken(address tokenAddress) external onlyOwner {
      supportedTokens.add(tokenAddress);
    }

    /**
     * @dev Allows the owner to remove a supported token
     * @param tokenAddress The address of the token contract
    */
    function removeToken(address tokenAddress) external onlyOwner {
        supportedTokens.remove(tokenAddress);
    }

    /**
     * @dev Allows the machine to submit a fiat -> eth order
     * @param _amountFiat Amount of fiat machine reports to have recieved (18 decimal places)
     * @param _userAddress Users crypto address
    */
    function fiatToEth(
        uint256 _amountFiat,
        uint256 _tolerance,
        address _userAddress
    ) external onlyAuthorizedMachine {
        uint256 fee = (_amountFiat * _machineFees[msg.sender].buy) / MAX_FEE;
        uint256 amountLessFee = _amountFiat - fee;
        uint256 deadline = block.timestamp + 120;

        // approve exchange for Swapbox
        baseToken.approve(baseExchange, amountLessFee);

        //call uniswap
        UniswapExchangeInterface ex = UniswapExchangeInterface(baseExchange);
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


    /**
     * @dev Allows the owner to withdraw eth from the contract to the owner address
     * @param amount Amount of of eth to withdraw (in wei)
    */
    function withdrawEth(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }

    /**
     * @dev Allows the owner to withdraw tokens from the contract to the owner address
     * @param amount Amount of of tokens to withdraw (in wei)
    */
    function withdrawBaseTokens(uint256 amount) external onlyOwner {
        baseToken.transfer(owner(), amount);
    }

    /**
     * @dev Allows the owner to withdraw tokens from the contract to the owner address
     * @param token Token contract address
     * @param amount Amount of of tokens to withdraw (in wei)
    */
    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        IERC20 withdrawtoken = IERC20(token);
        withdrawtoken.transfer(owner(), amount);
    }

    /**
     * @dev Allows owner to lookup token balance of contract
    */
    function tokenBalanceAmount() external view onlyOwner returns (uint256) {
        return baseToken.balanceOf(owner());
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
        require(customerBalance[msg.sender] > _amount, "Swapbox: Cannot refund more than the balance");
        customerBalance[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
        emit Refund(msg.sender, _amount);
    }

    /**
     * @dev Allows customer to sell eth (needs to have already sent eth to the contract).  Called by the machine.
     * @param _user Customer address
     * @param _amountFiat Amount to process
    */
    function ethToFiat(address payable _user, uint256 _amountFiat) public onlyAuthorizedMachine {
        uint256 fee = (_amountFiat * _machineFees[msg.sender].sell) / MAX_FEE;
        //call uniswap
        UniswapExchangeInterface ex = UniswapExchangeInterface(baseExchange);

        uint256 ethSold = ex.ethToTokenTransferOutput{value: customerBalance[_user]}(
            _amountFiat + fee,
            block.timestamp,
            _user
        );

        require(ethSold <= customerBalance[_user], "Swapbox: Cannot sell more than the customer has");
        customerBalance[_user] -= ethSold;

        // Send change to the user (the alternative is for the change to be processed on a seperate contract call :/)
        _user.transfer(customerBalance[_user]);

        emit CryptoSale(_user, ethSold, _amountFiat);
    }

    /**
     * @dev Shows the amount of ETH from customer pending sale
     * @param _user Customer crypto address
    */
    function amountForAddress(address _user) public view onlyAuthorizedMachine returns (uint256) {
        return (customerBalance[_user]);
    }

    /**
     * @dev Receive function.
     *      When a customer send eth to the contract take note so we can use
     *      it to process a transaction.
    */
    receive() external payable {
        customerBalance[msg.sender] += msg.value;
        emit EthReceived(msg.sender, msg.value);
    }
}
