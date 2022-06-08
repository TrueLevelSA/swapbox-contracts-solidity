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

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";


abstract contract Swapbox is Ownable {
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

    // Backing token, representing the fiat input in the physical machine.
    IERC20 internal _baseToken;

    // Machine fees, each machine can have its proper fees.
    mapping(address => Fee) internal _machineFees;

    // Customer balances.
    mapping(address => uint256) internal customerBalance;

    // Set of authorized machines.
    mapping(address => bool) private _authorizedMachines;

    // Set of supported tokens.
    EnumerableSet.AddressSet private _supportedTokens;

    //TODO: #23 check which fields we need in the event log and whether we can have addresses as indexed
    event MachineAuthorized(address machineAddress);
    event MachineRevoked(address machineAddress);
    event CryptoPurchase(address customerAddress, uint256 fiatAmount, uint256 cryptoAmount);
    event CryptoSale(address customerAddress, uint256 cryptoAmount, uint256 fiatAmount);
    event Refund(address customerAddress, uint256 cryptoAmount);
    event EthReceived(address customerAddress, uint256 cryptoAmount);

    /**
     * @dev Modifier that revert if the sender is not an authorized machine.
     */
    modifier onlyAuthorizedMachine() {
        require(isAuthorized(msg.sender), "Swapbox: machine is not authorized");
        _;
    }

    /**
     * @dev Initializes the contract setting the base token.
     *
     * @param baseToken Address of the backing token representing the fiat input in the physical Swapbox.
     */
    constructor(address baseToken) {
        _baseToken = IERC20(baseToken);
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

    /**
     * @dev Allows the `owner` to add an authorized machine address.
     *
     * @param machineAddress    The address of the machine to authorize.
     */
    function authorizeMachine(address machineAddress) external onlyOwner {
        if (!isAuthorized(machineAddress)) {
            _authorizedMachines[machineAddress] = true;
            emit MachineAuthorized(machineAddress);
        }
    }

    /**
     * @dev Allows the `owner` to remove an authorized machine address.
     *
     * @param machineAddress    The address of the machine to revoke.
     */
    function revokeMachine(address machineAddress) external onlyOwner {
        if (isAuthorized(machineAddress)) {
            delete _authorizedMachines[machineAddress];
            emit MachineRevoked(machineAddress);
        }
    }

    /**
     * @dev Allows the owner to add a trusted token address.
     *
     * @param tokenAddress  The address of the token contract (warning: make sure it's compliant)
     */
    function addToken(address tokenAddress) external onlyOwner returns (bool) {
        return _supportedTokens.add(tokenAddress);
    }

    /**
     * @dev Allows the owner to remove a supported token
     *
     * @param tokenAddress The address of the token contract
     */
    function removeToken(address tokenAddress) external onlyOwner returns (bool) {
        return _supportedTokens.remove(tokenAddress);
    }

    /**
     * @dev Allows the owner to edit a machine's fees.
     *
     * @param machineAddress    The address of the BTM
     * @param buyFee            Default buy fee on this machine
     * @param sellFee           Default sell fee on this machine
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
     * @dev Return the supported token set in an array.
     *
     * - Elements are enumerated in O(n). No guarantees are made on the ordering.
     *
     * WARNING: This operation will copy the entire storage to memory, which can
     * be quite expensive. This is designed to stay be used by view accessors that
     * are queried without any gas fees. Developers should keep in mind that this
     * function has an unbounded cost, and using it as part of a state-changing function
     * may render the function uncallable if the set grows to a point where copying
     * to memory consumes too much gas to fit in a block.
     */
    function supportedTokensList() external view returns (address[] memory) {
        return _supportedTokens.values();
    }

    /**
     * @dev Allows the owner to withdraw eth from the contract to the owner address
     *
     * @param amount Amount of of eth to withdraw (in wei)
     */
    function withdrawEth(uint256 amount) external onlyOwner {
        payable(owner()).transfer(amount);
    }

    /**
     * @dev Allows the owner to withdraw tokens from the contract to the owner address
     *
     * @param amount Amount of of tokens to withdraw (in wei)
     */
    function withdrawBaseTokens(uint256 amount) external onlyOwner {
        _baseToken.transfer(owner(), amount);
    }

    /**
     * @dev Allows the owner to withdraw tokens from the contract to the owner address
     *
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
        return _baseToken.balanceOf(owner());
    }

    /**
     * @dev Allows owner to lookup eth balance of contract
    */
    function ethBalanceAmount() external view onlyOwner returns (uint256) {
        return (address(this).balance);
    }

    /**
     * @dev Returns the amount of supported tokens.
     */
    function getTokenCount() external view returns (uint256 count) {
        return _supportedTokens.length();
    }

    /**
     * @dev Shows the amount of ETH from customer pending sale
     *
     * @param user Customer crypto address
     */
    function amountForAddress(address user) public view onlyAuthorizedMachine returns (uint256) {
        return (customerBalance[user]);
    }

    /**
     * @dev Allows the machine to submit a `baseToken` -> ETH order.
     *
     * @param amountFiat    Amount of fiat machine reports to have received (18 decimal places).
     * @param minValue      Minimum amount to be received.
     * @param to            Receiving address.
     */
    function buyEth(
        uint256 amountFiat,
        uint256 minValue,
        address to
    ) external onlyAuthorizedMachine {
        _buyEth(amountFiat, minValue, to);
    }

    /**
     * @dev Allows the machine to submit a ETH -> `baseToken` order.
     *
     * @param amountFiat    Amount of fiat machine reports to have received (18 decimal places).
     * @param minValue      Minimum amount to be received.
     * @param to            Receiving address.
    */
    function sellEth(uint256 amountFiat, uint256 minValue, address to) external onlyAuthorizedMachine {
        _sellEth(amountFiat, minValue, to);
    }

    /**
     * @dev Returns `true` if `machineAddress` is authorized for transactions.
     *
     * @param machineAddress    The address of the machine to check for authorization.
     */
    function isAuthorized(address machineAddress) public view returns (bool) {
        return _authorizedMachines[machineAddress];
    }

    /**
     * @dev Allows customer to claim refund if order hasn't been processed (TO-DO add a delay to this to avoid double spend race)
     *
     * @param amount Refund amount
     */
    function refund(uint256 amount) public {
        require(customerBalance[msg.sender] > amount, "Swapbox: cannot refund more than the balance");
        customerBalance[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
        emit Refund(msg.sender, amount);
    }

    /**
     * @dev Must be implemented by concrete Swapbox instance.
     */
    function _buyEth(uint256 amountFiat, uint256 minValue, address to) internal virtual;

    /**
     * @dev Must be implemented by concrete Swapbox instance.
     */
    function _sellEth(uint256 amountFiat, uint256 minValue, address to) internal virtual;
}
