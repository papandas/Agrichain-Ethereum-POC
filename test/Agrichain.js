
var Agrichain = artifacts.require("./Agrichain.sol");

contract('Agrichain Ethereum Network', function(accounts){

    let listArray = '';

    it("Initialized the Agrichain project.", function(){
        return Agrichain.deployed().then(function(instance){
            AgrichainInstance = instance;
            return AgrichainInstance.address;
        }).then((address)=>{
            console.log(address);
        })
    })
});