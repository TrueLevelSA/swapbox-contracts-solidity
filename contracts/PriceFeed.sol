// need to figure out how to return the data (cant return array of struct which would be much more elegant than returning an array where for example the first element is token, second is input balance, third is output balance and then next token etc :/)
pragma solidity ^0.5.8;

interface Exchange {
  function getTokenToEthInputPrice(uint256 tokens_sold) external view returns (uint256);
  function getEthToTokenOutputPrice(uint256 tokens_bought) external view returns (uint256);
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

  function getPrice(uint256 tokensSold, uint256 tokensBought) external view returns(uint256, uint256) {
    Exchange exchange = Exchange(atola.baseexchange());
    return (exchange.getTokenToEthInputPrice(tokensSold), exchange.getEthToTokenOutputPrice(tokensBought));
  }
}
