// pragma solidity ^0.8.0;

// import "../HandlerBase.sol";
// import "./IVault.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "hardhat/console.sol";

// contract HBalancer is HandlerBase {
//   address public constant VAULT = 0xBA12222222228d8Ba445958a75a0704d566BF2C8;

//   //   struct SingleSwap {
//   //         bytes32 poolId;
//   //         SwapKind kind;
//   //         IAsset assetIn;
//   //         IAsset assetOut;
//   //         uint256 amount;
//   //         bytes userData;
//   //     }

//   //     enum SwapKind { GIVEN_IN, GIVEN_OUT }

//   //     struct FundManagement {
//   //         address sender;
//   //         bool fromInternalBalance;
//   //         address payable recipient;
//   //         bool toInternalBalance;
//   //     }

//   function getContractName() public pure override returns (string memory) {
//     return "HBalancer";
//   }

//   function flashLoan(
//     address recipient,
//     IERC20[] memory tokens,
//     uint256[] memory amounts,
//     bytes memory userData
//   ) external {
//       console.log("address(this)",address(this));
//     IVault(VAULT).flashLoan(IFlashLoanRecipient(recipient), tokens, amounts, userData);
//   }

//   function swap(
//     IVault.SingleSwap memory singleSwap,
//     IVault.FundManagement memory funds,
//     uint256 limit,
//     uint256 deadline
//   ) external payable returns (uint256) {
    
//    return IVault(VAULT).swap(singleSwap, funds, limit, deadline);
//   }
// function batchSwap(
//         IVault.SwapKind kind,
//         IVault.BatchSwapStep[] memory swaps,
//         IAsset[] memory assets,
//         IVault.FundManagement memory funds,
//         int256[] memory limits,
//         uint256 deadline
//     ) external payable returns (int256[] memory){

//       console.log("Msg Sender",msg.sender);
//       console.log("Contract Address",address(this));

//       // IVault(VAULT).setRelayerApproval(address(this), address(this), true);
//       // IVault(VAULT).setRelayerApproval(address(this), msg.sender, true);
//       // console.logBytes32(swaps[0].poolId);
//       return IVault(VAULT).batchSwap(kind, swaps, assets, funds, limits, deadline);
//     }

// }
