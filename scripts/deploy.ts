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

import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {ERC20PresetMinterPauser} from "../typechain/ERC20PresetMinterPauser";
import {ERC20PresetMinterPauser__factory} from "../typechain/factories/ERC20PresetMinterPauser__factory";
import {tracer} from "hardhat";


export async function deployMintableToken(
    deployer: SignerWithAddress,
    name: string,
    symbol: string
): Promise<ERC20PresetMinterPauser> {
    const token = await (new ERC20PresetMinterPauser__factory(deployer)).deploy(name, symbol)
    tracer.nameTags[token.address] = name;
    return token;
}
