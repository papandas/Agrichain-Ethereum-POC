
var Agrichain = artifacts.require("./Agrichain.sol");
//var Web3 = require('../src/js/web3.min.js');
var Web3 = require('web3');

contract('Agrichain Ethereum POC', function (accounts) {

    let web3Provider = null;

    var url = new Web3.providers.HttpProvider('http://localhost:7545');
    var web3 = new Web3(url);

    let listArray = '';
    const producerOne = accounts[0];
    const producerTwo = accounts[1];
    const distributorOne = accounts[2];
    const distributorTwo = accounts[3];
    const consumerOne = accounts[4];
    const consumerTwo = accounts[5];
    const consumerThree = accounts[6];

    //enum AccountType { PRODUCER, DISTRIBUTOR, CONSUMER }
    //enum CommodityType { POTATO, APPLES, STRAWBERRY, BLUEBERRY, BLUEB, WHEAT, OAT }

    it("Sign-Up Accounts.", function () {
        return Agrichain.deployed().then(function (instance) {
            AgrichainInstance = instance;
            return AgrichainInstance.signup("pro1@gmail.com", "Producer One", "00000000", "password", 0, { from: producerOne });
        }).then((receipt) => {
            return AgrichainInstance.signup("pro2@gmail.com", "Producer Two", "00000000", "password", 0, { from: producerTwo });
        }).then((receipt) => {
            return AgrichainInstance.signup("dis1@gmail.com", "Distributor One", "00000000", "password", 1, { from: distributorOne });
        }).then((receipt) => {
            return AgrichainInstance.signup("dis2@gmail.com", "Distributor Two", "00000000", "password", 1, { from: distributorTwo });
        }).then((receipt) => {
            return AgrichainInstance.signup("con1@gmail.com", "Consumer One", "00000000", "password", 2, { from: consumerOne });
        }).then((receipt) => {
            return AgrichainInstance.signup("con2@gmail.com", "Consumer Two", "00000000", "password", 2, { from: consumerTwo });
        }).then((receipt) => {
            return AgrichainInstance.signup("con3@gmail.com", "Consumer Three", "00000000", "password", 2, { from: consumerThree });
        }).then(() => {
            return AgrichainInstance.getAllProducers();
        }).then((producers) => {
            //console.log("Producers: ", producers)
            assert.equal(producers[0], producerOne, 'Account Number is correct');
            assert.equal(producers[1], producerTwo, 'Account Number is correct');
            return AgrichainInstance.getAllDistributors();
        }).then((distributors) => {
            //console.log("Distributors: ", distributors)
            assert.equal(distributors[0], distributorOne, 'Account Number is correct');
            assert.equal(distributors[1], distributorTwo, 'Account Number is correct');
            return AgrichainInstance.getAllConsumers();
        }).then((consumers) => {
            //console.log("Consumers: ", consumers)
            assert.equal(consumers[0], consumerOne, 'Account Number is correct');
            assert.equal(consumers[1], consumerTwo, 'Account Number is correct');
            assert.equal(consumers[2], consumerThree, 'Account Number is correct');
        })
    });


    it("Create/Post Assets.", function () {
        return Agrichain.deployed().then(function (instance) {
            AgrichainInstance = instance;
            return AgrichainInstance.PostAssets("2018", 0, "100", "111", "10", "Papan Insurance Coverage", "100000", 1000, "0.009", { from: producerOne });
        }).then(()=>{
            return AgrichainInstance.PostAssets("2017", 1, "200", "222", "20", "Insurance Papan Coverage", "200000", 2000, "0.0019", { from: producerTwo });
        }).then(()=>{
            return AgrichainInstance.PostAssets("2016", 2, "300", "333", "30", "Insurance Coverage Papan", "300000", 3000, "0.0029", { from: producerOne });
        }).then(()=>{
            return AgrichainInstance.PostAssets("2017", 3, "400", "444", "40", "Coverage Papan Insurance", "400000", 4000, "0.0039", { from: producerTwo });
        }).then((reply) => {
            /*web3.eth.getBalance(producerOne, (err, bal) => {
                if (err === null) {
                    balance = bal
                    console.log(web3.utils.fromWei(balance, 'ether'));
                }else{
                    console.log(error.message);
                }
            });*/
        })
    })

    // Create Order

    it("Create order.", function () {
        return Agrichain.deployed().then(function (instance) {
            AgrichainInstance = instance;
            // producer address, asset id, quantity, grant price
            return AgrichainInstance.CreateOrder(producerOne, 1, 300, 300 * 0.009, {from:distributorOne});
        }).then((receipt)=>{
            return AgrichainInstance.CreateOrder(producerTwo, 2, 123, 123 * 0.0019, {from:distributorOne});
        }).then(()=>{
            return AgrichainInstance.CreateOrder(producerOne, 3, 30, 30 * 0.0029, {from:distributorTwo});
        }).then((receipt)=>{
            return AgrichainInstance.CreateOrder(producerTwo, 4, 30, 40 * 0.0039, {from:distributorOne});
        })
    })

    // Update Order
    // enum OrderStatus { CREATED, IN_TRANSIT, RECEIVED, SELLING, SOLDOUT }
    // enum OrderReplyStatus { NOACTION, ACCEPT, REJECT, PAYMENT }

    it("Update Order by Producer.", function () {
        return Agrichain.deployed().then(function (instance) {
            AgrichainInstance = instance;
            // Order id, Order State, Order Reply Status, Delivery time
            return AgrichainInstance.UpdateOrder(1, 1, 1, 1, {from:producerOne});
        }).then((receipt)=>{
            // Reject the request
            return AgrichainInstance.UpdateOrder(2, 1, 2, 1, {from:producerTwo});
        }).then((receipt)=>{
            return AgrichainInstance.UpdateOrder(3, 1, 1, 1, {from:producerOne});
        }).then((receipt)=>{
            return AgrichainInstance.UpdateOrder(4, 1, 1, 1, {from:producerTwo});
        }).then((receipt)=>{

        })

    })



    it("Distributor Purchase transfer funds.", function () {
        let price = 0;
        return Agrichain.deployed().then(function (instance) {
            AgrichainInstance = instance;
            // producer, order id
            return AgrichainInstance.orders(1);
        }).then((reply)=>{
            //console.log("Hit 1");
            price = web3.utils.toWei(String(reply[6].toNumber()), 'ether')
            return AgrichainInstance.DistributorPurchase(producerOne, 1, {from:distributorOne, value:price});
        }).then((receipt)=>{
            //console.log("Hit 2");
            return AgrichainInstance.orders(2);
        }).then((reply)=>{
            //console.log("Hit 3");
            price = web3.utils.toWei(String(reply[6].toNumber()), 'ether')
            return AgrichainInstance.DistributorPurchase(producerTwo, 2, {from:distributorOne, value:price});
        }).then(assert.fail).catch(function (error) {
            //console.log("Hit 4");
            assert(error.message.indexOf("revert") >= 0, "this order was rejected.");
            return AgrichainInstance.orders(3);
        }).then((reply)=>{
            //console.log(reply);
            price = web3.utils.toWei(String(reply[6].toNumber()), 'ether')
            return AgrichainInstance.DistributorPurchase(producerOne, 3, {from:distributorTwo, value:price});
        }).then((receipt)=>{
            //console.log("Hit 6");
            return AgrichainInstance.orders(4);
        }).then((reply)=>{
            //console.log("Hit 7");
            price = web3.utils.toWei(String(reply[6].toNumber()), 'ether')
            return AgrichainInstance.DistributorPurchase(producerTwo, 4, {from:distributorOne, value:price});
        }).then((reply)=>{
            //console.log("Hit 8");
        })

    })

    it("Consumer Purchase & transfer funds.", function () {
        let sellPrice = 0;
        let grandTotal = 0;
        return Agrichain.deployed().then(function (instance) {
            AgrichainInstance = instance;
            // producer, order id
            return AgrichainInstance.quantitys(1);
        }).then((quantity)=>{
            sellPrice = parseFloat(quantity[2]);
            console.log(sellPrice);
            return AgrichainInstance.getQtyData(distributorOne, 1);
        }).then((reply)=>{
            grandTotal = web3.utils.toWei(String(reply.toNumber() * sellPrice), 'ether')
            console.log(grandTotal);
            return AgrichainInstance.ConsumerPurchase(distributorOne, 1, reply.toNumber(), {from:consumerOne, value:grandTotal});
        }).then((receipt)=>{
            //console.log(receipt.tx);
            return AgrichainInstance.quantitys(3);
        }).then((quantity)=>{
            sellPrice = parseFloat(quantity[2]);
            console.log(sellPrice);
            return AgrichainInstance.getQtyData(distributorTwo, 3);
        }).then((reply)=>{
            grandTotal = web3.utils.toWei(String(reply.toNumber() * sellPrice), 'ether')
            console.log(grandTotal);
            return AgrichainInstance.ConsumerPurchase(distributorTwo, 3, reply.toNumber(), {from:consumerTwo, value:grandTotal});
        }).then((receipt)=>{
            console.log(receipt.tx);
            //return AgrichainInstance.ConsumerPurchase(distributorOne, 1, 1, {from:consumerOne, value:grandTotal});
        })

    })

});

/*

.then(()=>{
            
        })
*/