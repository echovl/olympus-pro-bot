//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/ICustomBond.sol";
import "./interfaces/IVault.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BondZapper {
    ICustomBond public customBond;
    IVault public vault;
    address public deus;
    address public dei;
    bytes32 public poolId;

    constructor(
        address _customBond,
        address _vault,
        address _deus,
        address _dei,
        bytes32 _poolId
    ) {
        customBond = ICustomBond(_customBond);
        vault = IVault(_vault);
        deus = _deus;
        dei = _dei;
        poolId = _poolId;

        allowances();
    }

    function zap(uint amount) external {
        customBond.redeem(msg.sender);
        IERC20(deus).transferFrom(msg.sender, address(this), amount);

        IVault.SingleSwap memory singleSwap = IVault.SingleSwap(
            poolId, 
            IVault.SwapKind.GIVEN_IN, 
            deus, 
            dei, 
            amount, 
            ""
        );
        IVault.FundManagement memory funds = IVault.FundManagement(
            address(this), 
            false, 
            payable(address(this)), 
            false
        );
        vault.swap(singleSwap, funds, 0, block.timestamp);

        uint deiBalance = IERC20(dei).balanceOf(address(this));

        customBond.deposit(deiBalance, customBond.trueBondPrice(), msg.sender);
    }

    function allowances() internal {
        IERC20(deus).approve(address(vault), type(uint256).max);
        IERC20(dei).approve(address(customBond), type(uint256).max);
    }
}
