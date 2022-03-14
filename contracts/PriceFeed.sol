// Swapbox
// Copyright (C) 2019  TrueLevel SA
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

// need to figure out how to return the data (cant return array of struct which would be much more elegant than returning an array where for example the first element is token, second is input balance, third is output balance and then next token etc :/)
pragma solidity ^0.5.8;

interface Token {
  function balanceOf(address who) external view returns (uint256);
}

interface Exchange {
  function tokenAddress() external view returns (address token);
  function getTokenToEthInputPrice(uint256 tokens_sold) external view returns (uint256);
  function getEthToTokenOutputPrice(uint256 tokens_bought) external view returns (uint256);
}

import "./Swapbox.sol";

contract PriceFeed {

  Swapbox swapBox;

  /**
   * @dev The PriceFeed constructor sets the address of the SwapBox where
   * we look up supportedTokens
  */
  constructor(address payable _swapBoxAddress) public {
      swapBox = Swapbox(_swapBoxAddress);
  }

  function getPrice(uint256 tokensSold, uint256 tokensBought) external view returns(uint256, uint256) {
    Exchange exchange = Exchange(swapBox.baseExchange());
    return (exchange.getTokenToEthInputPrice(tokensSold), exchange.getEthToTokenOutputPrice(tokensBought));
  }

  function getReserves() external view returns(uint256 tokenReserve, uint256 ethReserve) {
    address exchangeAddress = swapBox.baseExchange();
    Exchange exchange = Exchange(exchangeAddress);
    Token token = Token(exchange.tokenAddress());
    return (token.balanceOf(exchangeAddress), exchangeAddress.balance);
  }
}
