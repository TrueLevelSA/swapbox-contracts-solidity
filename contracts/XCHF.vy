# Swap-box
# Copyright (C) 2019  TrueLevel SA
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

# THIS CONTRACT IS FOR TESTING PURPOSES AND IS NOT PART OF THE PROJECT

# Modified from: https://github.com/ethereum/vyper/blob/master/examples/tokens/ERC20_solidity_compatible/ERC20.v.py

Transfer: event({_from: indexed(address), _to: indexed(address), _value: uint256(wei)})
Approval: event({_owner: indexed(address), _spender: indexed(address), _value: uint256(wei)})

name: public(bytes32)                           # CryptoFranc
symbol: public(bytes32)                         # XCHF
decimals: public(uint256)
balances: uint256(wei)[address]
allowances: (uint256(wei)[address])[address]
total_supply: uint256(wei)

@public
def __init__():
    _sender: address = msg.sender
    _supply: uint256(wei) = 10000000000000000000
    self.name = 0x43727970746f4672616e63000000000000000000000000000000000000000000
    self.symbol = 0x5843484600000000000000000000000000000000000000000000000000000000
    self.decimals = 18
    self.balances[_sender] = _supply
    self.total_supply = _supply
    log.Transfer(ZERO_ADDRESS, _sender, _supply)

@public
@payable
def deposit():
    _value: uint256(wei) = msg.value * 200  # 1 ETH = 200 XCHF (dev purpose)
    _sender: address = msg.sender
    self.balances[_sender] = self.balances[_sender] + _value
    self.total_supply = self.total_supply + _value
    log.Transfer(ZERO_ADDRESS, _sender, _value)

@public
def withdraw(_value : uint256(wei)) -> bool:
    _sender: address = msg.sender
    self.balances[_sender] = self.balances[_sender] - _value
    self.total_supply = self.total_supply - _value
    send(_sender, _value)
    log.Transfer(_sender, ZERO_ADDRESS, _value)
    return True

@public
@constant
def totalSupply() -> uint256(wei):
    return self.total_supply

@public
@constant
def balanceOf(_owner : address) -> uint256(wei):
    return self.balances[_owner]

@public
def transfer(_to : address, _value : uint256(wei)) -> bool:
    _sender: address = msg.sender
    self.balances[_sender] = self.balances[_sender] - _value
    self.balances[_to] = self.balances[_to] + _value
    log.Transfer(_sender, _to, _value)
    return True

@public
def transferFrom(_from : address, _to : address, _value : uint256(wei)) -> bool:
    _sender: address = msg.sender
    allowance: uint256(wei) = self.allowances[_from][_sender]
    self.balances[_from] = self.balances[_from] - _value
    self.balances[_to] = self.balances[_to] + _value
    self.allowances[_from][_sender] = allowance - _value
    log.Transfer(_from, _to, _value)
    return True

@public
def approve(_spender : address, _value : uint256(wei)) -> bool:
    _sender: address = msg.sender
    self.allowances[_sender][_spender] = _value
    log.Approval(_sender, _spender, _value)
    return True

@public
@constant
def allowance(_owner : address, _spender : address) -> uint256(wei):
    return self.allowances[_owner][_spender]
