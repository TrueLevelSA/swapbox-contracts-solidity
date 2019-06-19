// need to figure out how to return the data (cant return array of struct which would be much more elegant than returning an array where for example the first element is token, second is input balance, third is output balance and then next token etc :/)
pragma solidity ^0.5.8;

interface ERC20 {
    function balanceOf(address owner) external view returns (uint256);
}

import "./Atola.sol";

contract PriceFeed {

  Atola atola;

  /**
   * @dev The PriceFeed constructor sets the address of the AtolaContract where
   * we look up supportedTokens
  */
  constructor(address payable _atolaContract) public {
      atola = Atola(_atolaContract);
  }

  function getBalances() external view returns(uint256[] memory, uint256[] memory) {
    // holds an array of `BalanceTuple` for each supported token. then we fill
    uint256[] memory tokenBalances = new uint256[](atola.getTokenCount());
    uint256[] memory ethBalances = new uint256[](atola.getTokenCount());

    for (uint i = 0; i < atola.getTokenCount(); i++) {
      address exchangeContractAddress = atola.supportedTokensArr(i);
      ERC20 token = ERC20(exchangeContractAddress);

      // token balance of the
      tokenBalances[i] = token.balanceOf(address(atola.baseexchange()));
      ethBalances[i] = address(token).balance;
    }
    return (tokenBalances, ethBalances);
  }
}


/*
pragma solidity >=0.4.22 <0.6.0;
interface ERC20 {
    function balanceOf(address owner) external view returns (uint256);
}
contract BalanceOracle {

    function exploreBalances(address[] calldata users) external view returns(uint256[] memory balances) {
        balances = new uint256[](users.length);
        for(uint i = 0; i < users.length; i++) {
            balances[i] = users[i].balance;
        }
    }

    function erc20Balances(address _token, address[] calldata users) external view returns(uint256[] memory balances) {
        ERC20 erc20 = ERC20(_token);
        balances = new uint256[](users.length);
        for(uint i = 0; i < users.length; i++) {
            balances[i] = erc20.balanceOf(users[i]);
        }
    }
} */
