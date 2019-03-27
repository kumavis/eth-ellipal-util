
const { getUrisForTx, decodeUri, encodeSignedTx, decodeSignedTx } = require('./index')

start()

function start() {
  console.log('============================================')
  console.log('simple send:')
  doSimpleEthSend()

  console.log('============================================')
  
  console.log('dai send:')
  doDaiSend()

  console.log('============================================')

  console.log('decode uri:')
  doDecodeUri()

  console.log('============================================')

  console.log('decode signed tx')
  doEncodeSignedTx()

  console.log('============================================')

  console.log('decode signed tx:')
  doDecodeSignedTx()
}

function doSimpleEthSend () {
  const fromAddress = '0x52bc44d5378309EE2abF1539BF71dE1b7d7bE3b5'
  const txParams = {
    nonce: '0x02',
    gasPrice: '0xd85d6780',
    gasLimit: '0x5208',
    to: '0x28DE163B8B3df23C27431AF5F85949065BBba5f1',
    value: '0x1234',
    chainId: '0x03',
  }

  const uris = getUrisForTx({ txParams, fromAddress })
  uris.forEach(uri => console.log(uri))
}

function doDaiSend () {
  const aType = 'ETH'
  const cType = 'DAI'
  const decimal = 18
  const fromAddress = '0x52bc44d5378309EE2abF1539BF71dE1b7d7bE3b5'
  const txParams = {
    "nonce": "0x01",
    "gasPrice": "0x903e4500",
    "gasLimit": "0xcc38",
    "to": "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    "value": "0x",
    "data": "0xa9059cbb00000000000000000000000028de163b8b3df23c27431af5f85949065bbba5f10000000000000000000000000000000000000000000000000de0b6b3a7640000",
    "chainId": "0x01"
  }

  const uris = getUrisForTx({ txParams, fromAddress, aType, cType, decimal })
  uris.forEach(uri => console.log(uri))
}

function doDecodeUri () {
  const uri = 'elp://tosign/ETH/0x52bc44d5378309EE2abF1539BF71dE1b7d7bE3b5/5QKE2F1ngIJSCJQo3hY7iz3yPCdDGvX4WUkGW7ul8YISNIADgIA=/ETH/18'
  const result = decodeUri(uri)
  
  console.log(JSON.stringify(result, null, 2))
}

function doEncodeSignedTx () {
  const txParams = {
    "r": "0x57e4645cad4b3be817b83ec5822afb3eb5216f3fea5620e5fc97aa3ed4d313d0",
    "s": "0x5c50321fe229d8b8f63b64b41f2768b3dc2c22fb60c8c8b0793cbf67ae7b1c36",
    "v": "0x25",
  }
  const encoded = encodeSignedTx(txParams)
  console.log(encoded)
}

function doDecodeSignedTx () {
  const chainId = '0x01'
  const encodedSignature = '57E4645CAD4B3BE817B83EC5822AFB3EB5216F3FEA5620E5FC97AA3ED4D313D05C50321FE229D8B8F63B64B41F2768B3DC2C22FB60C8C8B0793CBF67AE7B1C363163'
  const sig = decodeSignedTx({ encodedSignature, chainId })
  console.log(JSON.stringify(sig, null, 2))
}