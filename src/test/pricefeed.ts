// Swap-box
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

import { ERC20 } from '../contracts/types/ERC20';
import { PriceFeed } from '../contracts/types/PriceFeed';
import { UniswapExchange } from '../contracts/types/UniswapExchange';
import { Eth } from 'web3x/eth';
import {  toWei } from 'web3x/utils';
import BN from 'bn.js';

const config = (process.env.NODE_ENV === 'production')
  ? require('../contracts/deployed/ropsten.json')
  : require('../contracts/deployed/private.json')

contract('PriceFeed', () => {
  let eth: Eth;
  let priceFeed: PriceFeed;
  let baseToken: ERC20;
  let exchange: UniswapExchange;

  before(async () => {
    // retrieve current provider
    const currentEth = Eth.fromCurrentProvider();
    if (currentEth) {
      eth = currentEth;
    } else {
      throw Error('No web3 provider found');
    }

    // retrieve deployed contracts
    priceFeed = new PriceFeed(eth, config.PRICEFEED);
    baseToken = new ERC20(eth, config.BASE_TOKEN);
    exchange = new UniswapExchange(eth, config.UNISWAP_EXCHANGE);
  });

  it('check getReserves returns right balances', async () => {
    const reserves = await priceFeed.methods.getReserves().call();
    const pfTokenReserve = new BN(reserves[0]);
    const pfEthReserve = new BN(reserves[1]);

    if (!exchange.address){
      console.error("Exchange address not set");
      return;
    }
    const tokenReserve = await baseToken.methods.balanceOf(exchange.address).call();
    const ethReserve = await eth.getBalance(exchange.address);
    assert.isTrue(pfTokenReserve.eq(new BN(tokenReserve)), "token reserve is wrong");
    assert.isTrue(pfEthReserve.eq(new BN(ethReserve)), "eth reserve is wrong");
  });

  it('check buyPrice is smaller than sellPrice', async () => {
    const tokensAmount = toWei('1', 'ether');
    const prices = await priceFeed.methods.getPrice(tokensAmount, tokensAmount).call();
    const buyPrice = new BN(prices[0]);
    const sellPrice = new BN(prices[1]);
    assert.isTrue(buyPrice.lt(sellPrice));
  })
});
