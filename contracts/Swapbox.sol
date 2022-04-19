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


pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./UniswapExchangeInterface.sol";


contract Swapbox is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    // Represents a fee.
    struct Fee {
        // divisor is hardcoded to 100. A fee of 120 is 1.2% fee.
        uint256 buy;
        uint256 sell;
    }

    // Deadline timeout (s.) for txs.
    uint256 public constant DEADLINE_TIMEOUT = 120;

    //TODO: improve fees
    // Maximum fees, represents 100% fees.
    uint256 public constant MAX_FEE = 10000;

    // Set of authorized machines.
    mapping(address => bool) private _authorizedMachines;

    // Machine fees, each machine can have its proper fees.
    mapping(address => Fee) private _machineFees;

    // Set of supported tokens.
    EnumerableSet.AddressSet private _supportedTokens;

    // Backing token, representing the fiat input in the physical machine.
    IERC20 internal baseToken;

    // Base exchange.
    address public baseExchange;

    // Customer balances.
    mapping(address => uint256) internal customerBalance;

    //TODO: check which fields we need in the event log and whether we can have addresses as indexed
    event MachineAuthorized(address machineAddress);
    event MachineRevoked(address machineAddress);
    event CryptoPurchase(address customerAddress, uint256 fiatAmount, uint256 cryptoAmount);
    event CryptoSale(address customerAddress, uint256 cryptoAmount, uint256 fiatAmount);
    event Refund(address customerAddress, uint256 cryptoAmount);
    event EthReceived(address customerAddress, uint256 cryptoAmount);


    /**
     * @dev Initializes the contract setting the base token.
     *
     * @param baseCurrency_ Address of the backing token representing the fiat input in the physical Swapbox.
     */
    constructor(address baseCurrency_, address baseExchange_) {
        baseToken = IERC20(baseCurrency_);
        baseExchange = baseExchange_;
    }

    /**
     * @dev Modifier that revert if the sender is not an authorized machine.
     */
    modifier onlyAuthorizedMachine() {
        require(isAuthorized(msg.sender), "Swapbox: machine is not authorized");
        _;
    }

    function getTokenCount() public view returns (uint256 count) {
        return _supportedTokens.length();
    }

    /**
     * @dev Returns `true` if `machineAddress` is authorized for transactions.
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
            delete _authorizedMachines[machineAddress];
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
    function addToken(address tokenAddress) external onlyOwner returns (bool) {
        return _supportedTokens.add(tokenAddress);
    }

    /**
     * @dev Allows the owner to remove a supported token
     * @param tokenAddress The address of the token contract
    */
    function removeToken(address tokenAddress) external onlyOwner returns (bool) {
        return _supportedTokens.remove(tokenAddress);
    }

    /**
     * @dev Return the supported token set in an array.
     *
     * - Elements are enumerated in O(n). No guarantees are made on the ordering.
     *
     * WARNING: This operation will copy the entire storage to memory, which can
     * be quite expensive. This is designed to stay be used by view accessors that are queried without any gas fees.
     Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function supportedTokensList() external view returns (address[] memory) {
        return _supportedTokens.values();
    }

    /**
     * @dev Allows the machine to submit a fiat -> eth order
     * @param amountFiat Amount of fiat machine reports to have recieved (18 decimal places)
     * @param userAddress Users crypto address
    */
    function fiatToEth(
        uint256 amountFiat,
        uint256 tolerance,
        address userAddress
    ) external onlyAuthorizedMachine {
        uint256 fee = (amountFiat * _machineFees[msg.sender].buy) / MAX_FEE;
        uint256 amountLessFee = amountFiat - fee;
        uint256 deadline = block.timestamp + DEADLINE_TIMEOUT;

        // approve exchange for Swapbox
        baseToken.approve(baseExchange, amountLessFee);

        //call uniswap
        UniswapExchangeInterface ex = UniswapExchangeInterface(baseExchange);
        uint256 ethBought = ex.tokenToEthTransferInput(
            amountLessFee,
            tolerance,
            deadline,
            userAddress
        );

        emit CryptoPurchase(userAddress, amountFiat, ethBought);
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
     * @param amount Refund amount
    */
    function refund(uint256 amount) public {
        require(customerBalance[msg.sender] > amount, "Swapbox: cannot refund more than the balance");
        customerBalance[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Refund(msg.sender, amount);
    }

    /**
     * @dev Allows customer to sell eth (needs to have already sent eth to the contract).  Called by the machine.
     * @param user Customer address
     * @param amountFiat Amount to process
    */
    function ethToFiat(address payable user, uint256 amountFiat) public onlyAuthorizedMachine {
        uint256 fee = (amountFiat * _machineFees[msg.sender].sell) / MAX_FEE;
        //call uniswap
        UniswapExchangeInterface ex = UniswapExchangeInterface(baseExchange);

        uint256 ethSold = ex.ethToTokenTransferOutput{value : customerBalance[user]}(
            amountFiat + fee,
            block.timestamp,
            user
        );

        require(ethSold <= customerBalance[user], "Swapbox: cannot sell more than the customer has");
        customerBalance[user] -= ethSold;

        // Send change to the user (the alternative is for the change to be processed on a seperate contract call :/)
        user.transfer(customerBalance[user]);

        emit CryptoSale(user, ethSold, amountFiat);
    }

    /**
     * @dev Shows the amount of ETH from customer pending sale
     * @param user Customer crypto address
    */
    function amountForAddress(address user) public view onlyAuthorizedMachine returns (uint256) {
        return (customerBalance[user]);
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
