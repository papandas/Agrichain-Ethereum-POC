pragma solidity ^0.4.23;

/* TODO: decentralized neuroscience */


contract Agrichain {

    
    enum AccountType { PRODUCER, DISTRIBUTOR, CONSUMER }
    enum CommodityType { POTATO, APPLES, STRAWBERRY, BLUEBERRY, BLUEB, WHEAT, OAT }
    enum OrderStatus { CREATED, IN_TRANSIT, RECEIVED, SELLING, SOLDOUT }
    enum OrderReplyStatus { NOACTION, ACCEPT, REJECT, PAYMENT }

    struct ParticipantDetail {
        address client;
        string email;
        string fullname;
        string cellnumber;
        string password;
        AccountType accountType;
    }

    struct Asset {
        uint256 index;
        uint256 created;
        string harvestYear;
        CommodityType commodity;
        string totalAcer;
        string averageYield;
        string estimatedBasic;
        string cropInsuranceCoverage;
        string productCost;
    }

    struct Quantity{
        uint256 totQty;
        uint256 avaiQty;
        string sellPrice;
        mapping(address => uint256) disQty;
        mapping(address => uint256) conQty;
    }

    struct Order{
        uint256 index;
        uint256 created;
        address producer;
        address distributor;
        uint256 AssetIndex;
        uint256 qty;
        uint256 price;
        OrderStatus state;
        OrderReplyStatus repState;
        uint delivery;
    }

    mapping(address => ParticipantDetail) public participants;
    mapping(uint256 => Asset) public assets;
    mapping(uint256 => Quantity) public quantitys;
    mapping(uint256 => Order) public orders;
    mapping(address => uint256[]) public producers;
    mapping(address => uint256[]) public distributers;
    mapping(address => uint256[]) public consumers;

    address[] public allProducers;
    address[] public allDistributers;
    address[] public allConsumers;

    uint public DELIVERY_PERIOD = 15 minutes;
    string public version = "0.0.1";
    address public owner;
    uint256 public assetIndex;
    uint256 public orderIndex;

    // EVENTS

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

        if(AccountType.DISTRIBUTOR == _type){
            allDistributers.push(msg.sender);
        }else if(AccountType.CONSUMER == _type){
            allConsumers.push(msg.sender);
        }else {
            allProducers.push(msg.sender);
        }

    }

    function PostAssets(
        string _harvestYear,
        CommodityType _commodity,
        string _totalAcer,
        string _averageYield,
        string _estimatedBasic,
        string _cropInsuranceCoverage,
        string _productCost,
        uint256 _qty,
        string _sellprice
    ) public {

        require(participants[msg.sender].accountType == AccountType.PRODUCER);

        assetIndex++;
        assets[assetIndex] = Asset(
            assetIndex,
            now,
            _harvestYear, 
            _commodity, 
            _totalAcer, 
            _averageYield, 
            _estimatedBasic, 
            _cropInsuranceCoverage, 
            _productCost
        );

        quantitys[assetIndex] = Quantity(_qty,_qty, _sellprice);

        producers[msg.sender].push(assetIndex);
    }

    

    function getAllProducers() public view returns (address[]){
        return allProducers;
    }

    function getAllDistributors() public view returns (address[]){
        return allDistributers;
    }

    function getAllConsumers() public view returns (address[]){
        return allConsumers;
    }

    function getQtyData(address _addr, uint256 _index) public view returns(uint256){
        if(participants[_addr].accountType == AccountType.DISTRIBUTOR){
            return quantitys[_index].disQty[_addr];
        }else if(participants[_addr].accountType == AccountType.CONSUMER){
            return quantitys[_index].conQty[_addr];
        }
    }

    function getAssetsIndex() public view returns (uint256[]){
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

    /*function sellToDistributor(address _addrDistributor, uint256 _index, uint256 _qty) public {
        require(participants[msg.sender].accountType == AccountType.PRODUCER);
        require(participants[_addrDistributor].accountType == AccountType.DISTRIBUTOR);
        require(_index <= assetIndex);
        require(assets[_index].status == AssetStatus.CREATED);

        assets[_index].status = AssetStatus.SELLING;
        quantitys[_index].disQty[_addrDistributor] = _qty;
        quantitys[_index].avaiQty = quantitys[_index].avaiQty - _qty;
        distributers[_addrDistributor].push(_index);
    }

    function sellToConsumer(address _addrConsumer, uint256 _index, uint256 _qty) public {
        require(participants[msg.sender].accountType == AccountType.DISTRIBUTOR);
        require(participants[_addrConsumer].accountType == AccountType.CONSUMER);
        require(_index <= assetIndex);
        require(assets[_index].status == AssetStatus.SELLING);

        quantitys[_index].conQty[_addrConsumer] = _qty;
        quantitys[_index].disQty[msg.sender] = quantitys[_index].disQty[msg.sender] - _qty;
        consumers[_addrConsumer].push(_index);
    }*/

    function CreateOrder(
        address _proAddr, 
        uint256 _assetIndex,
        uint256 _qty,
        uint256 _price) public {

        require(participants[msg.sender].accountType == AccountType.DISTRIBUTOR);
        require(quantitys[_assetIndex].avaiQty >= _qty);
        require(_qty > 0);
        
        orderIndex++;
        orders[orderIndex] = Order(
        orderIndex,
        now,
        _proAddr,
        msg.sender,
        _assetIndex,
        _qty,
        _price,
        OrderStatus.CREATED,
        OrderReplyStatus.NOACTION,
        now
        );

    }


    function UpdateOrder(
        uint256 _orderIndex,
        OrderStatus _state,
        OrderReplyStatus _repState,
        uint256 _delivery) public {

        require(participants[msg.sender].accountType == AccountType.PRODUCER);
        require(orders[_orderIndex].producer == msg.sender);
        require(quantitys[orders[_orderIndex].AssetIndex].avaiQty >= orders[_orderIndex].qty);

        orders[_orderIndex].state = _state;
        orders[_orderIndex].repState = _repState;
        _delivery = _delivery;
        orders[_orderIndex].delivery = orders[_orderIndex].delivery + DELIVERY_PERIOD; // 3 days
    }


    function DistributorPurchase(address _producer, uint256 _orderIndex) public payable {
        require(address(msg.sender).balance >= msg.value);
        require(participants[msg.sender].accountType == AccountType.DISTRIBUTOR);
        require(orders[_orderIndex].producer == _producer);
        require(orders[_orderIndex].distributor == msg.sender);
        require(quantitys[orders[_orderIndex].AssetIndex].avaiQty >= orders[_orderIndex].qty);
        require(orders[_orderIndex].repState == OrderReplyStatus.ACCEPT);

        // Check deliever date
        // require(now < orders[_orderIndex].delivery);

        orders[_orderIndex].state = OrderStatus.RECEIVED;
        orders[_orderIndex].repState = OrderReplyStatus.PAYMENT;

        distributers[msg.sender].push(orders[_orderIndex].AssetIndex);

        quantitys[orders[_orderIndex].AssetIndex].avaiQty = quantitys[orders[_orderIndex].AssetIndex].avaiQty - orders[_orderIndex].qty;
        quantitys[orders[_orderIndex].AssetIndex].disQty[msg.sender] = orders[_orderIndex].qty;

        _producer.transfer(msg.value);
    }

    function ConsumerPurchase(address _addrDistributor, uint256 _assetId, uint256 _qty) public payable {
        require(address(msg.sender).balance >= msg.value);
        require(participants[msg.sender].accountType == AccountType.CONSUMER);
        require(quantitys[_assetId].disQty[_addrDistributor] >= _qty);
        require(_qty > 0);

        consumers[msg.sender].push(_assetId);

        quantitys[_assetId].conQty[msg.sender] = _qty;
        quantitys[_assetId].disQty[_addrDistributor] = quantitys[_assetId].disQty[_addrDistributor] - _qty;

        _addrDistributor.transfer(msg.value);
    }


}
