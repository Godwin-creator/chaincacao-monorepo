import { ethers } from 'ethers'

// ABI minimal du contrat ChainCacao (ERC-721 + traçabilité)
const CHAIN_CACAO_ABI = [
  'function mintLot(address to, string calldata lotUuid, bytes32 geoJsonHash) external returns (uint256 tokenId)',
  'function transferCustody(uint256 tokenId, address to, uint8 newStatus) external',
  'event LotMinted(uint256 indexed tokenId, address indexed producer, string lotUuid)',
  'event CustodyTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint8 newStatus)',
]

const STATUS_CODES = { harvested: 0, collected: 1, processed: 2, exported: 3, verified: 4 }

function simulatedTxHash() {
  const hex = '0123456789abcdef'
  return '0x' + Array.from({ length: 64 }, () => hex[Math.floor(Math.random() * 16)]).join('')
}

function getContract() {
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL)
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider)
  return new ethers.Contract(process.env.CONTRACT_ADDRESS, CHAIN_CACAO_ABI, wallet)
}

/**
 * Mint un NFT pour un nouveau lot sur Polygon Amoy.
 * Retourne toujours un txHash — simulé si la transaction échoue.
 */
export async function mintLotOnChain(toAddress, lotUuid, geoJsonHash = '') {
  try {
    const contract = getContract()
    // bytes32 : pad ou truncate le hash hex à 32 octets
    const hashHex = geoJsonHash.replace('0x', '').slice(0, 64).padStart(64, '0')
    const hashBytes = `0x${hashHex}`

    const tx = await contract.mintLot(
      toAddress,
      lotUuid,
      hashBytes,
      { gasLimit: 300_000 }
    )
    const receipt = await tx.wait(1)
    // Extraire le tokenId depuis les logs de l'event LotMinted
    const event = receipt.logs
      .map((log) => { try { return contract.interface.parseLog(log) } catch { return null } })
      .find((e) => e?.name === 'LotMinted')
    const tokenId = event?.args?.tokenId?.toString() ?? null

    return { txHash: receipt.hash, tokenId, simulated: false }
  } catch (err) {
    console.error('[blockchain] mintLot échoué, hash simulé:', err.message)
    return { txHash: simulatedTxHash(), tokenId: null, simulated: true }
  }
}

/**
 * Transfère la custode d'un lot sur la blockchain.
 * Retourne toujours un txHash — simulé si la transaction échoue.
 */
export async function transferCustodyOnChain(tokenId, toAddress, newStatus) {
  // Sans tokenId valide on ne peut pas interagir avec le contrat
  if (!tokenId) {
    return { txHash: simulatedTxHash(), simulated: true }
  }

  try {
    const contract = getContract()
    const statusCode = STATUS_CODES[newStatus] ?? 1

    const tx = await contract.transferCustody(
      tokenId,
      toAddress,
      statusCode,
      { gasLimit: 200_000 }
    )
    const receipt = await tx.wait(1)
    return { txHash: receipt.hash, simulated: false }
  } catch (err) {
    console.error('[blockchain] transferCustody échoué, hash simulé:', err.message)
    return { txHash: simulatedTxHash(), simulated: true }
  }
}
