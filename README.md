# eth-ellipal-util

[![Greenkeeper badge](https://badges.greenkeeper.io/kumavis/eth-ellipal-util.svg)](https://greenkeeper.io/)

a utility for encoding and decoding Ethereum transactions as qrcode URIs for the [ellipal](https://www.ellipal.com/) hardware wallet.


### example

```js
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
// elp://tosign/ETH/0x52bc44d5378309EE2abF1539BF71dE1b7d7bE3b5/5QKE2F1ngIJSCJQo3hY7iz3yPCdDGvX4WUkGW7ul8YISNIADgIA=/ETH/18
```