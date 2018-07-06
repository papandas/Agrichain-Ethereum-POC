/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
      gas: 90000000, gasPrice: web3.toWei(10000000, 'gwei'),
    },
    rinkeby: {
      host:"localhost",
      port:8545,
      from: "0x2d62771cb1bbb9fc81289276014b76954a57b648",
      network_id: 4,
      gas: 90000000, gasPrice: web3.toWei(1000000000, 'gwei'),
    }
  }
};
