export const DATA_SOURCES = ['All sources', 'Uniswap v2', 'Uniswap v3', 'Curve', 'Sushiswap v2', 'Balancer'];

export const DATA_SOURCES_MAP = {
  'All sources': 'all',
  'Uniswap v2': 'uniswapv2',
  'Uniswap v3': 'uniswapv3',
  Curve: 'curve',
  'Sushiswap v2': 'sushiswapv2',
  'Balancer': 'balancer'
};

export const SLIPPAGES_BPS = Array.from({ length: 20 }).map((_v, i) => (i + 1) * 100);

export const MORPHO_RISK_PARAMETERS_ARRAY = [
  {
    ltv: 0.98,
    bonus: 50,
    visible: false,
    color: '#2E96FF'
  },
  {
    ltv: 0.965,
    bonus: 100,
    visible: true,
    color: '#B800D8'
  },
  {
    ltv: 0.945,
    bonus: 150,
    visible: true,
    color: '#FFA726'
  },
  
  {
    ltv: 0.915,
    bonus: 250,
    visible: true,
    color: '#EF5350'
  },
  {
    ltv: 0.86,
    bonus: 400,
    visible: true,
    color: '#C91B63'
  },
  {
    ltv: 0.77,
    bonus: 700,
    visible: true,
    color: '#00A3A0'
  },
  {
    ltv: 0.625,
    bonus: 1250,
    visible: true,
    color: '#173A5E'
  }
];
