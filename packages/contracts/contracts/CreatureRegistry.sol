// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./NudgeTracker.sol";
import "./PayoutSplitter.sol";

contract CreatureRegistry {
    enum Status {
        Pending,
        Acknowledged,
        Working,
        Submitted,
        Won,
        Lost,
        Cancelled
    }

    struct Challenge {
        uint256 id;
        address requester;
        string bountyUrl;
        string context;
        uint256 fee;
        Status status;
        bytes32 submissionHash;
        uint256 prizeAmount;
        uint256 createdAt;
        uint256 acknowledgedAt;
    }

    uint256 public challengeCount;
    uint256 public minRequestFee;
    address public keeper;
    address public owner;
    NudgeTracker public nudgeTracker;
    PayoutSplitter public payoutSplitter;

    mapping(uint256 => Challenge) public challenges;
    uint256[] private activeChallengeIds;

    event RequestSubmitted(uint256 indexed challengeId, address indexed requester, string bountyUrl, uint256 fee);
    event ChallengeAcknowledged(uint256 indexed challengeId);
    event StatusUpdated(uint256 indexed challengeId, Status newStatus, bytes32 submissionHash);
    event ChallengeWon(uint256 indexed challengeId, uint256 prizeAmount);
    event ChallengeLost(uint256 indexed challengeId);

    modifier onlyKeeper() {
        require(msg.sender == keeper, "Only keeper");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _keeper, uint256 _minRequestFee) {
        owner = msg.sender;
        keeper = _keeper;
        minRequestFee = _minRequestFee;
    }

    function setContracts(address _nudgeTracker, address _payoutSplitter) external onlyOwner {
        nudgeTracker = NudgeTracker(_nudgeTracker);
        payoutSplitter = PayoutSplitter(_payoutSplitter);
    }

    function setKeeper(address _keeper) external onlyOwner {
        keeper = _keeper;
    }

    function submitRequest(string calldata bountyUrl, string calldata context) external payable returns (uint256) {
        require(msg.value >= minRequestFee, "Fee too low");

        challengeCount++;
        uint256 id = challengeCount;

        challenges[id] = Challenge({
            id: id,
            requester: msg.sender,
            bountyUrl: bountyUrl,
            context: context,
            fee: msg.value,
            status: Status.Pending,
            submissionHash: bytes32(0),
            prizeAmount: 0,
            createdAt: block.timestamp,
            acknowledgedAt: 0
        });

        activeChallengeIds.push(id);
        emit RequestSubmitted(id, msg.sender, bountyUrl, msg.value);
        return id;
    }

    function acknowledge(uint256 challengeId) external onlyKeeper {
        Challenge storage c = challenges[challengeId];
        require(c.id != 0, "Not found");
        require(c.status == Status.Pending, "Not pending");

        c.status = Status.Acknowledged;
        c.acknowledgedAt = block.timestamp;
        emit ChallengeAcknowledged(challengeId);
    }

    function updateStatus(uint256 challengeId, Status newStatus, bytes32 submissionHash) external onlyKeeper {
        Challenge storage c = challenges[challengeId];
        require(c.id != 0, "Not found");

        c.status = newStatus;
        c.submissionHash = submissionHash;
        emit StatusUpdated(challengeId, newStatus, submissionHash);
    }

    function settleWin(uint256 challengeId) external payable onlyOwner {
        Challenge storage c = challenges[challengeId];
        require(c.id != 0, "Not found");
        require(c.status == Status.Submitted || c.status == Status.Working, "Not submittable");
        require(msg.value > 0, "Prize required");

        c.status = Status.Won;
        c.prizeAmount = msg.value;

        payoutSplitter.distribute{value: msg.value}(challengeId, c.requester);
        _removeActiveChallenge(challengeId);
        emit ChallengeWon(challengeId, msg.value);
    }

    function settleLoss(uint256 challengeId) external onlyOwner {
        Challenge storage c = challenges[challengeId];
        require(c.id != 0, "Not found");
        require(c.status == Status.Submitted || c.status == Status.Working, "Not submittable");

        c.status = Status.Lost;
        _removeActiveChallenge(challengeId);
        emit ChallengeLost(challengeId);
    }

    function getChallenge(uint256 challengeId) external view returns (Challenge memory) {
        require(challenges[challengeId].id != 0, "Not found");
        return challenges[challengeId];
    }

    function getActiveChallenges() external view returns (uint256[] memory) {
        return activeChallengeIds;
    }

    function _removeActiveChallenge(uint256 challengeId) internal {
        for (uint256 i = 0; i < activeChallengeIds.length; i++) {
            if (activeChallengeIds[i] == challengeId) {
                activeChallengeIds[i] = activeChallengeIds[activeChallengeIds.length - 1];
                activeChallengeIds.pop();
                break;
            }
        }
    }
}
