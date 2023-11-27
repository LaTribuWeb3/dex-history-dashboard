import { Box, Grid, InputAdornment, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import DataService from "../../services/DataService";
import { Pair } from "../../models/ApiData";
import { sleep } from "../../utils/Utils";
import { SimpleAlert } from "../../components/SimpleAlert";

export default function RiskLevels() {
    const [isLoading, setIsLoading] = useState(true);
    const [availablePairs, setAvailablePairs] = useState<Pair[]>([]);
    const [selectedPair, setSelectedPair] = useState<Pair>();
    const [openAlert, setOpenAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState('');

    const handleCloseAlert = () => {
        setOpenAlert(false);
    };
    const handleChangePair = (event: SelectChangeEvent) => {
        console.log(`handleChangePair: ${event.target.value}`);
        setSelectedPair({ base: event.target.value.split('/')[0], quote: event.target.value.split('/')[1] });
    };

    useEffect(() => {
        setIsLoading(true);
        // Define an asynchronous function
        async function fetchData() {
            try {
                const data = await DataService.GetAvailablePairs('all');
                setAvailablePairs(data);

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
    if (!selectedPair) {
        return <Box>BITCONNNEEEEEEEEEEECT</Box>;
    }
    return (<Box sx={{ mt: 10 }}>
        {isLoading ? (
            <Box>BITCONNNEEEEEEEEEEECT</Box>
        ) : (
            <Grid container spacing={1} alignItems="baseline">
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
                    <Typography textAlign={'right'}>Supply Cap ($M): </Typography>
                   
                </Grid>
                <Grid item xs={6} sm={3}>
                <TextField
                        required
                        id="supply-cap-input"
                        type="number"
                        label="Required"
                        defaultValue="100"
                        InputProps={{
                            startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                            endAdornment: <InputAdornment position='end'>M</InputAdornment>
                        }}
                    />
                </Grid>
            </Grid>
        )}

        <SimpleAlert alertMsg={alertMsg} handleCloseAlert={handleCloseAlert} openAlert={openAlert} />
    </Box>)
}