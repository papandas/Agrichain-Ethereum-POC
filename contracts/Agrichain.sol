pragma solidity ^0.4.23;

/* TODO: decentralized neuroscience */


contract Agrichain {

    
    enum AccountType { PRODUCER, DISTRIBUTOR, CONSUMER }
    enum CommodityType { POTATO, APPLES, STRAWBERRY, BLUEBERRY, BLUEB, WHEAT, OAT }
    enum AssetStatus { CREATED, IN_TRANSIT, SELLING, SOLD }

    struct ParticipantDetail {
        address client;
        string email;
        string fullname;
        string cellnumber;
        string password;
        AccountType accountType;
    }

    struct Asset {
        uint256 created;
        string harvestYear;
        CommodityType commodity;
        AssetStatus status;
        string totalAcer;
        string averageYield;
        string estimatedBasic;
        string cropInsuranceCoverage;
        string productCost;
    }

    mapping(address => ParticipantDetail) public participants;
    mapping(uint => Asset) public assets;
    mapping(address => uint[]) public producers;
    mapping(address => uint[]) public distributers;
    mapping(address => uint[]) public consumers;

    string public version = "0.0.1";
    address public owner;
    uint public assetIndex;
    

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function signup(string _email, string _fullname, string _cellnumber, string _password, AccountType _type) public {
        require(msg.sender != participants[msg.sender].client);

        participants[msg.sender] = ParticipantDetail(msg.sender, _email, _fullname, _cellnumber, _password, _type);
    }

    function postAssets(
        string _harvestYear,
        CommodityType _commodity,
        string _totalAcer, 
        string _averageYield, 
        string _estimatedBasic, 
        string _cropInsuranceCoverage, 
        string _productCost) public {

        // msg.sender is a Producer
        require(participants[msg.sender].accountType == AccountType.PRODUCER);

        assetIndex++;
        assets[assetIndex] = Asset(
            now,
            _harvestYear, 
            _commodity, 
            AssetStatus.CREATED, 
            _totalAcer, 
            _averageYield, 
            _estimatedBasic, 
            _cropInsuranceCoverage, 
            _productCost);

        producers[msg.sender].push(assetIndex);
    }

    function getAssetsIndex() public view returns (uint[]){
        if(participants[msg.sender].accountType == AccountType.DISTRIBUTOR){
            return distributers[msg.sender];
        }else if(participants[msg.sender].accountType == AccountType.CONSUMER){
            return consumers[msg.sender];
        }else if(participants[msg.sender].accountType == AccountType.PRODUCER){
            return producers[msg.sender];
        }else{
            revert();
        }
    }

    function sellToDistributor(address _addrDistributor, uint _index) public {
        //require(participants[msg.sender].accountType == AccountType.PRODUCER);
        require(participants[_addrDistributor].accountType == AccountType.DISTRIBUTOR);
        require(_index <= assetIndex);
        require(assets[_index].status == AssetStatus.CREATED);

        assets[_index].status = AssetStatus.SELLING;
        distributers[_addrDistributor].push(_index);
    }

}
