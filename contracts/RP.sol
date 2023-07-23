// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.18;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// contract RP is ERC20, Ownable {
//     mapping(address => bool) public community;

//     constructor(address newOwner) ERC20("Repution Points", "RP") {
//         transferOwnership(newOwner);
//     }

//     function addCommunityMember(address member) public onlyOwner {
//         community[member] = true;
//     }

//     function addMultipleCommunityMembers(
//         address[] memory members
//     ) public onlyOwner {
//         for (uint256 i = 0; i < members.length; i++) {
//             community[members[i]] = true;
//         }
//     }

//     function mint(address to, uint256 amount) public onlyOwner {
//         require(community[to], "RP: Can mint only to community members");
//         _mint(to, amount);
//     }

//     function transfer(
//         address recipient,
//         uint256 amount
//     ) public override returns (bool) {
//         require(
//             community[recipient],
//             "RP: Can transfer only to community members"
//         );
//         return super.transfer(recipient, amount);
//     }

//     function isCommunityMember(address member) public view returns (bool) {
//         return community[member];
//     }
// }
