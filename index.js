const assert = require('assert')
const rlp = require('rlp')
const stringExtractor = require('string-extractor')
const ethUtil = require('ethereumjs-util')

module.exports = { getUrisForTx, decodeUri, encodeSignedTx, decodeSignedTx }


function getUrisForTx ({ txParams, fromAddress, aType, cType, decimal }) {
  const encodedTx = encodeTx(txParams)
  
  const maxLength = 240
  if (encodedTx.length > maxLength) {
    const uris = []
    const codeCount = Math.ceil(encodedTx.length / maxLength)
    for (let index = 0; index < codeCount; index++) {
      const paginationPrefix = `${index+1}:${codeCount}`
      const encodedTxPart = encodedTx.slice(index * maxLength, (index + 1) * maxLength)
      const uri = encodeUri({ paginationPrefix, encodedTx: encodedTxPart, fromAddress, aType, cType, decimal })
      uris.push(uri)
    }
    return uris
  } else { 
    const uri = encodeUri({ encodedTx, fromAddress, aType, cType, decimal })
    return [uri]
  }
}

function encodeTx (txParams) {
  // txParams as used for hashing for signature
  const rlpEncoded = rlp.encode([
    txParams.nonce,
    txParams.gasPrice,
    txParams.gasLimit,
    txParams.to,
    txParams.value,
    txParams.data || '0x',
    // here, "v" is replaced by chainId (EIP155)
    txParams.chainId || '0x',
    '0x',
    '0x',
  ])
  const base64String = base64Encode(rlpEncoded)
  return base64String
}

function decodeTx (encodedTx) {
  const txBuffer = base64Decode(encodedTx)
  const decodedData = rlp.decode(txBuffer)
  const hexStringArray = decodedData.map(buf => '0x' + buf.toString('hex'))
  const txParams = {
    nonce: hexStringArray[0],
    gasPrice: hexStringArray[1],
    gasLimit: hexStringArray[2],
    to: hexStringArray[3],
    value: hexStringArray[4],
    data: hexStringArray[5],
    // here, "v" is replaced by chainId (EIP155)
    chainId: hexStringArray[6],
  }
  return txParams
}

function encodeUri ({ paginationPrefix, fromAddress, encodedTx, aType, cType, decimal }) {
  assert(fromAddress, 'encodeUri - must specify "fromAddress"')
  assert(encodedTx, 'encodeUri - must specify "encodedTx"')
  const _paginationPrefix = paginationPrefix ? (paginationPrefix + '@') : ''
  const _aType = aType || 'ETH'
  const _cType = cType || 'ETH'
  const _decimal = decimal !== undefined ? decimal : 18 
  // example: "elp://2:8@tosign/ETH/address/tx/POLY/decimal"
  const uri = `elp://${_paginationPrefix}tosign/${_aType}/${fromAddress}/${encodedTx}/${_cType}/${_decimal}`
  return uri
}

function decodeUri (uri) {
  const pattern = 'elp://((|*:*@))tosign/{{ aType: 3s }}/{{ fromAddress: 42s }}/{{ encodedTx: s }}/{{ cType: s }}/{{ decimals: d }}'
  const result = stringExtractor(pattern)(uri)
  assert(result, 'decodeUri - failed to parse uri')
  result.txParams = decodeTx(result.encodedTx)
  return result
}

// encodes a signature in the style of ellipal (rsv) with "v" as 27/28 (no EIP155)
function encodeSignedTx (txParams) {
  const r = ethUtil.toBuffer(txParams.r)
  const s = ethUtil.toBuffer(txParams.s)
  // calculate final "v" value, removing chainId (EIP155)
  let vNum = Number.parseInt(txParams.v, 16)
  if (vNum > 28) {
    vNum = 27 + (vNum % 2)
  }
  const v = Buffer.from(vNum.toString(16), 16)
  // finalize signature format
  const result = Buffer.concat([r, s, v]).toString('hex').toUpperCase()
  return result
}

function decodeSignedTx ({ encodedSignature, chainId }) {
  const buf = Buffer.from(encodedSignature, 'hex')
  const r = '0x' + buf.slice(0,32).toString('hex')
  const s = '0x' + buf.slice(32,64).toString('hex')
  const vRaw = '0x' + buf.slice(64).toString('hex')
  // calculate final "v" value, adjusting for chainId (EIP155)
  const vNum = Number.parseInt(vRaw, 16)
  const chainIdNum = chainId && Number.parseInt(chainId, 16)
  let vFinalNum = chainIdNum ? (vNum + 8 + 2 * chainIdNum) : vNum
  const v = '0x' + vFinalNum.toString(16)
  return { v, r, s }
}

// ellipal base64 only replaces "/" not "+" or "="
function base64Encode (buffer) {
  return buffer.toString('base64').split('/').join('_')
}

// nodejs accepts url-safe base64
function base64Decode (base64String) {
  return Buffer.from(base64String, 'base64')
}