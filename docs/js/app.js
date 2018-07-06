App = {
  web3Provider: null,
  profile: {},
  contracts: {},
  account: '0x0',
  loading: false,
  currentState: "0", // 0 is login |
  participantTyle: NaN,
  productListArray: new Array(),

  init: function () {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function () {
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

  initContracts: function () {
    $.getJSON("Agrichain.json", function (agriChain) {
      App.contracts.AgriChain = TruffleContract(agriChain);
      App.contracts.AgriChain.setProvider(App.web3Provider);
      App.contracts.AgriChain.deployed().then(function (agriChain) {
        console.log("Contract Address:", 'https://rinkeby.etherscan.io/address/' + agriChain.address);

      });
      App.listenForEvents();
      return App.render();
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.AgriChain.deployed().then(function (instance) {
      instance.SignUpComplete({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function (error, event) {
        //console.log("event triggered");
        if (App.account == event.args.participants) {
          // My Event Triggered.
          switch (event.event) {
            case "SignUpComplete":
              console.log("--> SignUpComplete Event Triggered");
              App.LoadLoginPage();
              $('#content').show();
              $('#loader').hide();
              break;
          }
        }
      })
    })
  },

  render: function () {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $('#accountAddress').html('<spam>Your Account: <a href="https://rinkeby.etherscan.io/address/' + account + '" target="_blank">' + account + '</a></spam>');
      }
    });

    App.LoadLoginPage();

    /*switch (App.currentState) {
      case "0":
        App.LoadLoginPage();
        break;

      case "1":
        App.LoadHomePage();
        break;

      default:
        App.LoadLoginPage();
        break;

    }*/

    content.show();
    loader.hide();

  },

  LoginUser: function () {

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;
      return AgrichainInstance.participants(App.account);
    }).then((participantDetail) => {
      App.profile = {};
      App.profile.account = participantDetail[0];
      App.profile.email = participantDetail[1];
      App.profile.fullname = participantDetail[2];
      App.profile.cellnumber = participantDetail[3];
      App.profile.type = participantDetail[5].toNumber();

      console.log(App.profile.email);

      if (App.profile.account == App.account && App.profile.email == $('#username').val()) {

        //participantTyle = participantDetail[5].toNumber()
        App.LoadDefaultHomePage();

      } else {
        App.LoadLoginPage();
      }

      $('#content').show();
      $('#loader').hide();

    })
  },

  RegisterUser: function () {

    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    const type = parseInt($('#r_type').find(':selected').val());
    const fullname = $('#r_fullname').val();
    const email = $('#r_email').val();
    const cell = $('#r_cell').val();
    const password = $('#r_password').val();

    //console.log("type", type)

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;
      return AgrichainInstance.participants(App.account);
    }).then((participants) => {
      if (participants[0] == App.account) {
        console.log("Alread exit.");
        //, participants[5].toNumber();
      } else {
        return AgrichainInstance.signup(email, fullname, cell, password, type, {
          from: App.account,
          gas: 500000
        }).then(() => {
          setTimeout(function () {
            App.LoadLoginPage();
            loader.hide();
            content.show();
          }, 2000);
        })
      }
    });
  },

  PostAssets: function () {

    $('#content').hide();
    $('#loader').show();

    const harvers = $('#p_harvest').val();
    const comodity = parseInt($('#p_commodity').find(':selected').val());
    const acres = $('#p_acres').val();
    const _yield = $('#p_yield').val();
    const basic = $('#p_baiss').val();
    const Insurance = $('#p_insurance').val();
    const costs = $('#p_costs').val();

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;
      return AgrichainInstance.postAssets(harvers, comodity, acres, _yield, basic, Insurance, costs, parseInt(_yield), { from: App.account, gas: 5000000 })
        .then((reply) => {
          //console.log(reply);
          $('#content').show();
          $('#loader').hide();
          $('#content').empty();
          $('#content').load('alert-success.html', function () {
            $('#message').html('<strong>Congraluation,</strong> new assets has been successfully created. Your transaction hash <a href="https://rinkeby.etherscan.io/tx/'+reply.tx+'" target="_blank">'+reply.tx+'</a>');
            $('#button').html('<button onclick="App.LoadDefaultHomePage();">Ok</button>');//LoadProducerListPage
          });
        })
        .catch((error) => {
          console.log("error while saving assets", error.message);

          $('#content').show();
          $('#loader').hide();

          //alert(error.message);
        })
    })
  },

  LoadLoginPage: function () {
    $('#content').empty();
    $('#content').load('login.html');
  },

  LoadSignUpPage: function () {
    $('#content').empty();
    $('#content').load('register.html');
  },

  LoadHomePage: function () {
    $('#content').empty();
    $('#content').load('Home-page.html');
  },

  LoadDistributorHomePage: function () {
    $('#content').empty();
    $('#content').load('Home-page-distributor.html');
  },

  LoadCustomerHomePage: function () {
    $('#content').empty();
    $('#content').load('Home-page-customers.html');
  },

  LoadProfileDetailPage: function () {
    $('#content').empty();
    $('#content').load('profile_detail.html', function () {
      $('#profileTitle').html(App.GetAccountTypeName(App.profile.type) + " Profile Detail");
      $('#email').html(App.profile.email);
      $('#fullname').html(App.profile.fullname);
      $('#cellnumber').html(App.profile.cellnumber);
      $('#accountId').html('<a href="https://rinkeby.etherscan.io/address/'+App.account+'"  target="_blank">'+App.account+'</a>')
    });
  },

  LoadDefaultHomePage: function () {
    switch (App.profile.type) {
      case 0:
        App.LoadHomePage();
        //console.log("Is a Producer!")
        break;
      case 1:
        App.LoadDistributorHomePage();
        //console.log("Is a Distributor!")
        break;
      case 2:
        App.LoadCustomerHomePage();
        //console.log("Is a Consumner!")
        break;
    }
  },

  // CONSUMERS or CUSTOMERS  LoadCustomerDetailPage

  LoadCustomerDetailPage: function (param) {
    //console.log('Product Detail of:', param, App.productListArray[param].harvestYear)
    $('#content').empty();
    $('#content').load('customer_detail.html', function () {
      $('#p_harvest').val(App.productListArray[param].harvestYear);
      $('#p_commodity').val(App.productListArray[param].commodity);
      $('#p_acres').val(App.productListArray[param].totalAcer);
      $('#p_yield').val(App.productListArray[param].averageYield);
      $('#p_baiss').val(App.productListArray[param].estimatedBasic);
      $('#p_insurance').val(App.productListArray[param].cropInsuranceCoverage);
      $('#p_costs').val(App.productListArray[param].productCost);
    });
  },

  LoadConsumberListPage: function () {
    $('#content').hide();
    $('#loader').show();
    $('#content').empty();
    $('#content').load('customer-list.html', function () {

      setTimeout(function () {
        // Empty Product list array
        App.productListArray = new Array();

        App.contracts.AgriChain.deployed().then(function (instance) {
          AgrichainInstance = instance;
          return AgrichainInstance.getAssetsIndex({ from: App.account });
        }).then((assetItems) => {

          if (!assetItems.length) {
            $('#content').show();
            $('#loader').hide();
            $('#content').append('No records.');
          }

          let str = '';
          let assetLength = assetItems.length;

          for (let each in assetItems) {
            (function (idx, arr) {
              //console.log(idx, arr[idx].toNumber());
              //assetIndexArray.push(arr[idx].toNumber())

              return AgrichainInstance.assets(arr[idx].toNumber())
                .then((assetItem) => {
                  //console.log("assetitem", assetItem)
                  //console.log(assetItem[2].toNumber())

                  let producerObject = new Object();
                  producerObject._index = arr[idx].toNumber();
                  producerObject.created = assetItem[0].toNumber();
                  producerObject.harvestYear = assetItem[1];
                  producerObject.commodity = App.GetCommodityName(assetItem[2].toNumber());
                  producerObject.status = assetItem[3].toNumber();
                  producerObject.totalAcer = assetItem[4];
                  producerObject.estimatedBasic = assetItem[6];
                  producerObject.cropInsuranceCoverage = assetItem[7];
                  producerObject.productCost = assetItem[8];
                  if (App.profile.type == 2) {
                    return AgrichainInstance.getQtyData(App.account, arr[idx].toNumber())
                      .then((quantity) => {
                        producerObject.averageYield = quantity.toNumber();
                        App.productListArray.push(producerObject);

                        str += '<div class="item item-icon-right">&nbsp;&nbsp;'
                        str += '<a onclick="App.LoadCustomerDetailPage(' + idx + ');" class="year">' + assetItem[1] + '</a>&nbsp;&nbsp;'
                        str += '<a onclick="App.LoadCustomerDetailPage(' + idx + ');" class="product">' + App.GetCommodityName(assetItem[2].toNumber()) + '</a>&nbsp;&nbsp;'
                        str += '<a onclick="App.LoadCustomerDetailPage(' + idx + ');" class="yield">' + quantity.toNumber() + '</a>&nbsp;&nbsp;'
                        str += '</div>'

                        if (assetLength - 1 == idx) {
                          $('#content').append(str);
                          $('#content').show();
                          $('#loader').hide();
                          //console.log("App.productListArray: " , App.productListArray)
                        }
                      })
                  }


                })

            })(each, assetItems)
          }
        }, 1000);
      })
    });
  },

  // DISTRIBUTORS

  SellDistributorToCustomer: function () {
    $('#content').hide();
    $('#loader').show();

    const consumber = $('#s_distributor').find(':selected').val();
    const _index = parseInt($('#s_product_list').find(':selected').val());
    const _conman = $('#s_distributor').find(':selected').text();
    const _itemName = $('#s_product_list').find(':selected').text();
    const quantity = $('#s_quantity').val();

    //console.log("Sell Distributor To Customer: ", consumber, _index);

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;

      return AgrichainInstance.getQtyData(App.account, _index)
        .then((_quantity) => {
          if (parseInt(quantity) <= _quantity.toNumber()) {

            return AgrichainInstance.sellToConsumer(consumber, _index, quantity)
              .then(() => {
                $('#content').show();
                $('#loader').hide();
                $('#content').empty();
                $('#content').load('alert-success.html', function () {
                  $('#message').html("<strong>Success,</strong> " + quantity + " Kg of " + _itemName + " sold to " + _conman);
                  $('#button').html('<button onclick="App.LoadDefaultHomePage();">Ok</button>');
                });

              })

          } else {
            $('#content').show();
            $('#loader').hide();
            $('#content').empty();
            $('#content').load('alert-success.html', function () {
              $('#message').html("<strong>Failed,</strong> Not enought stock available.");
              $('#button').html('<button onclick="App.LoadDefaultHomePage();">Ok</button>');
            });
          }
        })

    })
  },

  LoadTradeDistributorPage: function () {
    $('#content').hide();
    $('#loader').show();
    $('#content').empty();
    $('#content').load('product_distributor_trade.html', function () {
      //s_distributor
      App.contracts.AgriChain.deployed().then(function (instance) {
        AgrichainInstance = instance;
        return AgrichainInstance.getAllConsumers();
      }).then((AllConsumer) => {

        if (!AllConsumer.length) {
          $('#loader').hide();
          $('#content').show();
          $('#content').empty();
          $('#content').load('alert-success.html', function () {
            $('#message').html("<strong>Failed,</strong> no consumers available. Kindly add a consumer into the network.");
            $('#button').html('<button onclick="App.LoadDefaultHomePage();">Ok</button>');
          });
        }

        // LOAD DISTRIBUTORS LIST!
        let length = AllConsumer.length;
        let str = '<select class="form-control prof_right_input">';

        for (let each in AllConsumer) {
          (function (idx, arr) {
            //console.log(arr[idx])

            return AgrichainInstance.participants(arr[idx])
              .then((reply) => {
                //console.log(reply[0]);
                str += '<option value="' + reply[0] + '">' + reply[1] + '</option>';
                if (length - 1 == idx) {
                  str += '</select>';
                  $('#s_distributor').append(str);

                  // LOAD PRODUCT LIST - from Producer 
                  return AgrichainInstance.getAssetsIndex({ from: App.account })
                    .then((assetItems) => {

                      str = '<select class="form-control prof_right_input">';
                      length = assetItems.length;

                      for (let _each in assetItems) {
                        (function (_idx, _arr) {
                          // Getting each assets for BC.
                          return AgrichainInstance.assets(_arr[_idx].toNumber())
                            .then((assetItem) => {
                              //console.log(assetItem);
                              str += '<option value="' + _arr[_idx].toNumber() + '">';
                              str += App.GetCommodityName(assetItem[2].toNumber()) + '</option>';
                              //'' + assetItem[1] + ' - ' + + ' - ' + assetItem[5] 
                              if (length - 1 == _idx) {

                                str += '</select>';
                                $('#s_product_list').append(str);
                                $('#content').show();
                                $('#loader').hide();
                              }
                            })
                        })(_each, assetItems);
                      }
                    })
                }
              })
          })(each, AllConsumer);
        }
      })
    });
  },

  LoadDistributorDetailPage: function (param) {
    //console.log('Product Detail of:', param, App.productListArray[param].harvestYear)
    $('#content').empty();
    $('#content').load('distributor_detail.html', function () {
      $('#p_harvest').val(App.productListArray[param].harvestYear);
      $('#p_commodity').val(App.productListArray[param].commodity);
      $('#p_acres').val(App.productListArray[param].totalAcer);
      $('#p_yield').val(App.productListArray[param].averageYield);
      $('#p_baiss').val(App.productListArray[param].estimatedBasic);
      $('#p_insurance').val(App.productListArray[param].cropInsuranceCoverage);
      $('#p_costs').val(App.productListArray[param].productCost);
    });
  },

  LoadDistributorListPage: function () {
    $('#content').hide();
    $('#loader').show();
    $('#content').empty();
    $('#content').load('distributor-list.html', function () {

      setTimeout(function () {
        // Empty Product list array
        App.productListArray = new Array();

        App.contracts.AgriChain.deployed().then(function (instance) {
          AgrichainInstance = instance;
          return AgrichainInstance.getAssetsIndex({ from: App.account });
        }).then((assetItems) => {
          //console.log("AssetIndex", assetItems)


          if (!assetItems.length) {
            $('#content').show();
            $('#loader').hide();
            $('#content').append('No records.');
          }

          let str = '';
          let assetLength = assetItems.length;

          for (let each in assetItems) {
            (function (idx, arr) {
              //console.log(idx, arr[idx].toNumber());
              //assetIndexArray.push(arr[idx].toNumber())

              return AgrichainInstance.assets(arr[idx].toNumber())
                .then((assetItem) => {
                  //console.log("assetitem", assetItem)
                  //console.log(assetItem[2].toNumber())

                  let producerObject = new Object();
                  producerObject._index = arr[idx].toNumber();
                  producerObject.created = assetItem[0].toNumber();
                  producerObject.harvestYear = assetItem[1];
                  producerObject.commodity = App.GetCommodityName(assetItem[2].toNumber());
                  producerObject.status = assetItem[3].toNumber();
                  producerObject.totalAcer = assetItem[4];
                  producerObject.estimatedBasic = assetItem[6];
                  producerObject.cropInsuranceCoverage = assetItem[7];
                  producerObject.productCost = assetItem[8];
                  App.productListArray.push(producerObject);

                  if (App.profile.type == 1) {
                    return AgrichainInstance.getQtyData(App.account, arr[idx].toNumber())
                      .then((quantity) => {
                        //console.log(arr[idx].toNumber(), quantity)
                        producerObject.averageYield = quantity.toNumber();
                        App.productListArray.push(producerObject);

                        str += '<div class="item item-icon-right">&nbsp;&nbsp;'
                        str += '<a onclick="App.LoadDistributorDetailPage(' + idx + ');" class="year">' + assetItem[1] + '</a>&nbsp;&nbsp;';
                        str += '<a onclick="App.LoadDistributorDetailPage(' + idx + ');" class="product">' + App.GetCommodityName(assetItem[2].toNumber()) + '</a>&nbsp;&nbsp;';
                        str += '<a onclick="App.LoadDistributorDetailPage(' + idx + ');" class="yield">' + quantity.toNumber() + '</a>&nbsp;&nbsp;';
                        str += '</div>'

                        if (assetLength - 1 == idx) {
                          $('#content').append(str);
                          $('#content').show();
                          $('#loader').hide();
                          //console.log("App.productListArray: " , App.productListArray)
                        }
                      })
                  }


                })

            })(each, assetItems)
          }
        }, 1000);
      })
    });
  },

  // PRODUCERS

  LoadProducerListPage: function () {
    $('#content').hide();
    $('#loader').show();
    $('#content').empty();
    $('#content').load('producer-list.html', function () {

      setTimeout(function () {
        // Empty Product list array
        App.productListArray = new Array();

        App.contracts.AgriChain.deployed().then(function (instance) {
          AgrichainInstance = instance;
          return AgrichainInstance.getAssetsIndex({ from: App.account });
        }).then((assetItems) => {
          //console.log(App.GetAccountTypeName(App.profile.type), "Asset Index List", assetItems)

          //let assetIndexArray = new Array();
          if (!assetItems.length) {
            $('#content').show();
            $('#loader').hide();
            $('#content').append('No records.');
          }

          let str = '';
          let assetLength = assetItems.length;

          for (let each in assetItems) {
            (function (idx, arr) {
              //console.log(idx, arr[idx].toNumber());
              //assetIndexArray.push(arr[idx].toNumber())

              return AgrichainInstance.assets(arr[idx].toNumber())
                .then((assetItem) => {
                  //console.log("assetitem", assetItem)
                  //console.log(assetItem[2].toNumber())

                  let producerObject = new Object();
                  producerObject._index = arr[idx].toNumber();
                  producerObject.created = assetItem[0].toNumber();
                  producerObject.harvestYear = assetItem[1];
                  producerObject.commodity = App.GetCommodityName(assetItem[2].toNumber());
                  producerObject.status = assetItem[3].toNumber();
                  producerObject.totalAcer = assetItem[4];
                  
                  producerObject.estimatedBasic = assetItem[6];
                  producerObject.cropInsuranceCoverage = assetItem[7];
                  producerObject.productCost = assetItem[8];

                  if (App.profile.type == 0) {
                    return AgrichainInstance.quantitys(arr[idx].toNumber())
                      .then((quantity) => {
                        //console.log(arr[idx].toNumber(), quantity)
                        producerObject.averageYieldTotal = quantity[0].toNumber();
                        producerObject.averageYield = quantity[1].toNumber();
                        App.productListArray.push(producerObject);

                        str += '<div class="item item-icon-right">&nbsp;&nbsp;'
                        str += '<a onclick="App.LoadProducerDetailPage(' + idx + ');" class="year">' + assetItem[1] + '</a>&nbsp;&nbsp;';
                        str += '<a onclick="App.LoadProducerDetailPage(' + idx + ');" class="product">' + App.GetCommodityName(assetItem[2].toNumber()) + '</a>&nbsp;&nbsp;';
                        str += '<a onclick="App.LoadProducerDetailPage(' + idx + ');" class="yield">' + quantity[1].toNumber() + '</a>&nbsp;&nbsp;';
                        str += '</div>'

                        if (assetLength - 1 == idx) {
                          $('#content').append(str);
                          $('#content').show();
                          $('#loader').hide();
                          //console.log("App.productListArray: " , App.productListArray)
                        }

                      })
                  }









                })

            })(each, assetItems)
          }
        }, 1000);
      })
    });
  },

  LoadProducerDetailPage: function (param) {
    console.log('Product Detail of:', param, App.productListArray[param].harvestYear)
    $('#content').empty();
    $('#content').load('product_detail.html', function () {
      $('#p_harvest').val(App.productListArray[param].harvestYear);
      $('#p_commodity').val(App.productListArray[param].commodity);
      $('#p_acres').val(App.productListArray[param].totalAcer);
      $('#p_yield_total').val(App.productListArray[param].averageYieldTotal);
      $('#p_yield').val(App.productListArray[param].averageYield);
      $('#p_baiss').val(App.productListArray[param].estimatedBasic);
      $('#p_insurance').val(App.productListArray[param].cropInsuranceCoverage);
      $('#p_costs').val(App.productListArray[param].productCost);
    });
  },

  LoadTradeProducerPage: function () {
    $('#content').hide();
    $('#loader').show();
    $('#content').empty();
    $('#content').load('product_producer_trade.html', function () {
      //s_distributor
      App.contracts.AgriChain.deployed().then(function (instance) {
        AgrichainInstance = instance;
        return AgrichainInstance.getAllDistributors();
      }).then((AllDistributors) => {

        if (!AllDistributors.length) {
          $('#loader').hide();
          $('#content').show();
          $('#content').empty();
          $('#content').load('alert-success.html', function () {
            $('#message').html("<strong>Failed,</strong> no distributors available. Kindly add a distributor into the network.");
            $('#button').html('<button onclick="App.LoadDefaultHomePage();">Ok</button>');
          });
        }

        // LOAD DISTRIBUTORS LIST!
        let length = AllDistributors.length;
        let str = '<select class="form-control prof_right_input">';

        for (let each in AllDistributors) {
          (function (idx, arr) {
            //console.log(arr[idx])

            return AgrichainInstance.participants(arr[idx])
              .then((reply) => {
                //console.log(reply[0]);
                str += '<option value="' + reply[0] + '">' + reply[1] + '</option>';

                // When the Participants List is Over.
                if (length - 1 == idx) {
                  str += '</select>';
                  $('#s_distributor').append(str);

                  // LOAD PRODUCT LIST - from Producer 
                  return AgrichainInstance.getAssetsIndex({ from: App.account })
                    .then((assetItems) => {

                      str = '<select class="form-control prof_right_input">';
                      length = assetItems.length;

                      for (let _each in assetItems) {
                        (function (_idx, _arr) {
                          // Getting each assets for BC.
                          return AgrichainInstance.assets(_arr[_idx].toNumber())
                            .then((assetItem) => {
                              //console.log(assetItem);
                              str += '<option value="' + _arr[_idx].toNumber() + '">';
                              str += assetItem[1] + '-';
                              str += App.GetCommodityName(assetItem[2].toNumber()) + '</option>';
                              //'' + assetItem[1] + ' - ' + + ' - ' + assetItem[5] 
                              if (length - 1 == _idx) {

                                str += '</select>';
                                $('#s_product_list').append(str);
                                $('#content').show();
                                $('#loader').hide();
                              }
                            })
                        })(_each, assetItems);
                      }
                    })
                }
              })
          })(each, AllDistributors);
        }
      })
    });
  },

  LoadProductProducerPage: function () {
    $('#content').empty();
    $('#content').load('product_producer.html');
  },

  SellProductToDistributor: function () {
    $('#content').hide();
    $('#loader').show();

    const distributor = $('#s_distributor').find(':selected').val();
    const _index = parseInt($('#s_product_list').find(':selected').val());
    const _distname = $('#s_distributor').find(':selected').text();
    const _itemName = $('#s_product_list').find(':selected').text();
    const quantity = $('#s_quantity').val();

    //console.log(distributor, _distname, _itemName, _index, quantity);

    App.contracts.AgriChain.deployed().then(function (instance) {
      AgrichainInstance = instance;

      return AgrichainInstance.quantitys(_index)
        .then((_quantity) => {
          if (parseInt(quantity) <= _quantity[1].toNumber()) {
            return AgrichainInstance.sellToDistributor(distributor, _index, quantity)
              .then(() => {
                $('#content').show();
                $('#loader').hide();
                $('#content').empty();
                $('#content').load('alert-success.html', function () {
                  $('#message').html("<strong>Success,</strong> " + quantity + " Kg of " + _itemName + " sold to " + _distname);
                  $('#button').html('<button onclick="App.LoadDefaultHomePage();">Ok</button>');
                });
              })
          } else {
            $('#content').show();
            $('#loader').hide();
            $('#content').empty();
            $('#content').load('alert-success.html', function () {
              $('#message').html("<strong>Failed,</strong> Not enought stock available.");
              $('#button').html('<button onclick="App.LoadDefaultHomePage();">Ok</button>');
            });
          }
        })

    })
  },

  GetAccountTypeName: function (param) {
    let str = '';
    switch (param) {
      case 0:
        str = 'Producer';
        break;
      case 1:
        str = 'Distributor';
        break;
      case 2:
        str = 'Consumer';
        break;
      default:
        break;
    }
    return str;
  },

  GetCommodityName: function (param) {
    //POTATO, APPLES, , , , , 
    //console.log(param, typeof(param));
    let str = '';
    switch (param) {
      case 0:
        str = "POTATO";
        break;

      case 1:
        str = "APPLES";
        break;

      case 2:
        str = "STRAWBERRY";
        break;

      case 3:
        str = "BLUEBERRY";
        break;

      case 4:
        str = "BLUEB";
        break;

      case 5:
        str = "WHEAT";
        break;

      case 6:
        str = "OAT";
        break;

      default:
        str = "";
        break;
    }
    return str;
  },
}

$(function () {
  $(window).load(function () {
    App.init();
  })
});
