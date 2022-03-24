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

acc0 = eth.accounts[0]
password = "password"

for (i = 0; i < 9; i++) {
  account = personal.newAccount(password)
  if (personal.unlockAccount(account, password, 0)) {
    console.log("Account ", account, "unlocked")
    // fund with `1 000 000 000 000` ETH each account
    eth.sendTransaction({from: acc0, to: account, value: "1000000000000000000000000000000"})
  } else {
    console.log("Error while unlocking ", account)
  }
}

// 0. contract owner/deployer
// 1. liquidity providers
// 2. machine
// 3. buyer
