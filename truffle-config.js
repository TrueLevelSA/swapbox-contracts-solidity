
// Make root available to future scripts.
// https://stackoverflow.com/a/18721515/
process.env.NODE_PATH = __dirname + '/'

module.exports = {
  // Uncommenting the defaults below
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!

  networks: {
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*",
      gas: 4525090,
    },
    test: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*"
    }
  }

};
