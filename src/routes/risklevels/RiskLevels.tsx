import { Box, Grid, InputAdornment, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import DataService from '../../services/DataService';
import { Pair } from '../../models/ApiData';
import { FriendlyFormatNumber, roundTo, sleep } from '../../utils/Utils';
import { SimpleAlert } from '../../components/SimpleAlert';
import { RiskLevelGraphs, RiskLevelGraphsSkeleton } from './RiskLevelGraph';

export default function RiskLevels() {
  const [isLoading, setIsLoading] = useState(true);
  const [availablePairs, setAvailablePairs] = useState<Pair[]>([]);
  const [selectedPair, setSelectedPair] = useState<Pair>();
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [supplyCap, setSupplyCap] = useState<number | undefined>(undefined);
  const [tokenPrice, setTokenPrice] = useState<number | undefined>(undefined);

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };
  const handleChangePair = (event: SelectChangeEvent) => {
    console.log(`handleChangePair: ${event.target.value}`);
    setSelectedPair({ base: event.target.value.split('/')[0], quote: event.target.value.split('/')[1] });
  };
  const handleChangeSupplyCap = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target && event.target.value) {
      setSupplyCap(Number(event.target.value));
    }
  };

  //// useEffect to load data
  useEffect(() => {
    setIsLoading(true);
    // Define an asynchronous function
    async function fetchData() {
      try {
        const data = await DataService.GetAvailablePairs('all');
        setAvailablePairs(
          data.filter((_) => _.quote === 'USDC' || _.quote === 'WETH').sort((a, b) => a.base.localeCompare(b.base))
        );

        const oldPair = selectedPair;

        if (oldPair && data.some((_) => _.base == oldPair.base && _.quote == oldPair.quote)) {
          setSelectedPair(oldPair);
        } else {
          setSelectedPair(data[0]);
        }
        await sleep(1); // without this sleep, update the graph before changing the selected pair. so let it here
      } catch (error) {
        console.error('Error fetching data:', error);
        setOpenAlert(true);
        setIsLoading(false);
        if (error instanceof Error) {
          setAlertMsg(`Error fetching data: ${error.toString()}`);
        } else {
          setAlertMsg(`Unknown error`);
        }
      }
    }
    fetchData()
      .then(() => setIsLoading(false))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    async function getTokenPrice() {
      try {
        if (!selectedPair) {
          return;
        }
        const data = await DataService.GetLiquidityData('all', selectedPair.base, selectedPair.quote);

        /// get token price
        const liquidityObjectToArray = Object.keys(data.liquidity).map((_) => parseInt(_));
        const maxBlock = Math.max.apply(null, liquidityObjectToArray).toString();
        const tokenPrice = data.liquidity[maxBlock].priceMedian;
        setTokenPrice(tokenPrice);
        if (selectedPair?.quote === 'USDC') {
          setSupplyCap(roundTo(100_000_000 / tokenPrice, 0));
        }
        if (selectedPair?.quote === 'WETH') {
          setSupplyCap(roundTo(50_000 / tokenPrice, 0));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setOpenAlert(true);
        setIsLoading(false);
        if (error instanceof Error) {
          setAlertMsg(`Error fetching data: ${error.toString()}`);
        } else {
          setAlertMsg(`Unknown error`);
        }
      }
    }
    getTokenPrice()
      .then(() => setIsLoading(false))
      .catch(console.error);
  }, [selectedPair]);

  if (!selectedPair || !tokenPrice || !supplyCap) {
    return <RiskLevelGraphsSkeleton />;
  }
  return (
    <Box sx={{ mt: 10 }}>
      {isLoading ? (
        <RiskLevelGraphsSkeleton />
      ) : (
        <Grid container spacing={1} alignItems="center">
          {/* First row: pairs select and slippage select */}
          <Grid item xs={6} sm={3}>
            <Typography textAlign={'right'}>Pair: </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Select
              labelId="pair-select"
              id="pair-select"
              value={`${selectedPair.base}/${selectedPair.quote}`}
              label="Pair"
              onChange={handleChangePair}
            >
              {availablePairs.map((pair, index) => (
                <MenuItem key={index} value={`${pair.base}/${pair.quote}`}>
                  {`${pair.base}/${pair.quote}`}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography textAlign={'right'}>Supply Cap: </Typography>
          </Grid>
          <Grid item xs={6} sm={3} sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <TextField
              required
              id="supply-cap-input"
              type="number"
              label="In Kind"
              value={supplyCap}
              onChange={handleChangeSupplyCap}
              InputProps={{
                endAdornment: <InputAdornment position="end">{selectedPair.base}</InputAdornment>
              }}
            />
            <Typography sx={{ ml: '10px' }}>
              {FriendlyFormatNumber(supplyCap * tokenPrice)} {selectedPair.quote}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <RiskLevelGraphs pair={selectedPair} supplyCap={supplyCap} platform={'all'} />
          </Grid>
        </Grid>
      )}

      <SimpleAlert alertMsg={alertMsg} handleCloseAlert={handleCloseAlert} openAlert={openAlert} />
    </Box>
  );
}
