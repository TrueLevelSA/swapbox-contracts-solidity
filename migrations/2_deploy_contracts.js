const Atola = artifacts.require("Atola");

const argv = require('yargs').argv

if(argv.basecurrency && argv.baseexchange){
  const baseCurrency = argv.basecurrency;
  const baseExchange = argv.baseexchange;
}else{
  console.error("baseCurrency and baseExchange needs to be set");
}

module.exports = function(deployer) {
  // deployer.deploy(ConvertLib);
  // deployer.link(ConvertLib, Atola);
  deployer.deploy(Atola, baseCurrency, baseExchange);
};
