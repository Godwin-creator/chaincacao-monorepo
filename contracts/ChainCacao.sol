// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ChainCacao
 * @notice Contrat de traçabilité blockchain pour la filière cacao/café du Togo.
 *
 * Chaque lot de cacao ou café est représenté par un NFT (ERC-721).
 * Le contrat enregistre les transferts de custode à chaque étape de la
 * chaîne de valeur : récolte → coopérative → transformateur → exportateur → vérificateur UE.
 *
 * Déployé sur Polygon Amoy Testnet.
 * Adresse : 0x8E643C6bEEAa8E19a108a74B3A266cE4De9daDC4
 */
contract ChainCacao is ERC721, Ownable {
    using Counters for Counters.Counter;

    // ── Types ──────────────────────────────────────────────────────────────────

    enum LotStatus {
        Harvested,    // 0 — Récolté par le producteur
        Collected,    // 1 — Collecté par la coopérative
        Processed,    // 2 — Transformé (fermentation + séchage)
        Exported,     // 3 — Exporté vers le marché international
        Verified      // 4 — Vérifié par l'autorité compétente (EUDR)
    }

    struct LotInfo {
        string  lotUuid;        // UUID unique du lot (lié à la base de données)
        bytes32 geoJsonHash;    // SHA-256 du GeoJSON de la parcelle
        bytes32 photoHash;      // SHA-256 du lot de photos
        address producer;       // Adresse du producteur à la récolte
        LotStatus status;       // Statut actuel dans la chaîne
        uint256 mintedAt;       // Timestamp de création (block.timestamp)
        uint256 updatedAt;      // Timestamp de la dernière mise à jour
    }

    // ── État ───────────────────────────────────────────────────────────────────

    Counters.Counter private _tokenIds;

    mapping(uint256 => LotInfo) private _lots;
    mapping(string => uint256)  private _uuidToToken; // lotUuid → tokenId

    // ── Événements ─────────────────────────────────────────────────────────────

    event LotMinted(
        uint256 indexed tokenId,
        address indexed producer,
        string  lotUuid,
        bytes32 geoJsonHash
    );

    event CustodyTransferred(
        uint256   indexed tokenId,
        address   indexed from,
        address   indexed to,
        LotStatus         newStatus,
        uint256           timestamp
    );

    // ── Constructeur ───────────────────────────────────────────────────────────

    constructor() ERC721("ChainCacao", "CCAO") Ownable(msg.sender) {}

    // ── Fonctions d'écriture ───────────────────────────────────────────────────

    /**
     * @notice Mint un nouveau NFT représentant un lot de cacao/café.
     * @param to          Adresse du producteur (receveur initial du NFT)
     * @param lotUuid     Identifiant UUID du lot côté base de données
     * @param geoJsonHash SHA-256 du GeoJSON de la parcelle (en bytes32)
     * @return tokenId    ID du NFT créé
     */
    function mintLot(
        address to,
        string calldata lotUuid,
        bytes32 geoJsonHash
    ) external onlyOwner returns (uint256 tokenId) {
        require(to != address(0), "ChainCacao: adresse nulle");
        require(bytes(lotUuid).length > 0, "ChainCacao: UUID vide");
        require(_uuidToToken[lotUuid] == 0, "ChainCacao: lot deja enregistre");

        _tokenIds.increment();
        tokenId = _tokenIds.current();

        _safeMint(to, tokenId);

        _lots[tokenId] = LotInfo({
            lotUuid:     lotUuid,
            geoJsonHash: geoJsonHash,
            photoHash:   bytes32(0),
            producer:    to,
            status:      LotStatus.Harvested,
            mintedAt:    block.timestamp,
            updatedAt:   block.timestamp
        });

        _uuidToToken[lotUuid] = tokenId;

        emit LotMinted(tokenId, to, lotUuid, geoJsonHash);
    }

    /**
     * @notice Transfère la custode d'un lot à un nouvel acteur et met à jour son statut.
     * @param tokenId   ID du NFT du lot
     * @param to        Adresse du nouvel acteur (coopérative, transformateur, etc.)
     * @param newStatus Nouveau statut dans la chaîne de valeur
     */
    function transferCustody(
        uint256   tokenId,
        address   to,
        LotStatus newStatus
    ) external onlyOwner {
        require(_exists(tokenId), "ChainCacao: token inexistant");
        require(to != address(0), "ChainCacao: adresse nulle");
        require(
            uint8(newStatus) > uint8(_lots[tokenId].status),
            "ChainCacao: statut doit progresser"
        );

        address from = ownerOf(tokenId);
        _transfer(from, to, tokenId);

        _lots[tokenId].status    = newStatus;
        _lots[tokenId].updatedAt = block.timestamp;

        emit CustodyTransferred(tokenId, from, to, newStatus, block.timestamp);
    }

    /**
     * @notice Met à jour le hash photo d'un lot (après ajout de photos).
     */
    function setPhotoHash(uint256 tokenId, bytes32 photoHash) external onlyOwner {
        require(_exists(tokenId), "ChainCacao: token inexistant");
        _lots[tokenId].photoHash  = photoHash;
        _lots[tokenId].updatedAt  = block.timestamp;
    }

    // ── Fonctions de lecture ───────────────────────────────────────────────────

    /**
     * @notice Retourne les informations complètes d'un lot.
     */
    function getLot(uint256 tokenId) external view returns (LotInfo memory) {
        require(_exists(tokenId), "ChainCacao: token inexistant");
        return _lots[tokenId];
    }

    /**
     * @notice Retourne le tokenId à partir de l'UUID du lot.
     */
    function getTokenIdByUuid(string calldata lotUuid) external view returns (uint256) {
        uint256 tokenId = _uuidToToken[lotUuid];
        require(tokenId != 0, "ChainCacao: UUID non enregistre");
        return tokenId;
    }

    /**
     * @notice Retourne le nombre total de lots enregistrés.
     */
    function totalLots() external view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @notice Vérifie que le GeoJSON d'une parcelle n'a pas été modifié.
     * @return valid true si le hash fourni correspond à celui enregistré on-chain
     */
    function verifyGeoJsonIntegrity(
        uint256 tokenId,
        bytes32 currentHash
    ) external view returns (bool valid) {
        require(_exists(tokenId), "ChainCacao: token inexistant");
        return _lots[tokenId].geoJsonHash == currentHash;
    }

    // ── Surcharges ERC-721 ─────────────────────────────────────────────────────

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
