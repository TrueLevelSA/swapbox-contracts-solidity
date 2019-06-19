// need to figure out how to return the data (cant return array of struct which would be much more elegant than returning an array where for example the first element is token, second is input balance, third is output balance and then next token etc :/)
pragma solidity ^0.5.8;

interface ERC20 {
    function balanceOf(address owner) external view returns (uint256);
}

import "./Atola.sol";

contract PriceFeed {

  Atola a;


  /**
   * @dev The PriceFeed constructor sets the address of the AtolaContract where
   * we look up supportedTokens
  */
  constructor(address payable _atolaContract) public {
      a = Atola(_atolaContract);
  }

  function getBalances() external view returns(uint256[] memory balances) {

    /* balances = new uint256[](a.supportedTokens().length); */
    balances = new uint256[](a.getTokenCount());
    for (uint i=0; i<a.getTokenCount(); i++) {
      ERC20 erc20 = ERC20(a.supportedTokensArr(i));
      /* balances[i] = erc20.balanceOf(a.baseexchange()); */
      balances[i] = erc20.balanceOf(address(a.baseexchange())); //supportedTokens(i);
    }

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
