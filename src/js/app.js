App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("Agrichain.json", function(agriChain) {
      App.contracts.AgriChain = TruffleContract(agriChain);
      App.contracts.AgriChain.setProvider(App.web3Provider);
      App.contracts.AgriChain.deployed().then(function(agriChain) {
        console.log("Contract Address:", agriChain.address);
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        console.log("Account: "+account);
        $('#accountAddress').html('Your Account: ' + account);
      }
    });

    App.LoadLoginPage();

    content.show();
    loader.hide();

  },

  LoadLoginPage: function(){
    $('#content').empty();
    $('#content').load('login.html', function(){
      console.log("Page Loading Done!")
      $('#content').append('<h1>Extra Loadin</h1>')
    });
  },

  LoadSignUpPage: function(){
    $('#content').empty();
    $('#content').load('register.html');
  },

  LoadHomePage: function(){
    $('#content').empty();
    $('#content').load('Home-page.html');
  },

  LoadProducerListPage: function(){
    $('#content').empty();
    $('#content').load('producer-list.html');
  },
  
  LoadProductProducerPage: function(){
    $('#content').empty();
    $('#content').load('product_producer.html');
  },
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});
