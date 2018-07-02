var Agrichain = artifacts.require("./Agrichain.sol");

module.exports = function(deployer) {
  deployer.deploy(Agrichain);
};