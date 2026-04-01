// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./NudgeTracker.sol";

contract PayoutSplitter {
    uint256 public constant TREASURY_CUT_BPS = 500;   // 5%
    uint256 public constant REQUESTER_CUT_BPS = 1000;  // 10%
    uint256 public constant BPS_BASE = 10000;

    address public treasury;
    address public registry;
    address public owner;
    NudgeTracker public nudgeTracker;

    struct PayoutRecord {
        uint256 challengeId;
        uint256 totalPrize;
        uint256 treasuryCut;
        uint256 requesterCut;
        uint256 nudgerPool;
        bool distributed;
    }

    mapping(uint256 => PayoutRecord) public payouts;

    event PayoutDistributed(uint256 indexed challengeId, uint256 treasuryCut, uint256 requesterCut, uint256 nudgerPool);
    event NudgerPaid(uint256 indexed challengeId, address indexed nudger, uint256 amount);

    modifier onlyRegistry() {
        require(msg.sender == registry, "Only registry");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _treasury, address _nudgeTracker) {
        owner = msg.sender;
        treasury = _treasury;
        nudgeTracker = NudgeTracker(_nudgeTracker);
    }

    function setRegistry(address _registry) external onlyOwner {
        registry = _registry;
    }

    function distribute(uint256 challengeId, address requester) external payable onlyRegistry {
        require(msg.value > 0, "No prize");
        require(!payouts[challengeId].distributed, "Already distributed");

        uint256 totalPrize = msg.value;
        uint256 treasuryCut = (totalPrize * TREASURY_CUT_BPS) / BPS_BASE;
        uint256 requesterCut = (totalPrize * REQUESTER_CUT_BPS) / BPS_BASE;
        uint256 nudgerPool = totalPrize - treasuryCut - requesterCut;

        payouts[challengeId] = PayoutRecord({
            challengeId: challengeId,
            totalPrize: totalPrize,
            treasuryCut: treasuryCut,
            requesterCut: requesterCut,
            nudgerPool: nudgerPool,
            distributed: true
        });

        // Pay treasury
        (bool s1,) = treasury.call{value: treasuryCut}("");
        require(s1, "Treasury transfer failed");

        // Pay requester
        (bool s2,) = requester.call{value: requesterCut}("");
        require(s2, "Requester transfer failed");

        // Pay nudgers proportionally
        uint256 totalWeight = nudgeTracker.getTotalWeight(challengeId);
        if (totalWeight > 0) {
            (address[] memory nudgers, uint256[] memory weights) = nudgeTracker.getNudgerAddresses(challengeId);
            uint256 distributed = 0;

            for (uint256 i = 0; i < nudgers.length; i++) {
                uint256 share;
                if (i == nudgers.length - 1) {
                    // Last nudger gets remainder to avoid dust
                    share = nudgerPool - distributed;
                } else {
                    share = (nudgerPool * weights[i]) / totalWeight;
                }

                if (share > 0) {
                    (bool s3,) = nudgers[i].call{value: share}("");
                    require(s3, "Nudger transfer failed");
                    distributed += share;
                    emit NudgerPaid(challengeId, nudgers[i], share);
                }
            }
        } else {
            // No nudgers — send pool to treasury
            (bool s4,) = treasury.call{value: nudgerPool}("");
            require(s4, "Treasury fallback failed");
        }

        emit PayoutDistributed(challengeId, treasuryCut, requesterCut, nudgerPool);
    }

    function getPayout(uint256 challengeId) external view returns (PayoutRecord memory) {
        return payouts[challengeId];
    }
}
