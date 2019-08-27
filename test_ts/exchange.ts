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

import { UniswapExchangeInterface } from './types/UniswapExchangeInterface';
import { Address } from 'web3x/address';
import { Eth } from 'web3x/eth';

const config = (process.env.NODE_ENV === 'production')
  ? require('../config/ropsten.json')
  : require('../config/local.json')



contract('Uniswap Exchange', () => {
  let eth: Eth;
  let exchange: UniswapExchangeInterface;
  let exchangeAddress: Address;

  before(() => {
    // retrieve current provider
    const currentEth = Eth.fromCurrentProvider();
    if (currentEth) {
      eth = currentEth;
    } else {
      throw Error('No web3 provider found');
    }

    // retrieve deployed contracts
    exchange = new UniswapExchangeInterface(eth, config.UNISWAP_EXCHANGE);

    // params
    if(exchange.address) {
      exchangeAddress = exchange.address;
    }

    // various checks
    if(!exchangeAddress) {
      throw Error('Exchange address not set');
    }
  });

  it('checks factory address', async () => {
    const factoryAddress = await exchange.methods.factoryAddress().call();
    assert.equal(factoryAddress, config.UNISWAP_FACTORY, 'factory address is wrong');
  });

  it('checks token address', async () => {
    const tokenAddress = await exchange.methods.tokenAddress().call();
    assert.equal(tokenAddress, config.BASE_TOKEN, 'token address is wrong');
  });
})
