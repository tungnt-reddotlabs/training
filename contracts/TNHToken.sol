pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TNHToken is ERC20 {
    using SafeMath for uint256;
    address private minter;
    uint256 private maximum_total_supply;

    modifier onlyMinter() {
        require(msg.sender == getMinter(), "You are not minter");
        _;
    }

    constructor(string memory _name, string memory _symbol)
        ERC20(_name, _symbol)
    {}

    function getMinter() public view returns(address) {
        return minter;
    }

    function getMaximumSupply() public view returns(uint256) {
        return maximum_total_supply;
    }

    function setMinter(address _minter) public onlyOwner {
        minter = _minter;
    }

    function setMaximumTotalSupply(uint256 _maximum) public onlyOwner {
        maximum_total_supply = _maximum;
    }

    function mint(address account, uint256 amount) public onlyMinter {
        require(add(totalSupply(), amount) <= getMaximumSupply(), "Cannot mint because maximum supply has been reached");
        _mint(account, amount);
    }
}