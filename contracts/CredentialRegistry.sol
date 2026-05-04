// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CredentialRegistry
/// @notice On-chain registry for authorized issuers and revoked credentials.
contract CredentialRegistry {
    address public owner;

    // Authorized issuers (universities)
    mapping(address => bool) private authorizedIssuers;

    // credentialId => merkleRoot stored on-chain
    mapping(bytes32 => bytes32) private credentialMerkleRoot;

    // credentialId => issuer who issued it
    mapping(bytes32 => address) private credentialIssuer;

    // Revocation list
    mapping(bytes32 => bool) private revokedCredentials;

    // Track issued credential ids per issuer (for enumeration)
    mapping(address => bytes32[]) private issuerCredentials;

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------
    event IssuerRegistered(address indexed issuer);
    event IssuerRemoved(address indexed issuer);
    event CredentialIssued(bytes32 indexed credentialId, address indexed issuer, bytes32 merkleRoot);
    event CredentialRevoked(bytes32 indexed credentialId, address indexed issuer);

    // -----------------------------------------------------------------------
    // Modifiers
    // -----------------------------------------------------------------------
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "Not authorized issuer");
        _;
    }

    // -----------------------------------------------------------------------
    // Constructor
    // -----------------------------------------------------------------------
    constructor() {
        owner = msg.sender;
    }

    // -----------------------------------------------------------------------
    // Issuer Management
    // -----------------------------------------------------------------------

    /// @notice Owner registers a new authorized issuer.
    function registerIssuer(address issuer) external onlyOwner {
        require(issuer != address(0), "Zero address");
        require(!authorizedIssuers[issuer], "Already registered");
        authorizedIssuers[issuer] = true;
        emit IssuerRegistered(issuer);
    }

    /// @notice Owner removes an existing authorized issuer.
    function removeIssuer(address issuer) external onlyOwner {
        require(authorizedIssuers[issuer], "Not registered");
        authorizedIssuers[issuer] = false;
        emit IssuerRemoved(issuer);
    }

    /// @notice Check if an address is an authorized issuer.
    function isIssuerAuthorized(address issuer) external view returns (bool) {
        return authorizedIssuers[issuer];
    }

    // -----------------------------------------------------------------------
    // Credential Management
    // -----------------------------------------------------------------------

    /// @notice Authorized issuer stores a credential's Merkle root on-chain.
    /// @param credentialId  keccak256 hash uniquely identifying the credential.
    /// @param merkleRoot    Root of the Merkle tree built from the transcript.
    function issueCredential(bytes32 credentialId, bytes32 merkleRoot) external onlyAuthorizedIssuer {
        require(credentialMerkleRoot[credentialId] == bytes32(0), "Already issued");
        require(merkleRoot != bytes32(0), "Empty merkle root");

        credentialMerkleRoot[credentialId] = merkleRoot;
        credentialIssuer[credentialId] = msg.sender;
        issuerCredentials[msg.sender].push(credentialId);

        emit CredentialIssued(credentialId, msg.sender, merkleRoot);
    }

    /// @notice Authorized issuer (the original one) revokes a credential.
    function revokeCredential(bytes32 credentialId) external onlyAuthorizedIssuer {
        require(credentialIssuer[credentialId] == msg.sender, "Not credential issuer");
        require(!revokedCredentials[credentialId], "Already revoked");

        revokedCredentials[credentialId] = true;
        emit CredentialRevoked(credentialId, msg.sender);
    }

    /// @notice Check validity: credential exists, not revoked, issuer still authorized.
    /// @return valid       Whether the credential is currently valid.
    /// @return merkleRoot  The stored Merkle root (bytes32(0) if not found).
    function verifyCredential(bytes32 credentialId)
        external
        view
        returns (bool valid, bytes32 merkleRoot)
    {
        merkleRoot = credentialMerkleRoot[credentialId];
        if (merkleRoot == bytes32(0)) {
            return (false, bytes32(0));
        }
        if (revokedCredentials[credentialId]) {
            return (false, merkleRoot);
        }
        address issuer = credentialIssuer[credentialId];
        if (!authorizedIssuers[issuer]) {
            return (false, merkleRoot);
        }
        return (true, merkleRoot);
    }

    /// @notice Returns whether a credential has been revoked.
    function isRevoked(bytes32 credentialId) external view returns (bool) {
        return revokedCredentials[credentialId];
    }

    /// @notice Returns the Merkle root stored for a credential.
    function getMerkleRoot(bytes32 credentialId) external view returns (bytes32) {
        return credentialMerkleRoot[credentialId];
    }

    /// @notice Returns the issuer address for a credential.
    function getCredentialIssuer(bytes32 credentialId) external view returns (address) {
        return credentialIssuer[credentialId];
    }
}
