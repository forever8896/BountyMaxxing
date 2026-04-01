// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract EvolutionLedger {
    enum Outcome { Win, Loss }

    struct GenomeRecord {
        uint256 generation;
        bytes32 genomeHash;      // 0G Storage root hash
        uint256 challengeId;     // Which challenge triggered this evolution
        Outcome outcome;
        uint256 timestamp;
    }

    uint256 public generation;
    address public keeper;
    address public owner;

    mapping(uint256 => GenomeRecord) public genomes;

    event Evolved(uint256 indexed generation, bytes32 genomeHash, uint256 indexed challengeId, Outcome outcome);

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

    function setKeeper(address _keeper) external onlyOwner {
        keeper = _keeper;
    }

    function recordEvolution(
        bytes32 genomeHash,
        uint256 challengeId,
        Outcome outcome
    ) external onlyKeeper {
        generation++;

        genomes[generation] = GenomeRecord({
            generation: generation,
            genomeHash: genomeHash,
            challengeId: challengeId,
            outcome: outcome,
            timestamp: block.timestamp
        });

        emit Evolved(generation, genomeHash, challengeId, outcome);
    }

    function getGenome(uint256 gen) external view returns (GenomeRecord memory) {
        require(gen > 0 && gen <= generation, "Invalid generation");
        return genomes[gen];
    }

    function currentGeneration() external view returns (uint256) {
        return generation;
    }

    function getEvolutionHistory(uint256 fromGen, uint256 toGen) external view returns (GenomeRecord[] memory) {
        require(fromGen > 0 && toGen >= fromGen && toGen <= generation, "Invalid range");

        uint256 count = toGen - fromGen + 1;
        GenomeRecord[] memory records = new GenomeRecord[](count);
        for (uint256 i = 0; i < count; i++) {
            records[i] = genomes[fromGen + i];
        }
        return records;
    }
}
