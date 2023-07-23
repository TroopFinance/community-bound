// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// import "./XP.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";

// contract ProposalManager is Ownable {
//     XP public xp;

//     struct ProposalStruct {
//         uint256 id;
//         bytes32 safeTxHash;
//         address proposer;
//         uint256 kudos;
//         bool finalized;
//         string message;
//         mapping(address => bool) hasGivenKudos;
//     }

//     mapping(uint256 => ProposalStruct) public proposals;
//     uint256 public proposalCount;

//     constructor(XP _xp) {
//         xp = _xp;
//     }

//     function createProposal(bytes32 safeTxHash, string memory message) public {
//         require(
//             xp.isCommunityMember(msg.sender),
//             "Only community members can propose"
//         );
//         proposalCount++;

//         ProposalStruct storage newProposal = proposals[proposalCount];
//         newProposal.id = proposalCount;
//         newProposal.safeTxHash = safeTxHash;
//         newProposal.proposer = msg.sender;
//         newProposal.kudos = 0;
//         newProposal.finalized = false;
//         newProposal.message = message;
//     }

//     function addKudos(uint256 proposalId) public {
//         require(
//             !proposals[proposalId].finalized,
//             "Proposal: proposal already finalized"
//         );
//         require(
//             !proposals[proposalId].hasGivenKudos[msg.sender],
//             "Proposal: user has already given kudos"
//         );
//         require(
//             proposals[proposalId].proposer != msg.sender,
//             "Proposal: Cannot give kudos to your own proposal"
//         );

//         proposals[proposalId].kudos += 1;
//         proposals[proposalId].hasGivenKudos[msg.sender] = true;
//     }

//     function finalizeProposal(
//         uint256 proposalId,
//         bytes32 transactionHash
//     ) public onlyOwner {
//         require(
//             !proposals[proposalId].finalized,
//             "Proposal: proposal already finalized"
//         );
//         require(
//             proposals[proposalId].safeTxHash == transactionHash,
//             "Proposal: transaction hash mismatch"
//         );

//         proposals[proposalId].finalized = true;
//         uint256 xpAmount = proposals[proposalId].kudos * 10;
//         xp.mint(proposals[proposalId].proposer, xpAmount);
//     }
// }
