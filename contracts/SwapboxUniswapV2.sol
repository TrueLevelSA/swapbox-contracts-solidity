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

import "./Swapbox.sol";

import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

import "hardhat/console.sol";


contract SwapboxUniswapV2 is Swapbox {

    address public immutable WETH;

    IUniswapV2Factory private _factory;
    IUniswapV2Router02 private _router;

    IUniswapV2Pair private _pair;

    /**
     * @dev The Swapbox Uniswap V2 constructor.
     */
    constructor(address baseToken, address WETH_, address factory, address router) Swapbox(baseToken){
        WETH = WETH_;
        _factory = IUniswapV2Factory(factory);
        _router = IUniswapV2Router02(router);

        _pair = IUniswapV2Pair(_factory.getPair(WETH, address(_baseToken)));
    }

    /**
     * @dev Send a swap order to swapbox default pair.
     *
     * @param   amountIn        Cash in.
     * @param   amountOutMin    Min amount user will receive.
     * @param   to              Address that will receive ETH.
     */
    function _buyEth(uint256 amountIn, uint256 amountOutMin, address to) internal override {
        uint256 fee = (amountIn * _machineFees[msg.sender].buy) / MAX_FEE;
        uint256 amountInLessFee = amountIn - fee;
        uint256 deadline = block.timestamp + 120;

        require(_baseToken.approve(address(_router), amountInLessFee), 'SwapboxUniswapV2: approve failed.');

        address[] memory path = new address[](2);
        path[0] = address(_baseToken);
        path[1] = WETH;
        uint[] memory amounts = _router.swapExactTokensForETH(
            amountInLessFee,
            amountOutMin,
            path,
            to,
            deadline
        );

        emit CryptoPurchase(to, amounts[0], amounts[1]);
    }

    function _sellEth(uint256 amountFiat, uint256 minValue, address to) internal override {
        uint256 fee = (amountFiat * _machineFees[msg.sender].sell) / MAX_FEE;
        uint256 amountLessFee = amountFiat - fee;
//        uint256 deadline = block.timestamp + 120;

        // approve exchange for Swapbox
        _baseToken.approve(address(_pair), amountLessFee);

        //call uniswap
        _pair.swap(amountFiat, minValue, to, new bytes(0));

        emit CryptoSale(to, amountFiat, minValue);
    }
}
