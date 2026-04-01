// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract NudgeTracker {
    struct Nudge {
        uint256 id;
        uint256 challengeId;
        address nudger;
        bytes32 contentHash;
        uint256 parentNudgeId;
        uint256 weight;
        uint256 timestamp;
    }

    uint256 public nudgeCount;
    address public keeper;
    address public registry;
    address public owner;

    mapping(uint256 => Nudge) public nudges;
    mapping(uint256 => uint256[]) public challengeNudgeIds;
    // challengeId => nudger => accumulated weight
    mapping(uint256 => mapping(address => uint256)) public contributionWeights;
    // challengeId => total weight
    mapping(uint256 => uint256) public totalWeights;

    event NudgeSubmitted(
        uint256 indexed nudgeId,
        uint256 indexed challengeId,
        address indexed nudger,
        bytes32 contentHash,
        uint256 parentNudgeId
    );
    event NudgeWeighted(uint256 indexed nudgeId, uint256 weight);

    modifier onlyKeeper() {
        require(msg.sender == keeper, "Only keeper");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _keeper) {
        owner = msg.sender;
        keeper = _keeper;
    }

    function setRegistry(address _registry) external onlyOwner {
        registry = _registry;
    }

    function setKeeper(address _keeper) external onlyOwner {
        keeper = _keeper;
    }

    function submitNudge(
        uint256 challengeId,
        bytes32 contentHash,
        uint256 parentNudgeId
    ) external returns (uint256) {
        require(contentHash != bytes32(0), "Empty content");

        nudgeCount++;
        uint256 id = nudgeCount;

        nudges[id] = Nudge({
            id: id,
            challengeId: challengeId,
            nudger: msg.sender,
            contentHash: contentHash,
            parentNudgeId: parentNudgeId,
            weight: 0,
            timestamp: block.timestamp
        });

        challengeNudgeIds[challengeId].push(id);
        emit NudgeSubmitted(id, challengeId, msg.sender, contentHash, parentNudgeId);
        return id;
    }

    function setNudgeWeight(uint256 nudgeId, uint256 weight) external onlyKeeper {
        Nudge storage n = nudges[nudgeId];
        require(n.id != 0, "Not found");

        // Update accumulated weights
        uint256 oldWeight = n.weight;
        if (oldWeight > 0) {
            contributionWeights[n.challengeId][n.nudger] -= oldWeight;
            totalWeights[n.challengeId] -= oldWeight;
        }

        n.weight = weight;
        contributionWeights[n.challengeId][n.nudger] += weight;
        totalWeights[n.challengeId] += weight;

        emit NudgeWeighted(nudgeId, weight);
    }

    function getNudgesForChallenge(uint256 challengeId) external view returns (Nudge[] memory) {
        uint256[] storage ids = challengeNudgeIds[challengeId];
        Nudge[] memory result = new Nudge[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = nudges[ids[i]];
        }
        return result;
    }

    function getContributionWeight(uint256 challengeId, address nudger) external view returns (uint256) {
        return contributionWeights[challengeId][nudger];
    }

    function getTotalWeight(uint256 challengeId) external view returns (uint256) {
        return totalWeights[challengeId];
    }

    function getNudgerAddresses(uint256 challengeId) external view returns (address[] memory, uint256[] memory) {
        uint256[] storage ids = challengeNudgeIds[challengeId];

        // Collect unique nudgers
        address[] memory tempAddrs = new address[](ids.length);
        uint256 uniqueCount = 0;

        for (uint256 i = 0; i < ids.length; i++) {
            address nudger = nudges[ids[i]].nudger;
            bool found = false;
            for (uint256 j = 0; j < uniqueCount; j++) {
                if (tempAddrs[j] == nudger) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                tempAddrs[uniqueCount] = nudger;
                uniqueCount++;
            }
        }

        address[] memory addrs = new address[](uniqueCount);
        uint256[] memory weights = new uint256[](uniqueCount);
        for (uint256 i = 0; i < uniqueCount; i++) {
            addrs[i] = tempAddrs[i];
            weights[i] = contributionWeights[challengeId][tempAddrs[i]];
        }
        return (addrs, weights);
    }
}
