//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/ICustomBond.sol";

contract Oracle {
    address public CUSTOM_BOND = 0xd0Ed146951A189e3288d31aC815cabA619D56143;
    address public DEUS_FTM_LP = 0xaF918eF5b9f33231764A5557881E6D3e5277d456;
    address public FTM_USDC_LP = 0x2b4C76d0dc16BE1C31D4C1DC53bF9B45987Fc75c;

    constructor() {}

    function getDeusPrice() public view returns (uint) {
        (uint reserve0, uint reserve1, ) = IUniswapV2Pair(DEUS_FTM_LP).getReserves();
        uint deusFtmPrice = reserve0 / reserve1;
        (reserve0, reserve1, ) = IUniswapV2Pair(FTM_USDC_LP).getReserves();
        return 1e12 * deusFtmPrice * reserve0 / reserve1;
    }

    function getBondPrice() public view returns (uint) {
        return ICustomBond(CUSTOM_BOND).trueBondPrice() / 1e7;
    }
}
