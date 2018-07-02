pragma solidity ^0.4.23;

/* TODO: decentralized neuroscience */


contract Agrichain {

    string public version = "0.0.1";
    address public owner;
    

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

}
