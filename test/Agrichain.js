
var Agrichain = artifacts.require("./Agrichain.sol");

contract('Agrichain Ethereum Network', function(accounts){

    let listArray = '';
    const producer = "0x2d62771cb1bbb9fc81289276014b76954a57b648";//accounts[1];
    const producerTwo = accounts[6];
    const distributor = "0x1f9C6bBa334f5b231B9285fa812052257A20D914";//accounts[0];
    const distributorTwo = distributor;//accounts[5];
    const consumerOne = "0xaE0ba611603Ec52104c9aB52deDA584806BBEc14";//accounts[2];
    const consumerTwo = consumerOne;//accounts[3];
    const consumerThree = consumerOne;//accounts[4];

    //enum AccountType { PRODUCER, DISTRIBUTOR, CONSUMER }
    //enum CommodityType { POTATO, APPLES, STRAWBERRY, BLUEBERRY, BLUEB, WHEAT, OAT }

    it("Initialized the Agrichain project.", function(){
        return Agrichain.deployed().then(function(instance){
            AgrichainInstance = instance;
            return AgrichainInstance.signup("hum.tum.8765@gmail.com", "Papan Das", "9641443962", "pass", 1, {from:accounts[0]});
        }).then((receipt)=>{
            
            assert.equal(receipt.logs.length, 1, "Signup event was triggered");
            assert.equal(receipt.logs[0].event, "SignUpComplete", "the event type is correct");
            assert.equal(receipt.logs[0].args.participants, accounts[0], "checking from correct Account");           

            return AgrichainInstance.participants(accounts[0]);
        }).then((participantDetail)=>{
            //console.log(participantDetail);
            assert.equal(participantDetail[0], accounts[0], 'Account Number is correct');
            assert.equal(participantDetail[1], "hum.tum.8765@gmail.com", 'Email is correct');
            assert.equal(participantDetail[2], "Papan Das", 'Fullname is correct');
            assert.equal(participantDetail[3], "9641443962", 'Cellnumber is correct');
            assert.equal(participantDetail[4], "pass", 'Password is correct');
            assert.equal(participantDetail[5].toNumber(), 1, 'Account Type is correct');
            return AgrichainInstance.signup("hum.tum.8765@gmail.com", "Papan Das", "9641443962", "pass", 1, {from:accounts[0]});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            
            ///////////////////////
            return AgrichainInstance.signup("producer@ac.com", "Producer One", "1111", "pass", 0, {from:accounts[1]});
        }).then((receipt)=>{
            assert.equal(receipt.logs.length, 1, "Signup event was triggered");
            assert.equal(receipt.logs[0].event, "SignUpComplete", "the event type is correct");
            assert.equal(receipt.logs[0].args.participants, accounts[1], "checking from correct Account");

            return AgrichainInstance.participants(accounts[1]);
        }).then((participantDetail)=>{
            //console.log(participantDetail);
            assert.equal(participantDetail[0], accounts[1], 'Account Number is correct');
            assert.equal(participantDetail[1], "producer@ac.com", 'Email is correct');
            assert.equal(participantDetail[2], "Producer One", 'Fullname is correct');
            assert.equal(participantDetail[3], "1111", 'Cellnumber is correct');
            assert.equal(participantDetail[4], "pass", 'Password is correct');
            assert.equal(participantDetail[5].toNumber(), 0, 'Account Type is correct');
            // Try again to save the same profile
            return AgrichainInstance.signup("producer@ac.com", "Producer One", "1111", "pass", 0, {from:accounts[1]});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            ////////////////////
            return AgrichainInstance.signup("customer@ac.com", "Customer One", "1111", "pass", 2, {from:accounts[2]});
        }).then((receipt)=>{
            assert.equal(receipt.logs.length, 1, "Signup event was triggered");
            assert.equal(receipt.logs[0].event, "SignUpComplete", "the event type is correct");
            assert.equal(receipt.logs[0].args.participants, accounts[2], "checking from correct Account");

            return AgrichainInstance.participants(accounts[2]);
        }).then((participantDetail)=>{
            //console.log(participantDetail);
            assert.equal(participantDetail[0], accounts[2], 'Account Number is correct');
            assert.equal(participantDetail[1], "customer@ac.com", 'Email is correct');
            assert.equal(participantDetail[2], "Customer One", 'Fullname is correct');
            assert.equal(participantDetail[3], "1111", 'Cellnumber is correct');
            assert.equal(participantDetail[4], "pass", 'Password is correct');
            assert.equal(participantDetail[5].toNumber(), 2, 'Account Type is correct');
            return AgrichainInstance.signup("customer@ac.com", "Customer One", "1111", "pass", 2, {from:accounts[2]});
        }).then(assert.fail).catch(function(error){
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            //Try get a fresh account detail
            return AgrichainInstance.participants(accounts[3]);
        }).then((reply)=>{
            // Save a fresh acocunt / Sign up a fresh account.
            return AgrichainInstance.signup("customer2@ac.com", "Customer Two", "1111", "pass", 2, {from:accounts[3]});
        }).then((receipt)=>{
            assert.equal(receipt.logs.length, 1, "Signup event was triggered");
            assert.equal(receipt.logs[0].event, "SignUpComplete", "the event type is correct");
            assert.equal(receipt.logs[0].args.participants, accounts[3], "checking from correct Account");
            // Check a fresh copy 
            return AgrichainInstance.participants(accounts[3]);
        }).then((participantDetail)=>{
            //console.log(participantDetail, accounts[3]);
            assert.equal(participantDetail[0], accounts[3], 'Account Number is correct');
            assert.equal(participantDetail[1], "customer2@ac.com", 'Email is correct');
            assert.equal(participantDetail[2], "Customer Two", 'Fullname is correct');
            assert.equal(participantDetail[3], "1111", 'Cellnumber is correct');
            assert.equal(participantDetail[4], "pass", 'Password is correct');
            assert.equal(participantDetail[5].toNumber(), 2, 'Account Type is correct');

            return AgrichainInstance.signup("distributor two", "Papan Das", "9641443962", "pass", 1, {from:distributorTwo});
        }).then(()=>{

            return AgrichainInstance.getAllProducers();
        }).then((producers)=>{
            //console.log("Producers: ", producers)
            return AgrichainInstance.getAllDistributors();
        }).then((distributors)=>{
            //console.log("Distributors: ", distributors)
            return AgrichainInstance.getAllConsumers();
        }).then((consumers)=>{
            //console.log("Consumers: ", consumers)
        })
    })


    it("Create assets.", function(){
        let assetIndexArray = new Array()
        let correntAssetIndex = 0;
        return Agrichain.deployed().then(function(instance){
            AgrichainInstance = instance;
            return AgrichainInstance.postAssets("2018", 0, "100", "999", "9000", "Papan Insurance Coverage", "300000", 1000, {from:producer});
        }).then(()=>{
            return AgrichainInstance.postAssets("2017", 1, "200", "888", "8000", "Insurance Papan Coverage", "100", 2000, {from:producer});
        }).then(()=>{
            return AgrichainInstance.postAssets("2016", 2, "300", "777", "7000", "Papan Coverage Insurance", "2000", 3000, {from:producer});
        }).then(()=>{
            return AgrichainInstance.getAssetsIndex({from:producer});
        }).then((assetItem)=>{
            //console.log(assetItem);
            for (let each in assetItem){
                (function (idx, arr){  
                    assetIndexArray.push(arr[idx].toNumber())
                })(each, assetItem)
            }

            for(let each in assetIndexArray){
                (function(idx, arr){
                    return AgrichainInstance.assets(arr[idx])
                    .then((assertItem)=>{
                        //console.log(arr[idx], assertItem);
                    });
                })(each, assetIndexArray)
            }

            return AgrichainInstance.assets(assetIndexArray[assetIndexArray.length - 1]);
            
        }).then((assetItem)=>{
            
            assert.equal(assetItem[1], "2016", 'Harvest Year is correct');
            assert.equal(assetItem[3].toNumber(), 0, 'Status is correct');
            return AgrichainInstance.sellToDistributor(distributor, assetIndexArray[assetIndexArray.length - 1], 500, {from:producer});
        }).then(()=>{
            
            return AgrichainInstance.assets(assetIndexArray[assetIndexArray.length - 1]);
        }).then((assetItem)=>{
           // check the contract / assert
            assert.equal(assetItem[1], "2016", 'Harvest Year is correct');
            assert.equal(assetItem[3].toNumber(), 2, 'Status is correct');

            // Get Quantity
            return AgrichainInstance.quantitys(assetIndexArray[assetIndexArray.length - 1]);

        }).then((quantitys)=>{
            //console.log("Qty ", quantitys);
            // Get Quantity By Address
            assert.equal(quantitys[0].toNumber(), 3000, 'Total quantity available with assert/contract.');
            assert.equal(quantitys[1].toNumber(), 2500, 'Total quantity available with producer after selling to distributor.');
            return AgrichainInstance.getQtyData(distributor, assetIndexArray[assetIndexArray.length - 1]);
        }).then((quantitys)=>{
            //console.log("Distributor has", quantitys.toNumber(), "Quantity"); 
            assert.equal(quantitys.toNumber(), 500, 'Total quantity sold to distributor by produver.');
            //console.log("Selling" , assetIndexArray[assetIndexArray.length - 1] , "to customer 300 units")
            
            return AgrichainInstance.sellToConsumer(consumerOne, assetIndexArray[assetIndexArray.length - 1], 300, {from:distributor});
        }).then(()=>{
            //console.log("GEt ... ")
            return AgrichainInstance.getAssetsIndex({from:consumerOne});
        }).then((consumerOneItems)=>{
            console.log("Hit -3")
            assert.equal(consumerOneItems[0].toNumber(), 3, 'Checking consumber assert Index number.');

            // GEt quantity count
            return AgrichainInstance.quantitys(assetIndexArray[assetIndexArray.length - 1]);
        }).then((quantity)=>{
            console.log("Hit -2")
            assert.equal(quantity[1].toNumber(), 2500, 'Stock available with Producer');
            return AgrichainInstance.getQtyData(distributor, assetIndexArray[assetIndexArray.length - 1]);
        }).then((quantity)=>{
            console.log("Hit -1")
            assert.equal(quantity.toNumber(), 200, 'Stock available with Distributor');
            return AgrichainInstance.getQtyData(consumerOne, assetIndexArray[assetIndexArray.length - 1]);
        }).then((quantity)=>{
            assert.equal(quantity.toNumber(), 300, 'Stock available with Consumber.');
            console.log("Hit 0")
            // Chcek asset 2 exist
            return AgrichainInstance.assets(assetIndexArray[assetIndexArray.length - 2]);
        }).then((assets)=>{
            //console.log(assets)
            // Sell assert to Distributor two by producer
            return AgrichainInstance.sellToDistributor(distributorTwo, assetIndexArray[assetIndexArray.length - 2], 500, {from:producer});
        }).then(()=>{
            console.log("Hit 1")
            // sell to consumer two by distributor two
            return AgrichainInstance.sellToConsumer(consumerTwo, assetIndexArray[assetIndexArray.length - 2], 250, {from:distributorTwo});
        }).then(()=>{
            console.log("Hit 2")
            // sell to consumer three by distributor one
            return AgrichainInstance.sellToConsumer(consumerTwo, assetIndexArray[assetIndexArray.length - 1], 150, {from:distributor});
        }).then(()=>{
            console.log("Hit 3")
            return AgrichainInstance.quantitys(assetIndexArray[assetIndexArray.length - 1]);
        }).then((quantity)=>{
            console.log("Hit 4")
            assert.equal(quantity[1].toNumber(), 2500, 'Stock available with Producer for assert 1');
            return AgrichainInstance.quantitys(assetIndexArray[assetIndexArray.length - 2]);
        }).then((quantity)=>{
            assert.equal(quantity[1].toNumber(), 1500, 'Stock available with Producer for assert 2');
            return AgrichainInstance.getQtyData(distributor, assetIndexArray[assetIndexArray.length - 1]);
        }).then((quantity)=>{
            console.log("Hit 5")
            assert.equal(quantity.toNumber(), 50, 'Stock available with Distributor One for assert 2');
            return AgrichainInstance.getQtyData(distributorTwo, assetIndexArray[assetIndexArray.length - 2]);
        }).then((quantity)=>{
            console.log("Hit 6")
            assert.equal(quantity.toNumber(), 250, 'Stock available with Distributor Two');
            return AgrichainInstance.getQtyData(consumerTwo, assetIndexArray[assetIndexArray.length - 1]);
        }).then((quantity)=>{
            console.log("Hit 7")
            assert.equal(quantity.toNumber(), 150, 'Stock available with Customer Two from Assert 1');
            return AgrichainInstance.getQtyData(consumerTwo, assetIndexArray[assetIndexArray.length - 2]);
        }).then((quantity)=>{
            console.log("Hit 8")
            assert.equal(quantity.toNumber(), 250, 'Stock available with Customer Two from Assert 2');
            return AgrichainInstance.getAssetsIndex({from:consumerOne});
        }).then((index)=>{
            console.log(index);
            return AgrichainInstance.getAssetsIndex({from:consumerTwo});
        }).then((index)=>{
            console.log(index);
        })

    });
});

/*

.then(()=>{
            
        })
*/