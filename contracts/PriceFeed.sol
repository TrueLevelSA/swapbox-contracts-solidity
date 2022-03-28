// SPDX-License-Identifier: AGPL-3.0

// Swapbox
// Copyright (C) 2022  TrueLevel SA
//
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

interface Token {
    function balanceOf(address who) external view returns (uint256);
}

interface Exchange {function tokenAddress() external view returns (address token);
    function getTokenToEthInputPrice(uint256 tokens_sold) external view returns (uint256);
    function getEthToTokenOutputPrice(uint256 tokens_bought) external view returns (uint256);
}

import "./Swapbox.sol";

contract PriceFeed {
    Swapbox swapbox;

    /**
     * @dev The PriceFeed constructor sets the address of the SwapBox where
     * we look up supportedTokens
     */
    constructor(address payable swapboxAddress) {
        swapbox = Swapbox(swapboxAddress);
    }

    function getPrice(uint256 tokensSold, uint256 tokensBought) external view returns(uint256, uint256) {
        Exchange exchange = Exchange(swapbox.baseExchange());
        return (exchange.getTokenToEthInputPrice(tokensSold), exchange.getEthToTokenOutputPrice(tokensBought));
    }

    function getReserves() external view returns(uint256 tokenReserve, uint256 ethReserve) {
        address exchangeAddress = swapbox.baseExchange();
        Exchange exchange = Exchange(exchangeAddress);
        Token token = Token(exchange.tokenAddress());
        return (token.balanceOf(exchangeAddress), exchangeAddress.balance);
    }
}
