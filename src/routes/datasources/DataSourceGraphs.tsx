import { useEffect, useState } from 'react';
import { LiquidityData, Pair } from '../../models/ApiData';
import DataService from '../../services/DataService';
import { Box, Grid, LinearProgress, Skeleton, Typography } from '@mui/material';
import { SimpleAlert } from '../../components/SimpleAlert';
import { FriendlyFormatNumber, PercentageFormatter, sleep } from '../../utils/Utils';
import moment from 'moment';
import Graph from '../../components/Graph';
export interface DataSourceGraphsInterface {
  pair: Pair;
  platform: string;
  targetSlippage: number;
}

function DataSourceGraphsSkeleton() {
  return (
    <Grid mt={5} container spacing={0}>
      <LinearProgress color="secondary" sx={{ position: 'absolute', bottom: 5, left: 0, width: '100vw' }} />
      <Grid item xs={12}>
        <Skeleton height={500} variant="rectangular" />
      </Grid>
    </Grid>
  );
}

export function DataSourceGraphs(props: DataSourceGraphsInterface) {
  const [liquidityData, setLiquidityData] = useState<LiquidityData>();
  const [isLoading, setIsLoading] = useState(true);
  const [openAlert, setOpenAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [showVolatility, setShowVolatility] = useState(true);

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  useEffect(() => {
    setIsLoading(true);
    // Define an asynchronous function
    async function fetchDataForPair() {
      try {
        const data = await DataService.GetLiquidityData(props.platform, props.pair.base, props.pair.quote);

        setLiquidityData(data);
        if(Object.values(data.liquidity).some(_ => _.volatility == -1)) {
          setShowVolatility(false);
        } else {
          setShowVolatility(true);
        }
        await sleep(1);
      } catch (error) {
        console.error('Error fetching data:', error);
        setOpenAlert(true);
        setIsLoading(false);
        if (error instanceof Error) {
          setAlertMsg(`${error.toString()}`);
        } else {
          setAlertMsg(`Unknown error`);
        }
      }
    }

    // Call the asynchronous function
    fetchDataForPair()
      .then(() => setIsLoading(false))
      .catch(console.error);

    // You can also return a cleanup function from useEffect if needed
    return () => {
      // Perform cleanup if necessary
    };
    // platform is not in the deps for this hooks because we only need to reload the data
    // if the pair is changing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pair.base, props.pair.quote]);

  if (!liquidityData) {
    return <DataSourceGraphsSkeleton />;
  }

  const updated = moment(liquidityData.updated).fromNow();

  return (
    <>
      {isLoading ? (
        <DataSourceGraphsSkeleton />
      ) : (
        <Grid width={'100vw'} container spacing={0}>
          <Grid item xs={12}>
            <Typography
              textAlign={'center'}
              mt={2}
            >{`${props.pair.base}/${props.pair.quote} data over 180 days (updated ${updated})`}</Typography>
          </Grid>

          {/* Avg liquidity graph */}
          <Grid item xs={12} lg={6}>
            <Graph
              title={`${props.pair.base}/${props.pair.quote} liquidity (30d avg)`}
              xAxisData={Object.keys(liquidityData.liquidity).map((_) => Number(_))}
              xAxisLabel="Date"
              leftYAxis={{ min: 0, formatter: FriendlyFormatNumber }}
              leftAxisSeries={[
                {
                  label: `${props.pair.base} Liquidity`,
                  data: Object.values(liquidityData.liquidity).map((_) => _.avgSlippageMap[props.targetSlippage]),
                  formatter: FriendlyFormatNumber
                }
              ]}
            />
          </Grid>


          {showVolatility ? 
          <Grid item xs={12} lg={6}>
            <Graph
              title={`${props.pair.base}/${props.pair.quote} price and volatility`}
              xAxisData={Object.keys(liquidityData.liquidity).map((_) => Number(_))}
              xAxisLabel="Date"
              leftYAxis={{
                max: Math.max(...Object.values(liquidityData.liquidity).map((_) => _.priceMax)) * 1.1,
                min: Math.min(...Object.values(liquidityData.liquidity).map((_) => _.priceMin)) * 0.9,
                formatter: FriendlyFormatNumber
              }}
              rightYAxis={{
                min: 0,
                max: Math.max(
                  10 / 100,
                  Math.max(...Object.values(liquidityData.liquidity).map((_) => _.volatility)) * 1.1
                ),
                formatter: PercentageFormatter
              }}
              leftAxisSeries={[
                {
                  label: `price median (1d)`,
                  data: Object.values(liquidityData.liquidity).map((_) => _.priceMedian),
                  formatter: FriendlyFormatNumber
                },
                {
                  label: `price min (1d)`,
                  data: Object.values(liquidityData.liquidity).map((_) => _.priceMin),
                  formatter: FriendlyFormatNumber
                },
                {
                  label: `price max (1d)`,
                  data: Object.values(liquidityData.liquidity).map((_) => _.priceMax),
                  formatter: FriendlyFormatNumber
                }
              ]}
              rightAxisSeries={[
                {
                  label: 'volatility',
                  data: Object.values(liquidityData.liquidity).map((_) => _.volatility),
                  formatter: PercentageFormatter
                }
              ]}
            />
          </Grid>
          : <Grid item xs={12} lg={6}>
             <Box sx={{textAlign: 'center', mt: 10}}>No volatility data to show.</Box>
            </Grid>
            }
        </Grid>
      )}

      <SimpleAlert alertMsg={alertMsg} handleCloseAlert={handleCloseAlert} openAlert={openAlert} />
    </>
  );
}
