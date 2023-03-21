// SPDX-License-Identifier: BSD-3-Clause
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract ERC20MockToken is ERC20 {

    constructor(string memory name_, string memory symbol_) 
        ERC20(name_, symbol_) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

}

contract ERC20MockToken8 is ERC20 {

    constructor(string memory name_, string memory symbol_) 
        ERC20(name_, symbol_) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    function decimals() public pure override returns (uint8) {
        return 8;
    }
}

contract ERC20MockToken6 is ERC20 {

    constructor(string memory name_, string memory symbol_) 
        ERC20(name_, symbol_) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
}