//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/IUniswapV2Router.sol";
import "../interfaces/IUniswapV2Pair.sol";
import "../interfaces/IRouter.sol";
import "../interfaces/IWETH.sol";
import "../interfaces/IMasterChef.sol";

contract Vault is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    IMasterChef public masterChef;
    address public token0;
    address public token1;
    address public rewardToken;
    uint256 public poolId;
    address public liquidityRouter;

    address[] public earnedToToken0Path;
    address[] public earnedToToken1Path;
    address[] public token0ToEarnedPath;
    address[] public token1ToEarnedPath;

    uint256 public swapTimeout;

    uint256 internal constant RATIO_PRECISION = 1000000; // 6 decimals
    address internal constant weth = 0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270; // matic

    // =========== state variables ================================

    bool public initialized;

    address public harvestor; // this address can call earn method
    uint256 public lastEarnBlock;
    address public wantAddress;
    bool public abandoned;
    uint256 public slippage = 50000; // 0.5%

    // =========== events ================================

    event Earned(address indexed _earnedToken, uint256 _amount);
    event Deposited(uint256 _amount);
    event Withdraw(uint256 _amount);
    event Exit(uint256 _lpAmount);

    // =========== constructor ===========================

    constructor(
        address _liquidityRouter,
        IMasterChef _masterChef,
        uint256 _poolId
    ) {
        liquidityRouter = _liquidityRouter;
        poolId = _poolId;
        masterChef = _masterChef;
        (wantAddress, , , ) = _masterChef.poolInfo(poolId);
        rewardToken = _masterChef.rewardToken();
        token0 = IUniswapV2Pair(wantAddress).token0();
        token1 = IUniswapV2Pair(wantAddress).token1();
        token0ToEarnedPath = [token0, rewardToken];
        token1ToEarnedPath = [token1, rewardToken];
        earnedToToken0Path = [rewardToken, token0];
        earnedToToken1Path = [rewardToken, token1];
    }

    function initialize(address _owner) external virtual {
        require(!initialized, "already init");
        harvestor = _owner;
        initialized = true;
    }

    // =========== views ===============================

    function canAbandon() public view returns (bool) {
        bool _noRewardTokenLeft = IERC20(rewardToken).balanceOf(
            address(this)
        ) == 0;
        bool _noLpTokenLeft = IERC20(wantAddress).balanceOf(address(this)) == 0;
        bool _noPending = pending() == 0;
        return _noRewardTokenLeft && _noLpTokenLeft && _noPending;
    }

    function balanceInFarm() public view returns (uint256) {
        (uint256 _amount, ) = masterChef.userInfo(poolId, address(this));
        return _amount;
    }

    function pending() public view returns (uint256) {
        return masterChef.pendingSushi(poolId, address(this));
    }

    function info()
        external
        view
        virtual
        returns (
            uint256 _balanceInFarm,
            uint256 _pendingRewards,
            bool _abandoned,
            bool _canDeposit,
            bool _canAbandon
        )
    {
        _balanceInFarm = balanceInFarm();
        _pendingRewards = pending();
        _canDeposit = true;
        _canAbandon = canAbandon();
        _abandoned = abandoned;
    }

    // =========== modifiers ===========================
    modifier onlyHarvestor() {
        require(
            msg.sender == harvestor || msg.sender == owner(),
            "!owner && !harvestor"
        );
        _;
    }

    modifier canHarvest() {
        require(initialized, "!init");
        _;
    }

    modifier canDeposit() {
        require(initialized, "!init");
        _;
    }

    // =========== restricted functions =================

    function updateSlippage(uint256 _slippage) public virtual onlyOwner {
        slippage = _slippage;
    }

    function setHarvestor(address _harvestor) external onlyOwner {
        require(_harvestor != address(0x0), "cannot address set to zero");
        harvestor = _harvestor;
    }

    // =========== internal functions ==================

    function _safeSwap(
        address _swapRouterAddress,
        uint256 _amountIn,
        uint256 _slippage,
        address[] memory _path,
        address _to,
        uint256 _deadline
    ) internal {
        IUniswapV2Router _swapRouter = IUniswapV2Router(_swapRouterAddress);
        require(_path.length > 0, "invalidSwapPath");
        uint256[] memory amounts = _swapRouter.getAmountsOut(_amountIn, _path);
        uint256 _minAmountOut = (amounts[amounts.length - 1] *
            (RATIO_PRECISION - _slippage)) / RATIO_PRECISION;

        _swapRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            _amountIn,
            _minAmountOut,
            _path,
            _to,
            _deadline
        );
    }

    function _unwrapETH() internal {
        // WETH -> ETH
        uint256 wethBalance = IERC20(weth).balanceOf(address(this));
        if (wethBalance > 0) {
            IWETH(weth).withdraw(wethBalance);
        }
    }

    function _wrapETH() internal {
        // ETH -> WETH
        uint256 ethBalance = address(this).balance;
        if (ethBalance > 0) {
            IWETH(weth).deposit{value: ethBalance}();
        }
    }

    function _isWETH(address _token) internal pure returns (bool) {
        return _token == weth;
    }

    // =========== emergency functions =================

    function rescueFund(address _token, uint256 _amount)
        public
        virtual
        onlyOwner
    {
        IERC20(_token).safeTransfer(owner(), _amount);
    }

    function executeTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data
    ) public onlyOwner returns (bytes memory) {
        bytes memory callData;

        if (bytes(signature).length == 0) {
            callData = data;
        } else {
            callData = abi.encodePacked(
                bytes4(keccak256(bytes(signature))),
                data
            );
        }
        // solium-disable-next-line security/no-call-value
        (bool success, bytes memory returnData) = target.call{value: value}(
            callData
        );
        require(
            success,
            string(
                "DevFund::executeTransaction: Transaction execution reverted."
            )
        );
        return returnData;
    }

    receive() external payable {}

    // =========== Core =================
    function compound() external onlyHarvestor {
        // Harvest farm tokens
        uint256 _initBalance = balanceInFarm();
        _widthdrawFromFarm(0);

        if (_isWETH(rewardToken)) {
            _wrapETH();
        }

        // Converts farm tokens into want tokens
        uint256 earnedAmt = IERC20(rewardToken).balanceOf(address(this));

        if (rewardToken != token0) {
            _swap(rewardToken, token0, earnedAmt / 2, earnedToToken0Path);
        }

        if (rewardToken != token1) {
            _swap(rewardToken, token1, earnedAmt / 2, earnedToToken1Path);
        }

        IERC20 _token0 = IERC20(token0);
        IERC20 _token1 = IERC20(token1);
        // Get want tokens, ie. add liquidity
        uint256 token0Amt = _token0.balanceOf(address(this));
        uint256 token1Amt = _token1.balanceOf(address(this));
        if (token0Amt > 0 && token1Amt > 0) {
            _token0.safeIncreaseAllowance(liquidityRouter, token0Amt);
            _token1.safeIncreaseAllowance(liquidityRouter, token1Amt);
            IUniswapV2Router(liquidityRouter).addLiquidity(
                token0,
                token1,
                token0Amt,
                token1Amt,
                0,
                0,
                address(this),
                block.timestamp + swapTimeout
            );
        }

        lastEarnBlock = block.number;

        _depositToFarm();
        _cleanUp();

        uint256 _afterBalance = balanceInFarm();
        if (_afterBalance > _initBalance) {
            emit Earned(wantAddress, _afterBalance - _initBalance);
        } else {
            emit Earned(wantAddress, 0);
        }
    }

    function deposit(uint256 _wantAmt)
        public
        onlyOwner
        nonReentrant
        returns (uint256)
    {
        IERC20(wantAddress).safeTransferFrom(
            address(msg.sender),
            address(this),
            _wantAmt
        );
        _depositToFarm();
        return _wantAmt;
    }

    function withdrawAll()
        external
        onlyOwner
        returns (uint256 _withdrawBalance)
    {
        uint256 _balance = balanceInFarm();
        _withdrawBalance = withdraw(_balance);
        _cleanUp();
        _withdrawFromVault();
        emit Exit(_withdrawBalance);
    }

    function withdraw(uint256 _wantAmt)
        public
        onlyOwner
        nonReentrant
        returns (uint256)
    {
        require(_wantAmt > 0, "_wantAmt <= 0");
        _widthdrawFromFarm(_wantAmt);
        uint256 _balance = IERC20(rewardToken).balanceOf(address(this));
        _withdrawFromVault();
        return _balance;
    }

    function claimRewards() external onlyOwner {
        _widthdrawFromFarm(0);
        uint256 _balance = IERC20(rewardToken).balanceOf(address(this));
        if (_balance > 0) {
            IERC20(rewardToken).safeTransfer(msg.sender, _balance);
        }
    }

    function abandon() external onlyOwner {
        require(canAbandon(), "Vault cannot be abandoned");
        abandoned = true;
    }

    function _withdrawFromVault() internal {
        uint256 _dustRewardBal = IERC20(rewardToken).balanceOf(address(this));
        if (_dustRewardBal > 0) {
            IERC20(rewardToken).safeTransfer(msg.sender, _dustRewardBal);
        }
        uint256 _wantBalance = IERC20(wantAddress).balanceOf(address(this));
        if (_wantBalance > 0) {
            IERC20(wantAddress).safeTransfer(msg.sender, _wantBalance);
        }
    }

    function _cleanUp() internal {
        // Converts dust tokens into earned tokens, which will be reinvested on the next earn().
        // Converts token0 dust (if any) to earned tokens
        uint256 token0Amt = IERC20(token0).balanceOf(address(this));
        if (token0 != rewardToken && token0Amt > 0) {
            _swap(token0, rewardToken, token0Amt, token0ToEarnedPath);
        }

        // Converts token1 dust (if any) to earned tokens
        uint256 token1Amt = IERC20(token1).balanceOf(address(this));
        if (token1 != rewardToken && token1Amt > 0) {
            _swap(token1, rewardToken, token1Amt, token1ToEarnedPath);
        }
    }

    function _depositToFarm() internal canDeposit {
        IERC20 wantToken = IERC20(wantAddress);
        uint256 wantAmt = wantToken.balanceOf(address(this));
        wantToken.safeIncreaseAllowance(address(masterChef), wantAmt);
        masterChef.deposit(poolId, wantAmt);
        emit Deposited(wantAmt);
    }

    function _widthdrawFromFarm(uint256 _wantAmt) internal {
        masterChef.withdraw(poolId, _wantAmt);
        emit Withdraw(_wantAmt);
    }

    function _swap(
        address _inputToken,
        address _outputToken,
        uint256 _inputAmount,
        address[] memory _path
    ) internal {
        require(_path[0] == _inputToken, "Route must start with src token");
        require(
            _path[_path.length - 1] == _outputToken,
            "Route must end with dst token"
        );
        IERC20(_inputToken).safeApprove(liquidityRouter, 0);
        IERC20(_inputToken).safeApprove(liquidityRouter, _inputAmount);
        _safeSwap(
            liquidityRouter,
            _inputAmount,
            slippage,
            _path,
            address(this),
            block.timestamp + swapTimeout
        );
    }
}
