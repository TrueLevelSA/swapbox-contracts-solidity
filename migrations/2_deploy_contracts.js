const ConvertLib = artifacts.require("ConvertLib");
const Atola = artifacts.require("Atola");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, Atola);
  deployer.deploy(Atola);
};
