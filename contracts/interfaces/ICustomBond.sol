//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICustomBond {
    function redeem(address depositor) external returns (uint);
    function deposit(uint amount, uint maxPrice, address depositor) external returns(uint);
    function trueBondPrice() external view returns (uint);
}
