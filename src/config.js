export const PREPROD_CONFIG = {
  networkId: 'preprod',
  indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  proofServer: 'http://127.0.0.1:6300',
  explorerUrl: 'https://explorer.preprod.midnight.network',
};

export const PREVIEW_CONFIG = {
  networkId: 'preview',
  indexer: 'https://indexer.preview.midnight.network/api/v4/graphql',
  indexerWS: 'wss://indexer.preview.midnight.network/api/v4/graphql/ws',
  node: 'https://rpc.preview.midnight.network',
  proofServer: 'http://127.0.0.1:6300',
  explorerUrl: 'https://explorer.preview.midnight.network',
};

export const LOCAL_CONFIG = {
  networkId: 'local',
  indexer: 'http://127.0.0.1:8088/api/v1/graphql',
  indexerWS: 'ws://127.0.0.1:8088/api/v1/graphql/ws',
  node: 'http://127.0.0.1:9944',
  proofServer: 'http://127.0.0.1:6300',
  explorerUrl: 'http://127.0.0.1:3000',
};

export function getConfig(networkName = process.env.MIDNIGHT_NETWORK || 'preprod') {
  switch (networkName.toLowerCase()) {
    case 'preprod':
      return PREPROD_CONFIG;
    case 'preview':
      return PREVIEW_CONFIG;
    case 'local':
      return LOCAL_CONFIG;
    default:
      return PREPROD_CONFIG;
  }
}
