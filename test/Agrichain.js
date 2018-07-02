
var Agrichain = artifacts.require("./Agrichain.sol");

contract('Agrichain Ethereum Network', function(accounts){

    let listArray = '';
    var producer = accounts[1];
    var distributor = accounts[0];
    let consumerOne = accounts[2];
    let consumerTwo = accounts[3];

    //enum AccountType { PRODUCER, DISTRIBUTOR, CONSUMER }
    //enum CommodityType { POTATO, APPLES, STRAWBERRY, BLUEBERRY, BLUEB, WHEAT, OAT }

    it("Initialized the Agrichain project.", function(){
        return Agrichain.deployed().then(function(instance){
            AgrichainInstance = instance;
            return AgrichainInstance.signup("hum.tum.8765@gmail.com", "Papan Das", "9641443962", "pass", 1, {from:accounts[0]});
        }).then(()=>{
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
        }).then(()=>{
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
        }).then(()=>{
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
        }).then((participantDetail)=>{
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
        })
    })


    it("Create assets.", function(){
        let assetIndexArray = new Array()
        return Agrichain.deployed().then(function(instance){
            AgrichainInstance = instance;
            return AgrichainInstance.postAssets("2018", 0, "100", "999", "9000", "Papan Insurance Coverage", "300000", {from:producer});
        }).then(()=>{
            return AgrichainInstance.postAssets("2017", 1, "200", "888", "8000", "Insurance Papan Coverage", "100", {from:producer});
        }).then(()=>{
            return AgrichainInstance.postAssets("2016", 2, "300", "777", "7000", "Papan Coverage Insurance", "2000", {from:producer});
        }).then(()=>{
            return AgrichainInstance.getAssetsIndex({from:producer});
        }).then((assetItem)=>{
            //console.log(assetItem);
            for (let each in assetItem){
                (function (idx, arr){  
                    assetIndexArray.push(arr[idx].toNumber())
                })(each, assetItem)
            }

            return AgrichainInstance.assets(assetIndexArray[assetIndexArray.length - 1]);
            
        }).then((assetItem)=>{
            //console.log(assetItem);
            assert.equal(assetItem[1], "2016", 'Harvest Year is correct');
            assert.equal(assetItem[3].toNumber(), 0, 'Status is correct');
            return AgrichainInstance.sellToDistributor(distributor, assetIndexArray[assetIndexArray.length - 1], {fron:producer});
        }).then(()=>{
            return AgrichainInstance.assets(assetIndexArray[assetIndexArray.length - 1]);
        }).then((assetItem)=>{
            //console.log(assetItem);
            assert.equal(assetItem[1], "2016", 'Harvest Year is correct');
            assert.equal(assetItem[3].toNumber(), 2, 'Status is correct');
             
        })

    });
});