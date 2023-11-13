import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

const steps = [
    "Introduced in House",
    "Passed/agreed to in House",
    "Introduced in Senate",
    "Passed/agreed to in Senate",
    "President",
    "BecameLaw"
];

const StatusProgress = ({ bill_id }) => {
    const [progress, setProgress] = useState(0);
    const theme = useTheme();

    useEffect(() => {
        // Get bill actions from your backend
        axios.get(`/api/get_bill_actions/${bill_id}`)
            .then(response => {
                const actions = response.data;
                let step_index = 0;
                steps.forEach((step, index) => {
                    if (actions.some(action => action.text.startsWith(step))) {
                        step_index = index + 1;
                    }
                });
                setProgress((step_index / steps.length) * 100);
            })
            .catch(error => {
                console.error('Error fetching bill actions:', error);
            });

    }, [bill_id]);

    return (
        <Box sx={{ width: '100%', marginBottom: 0, marginTop: 20 }}>
            <Typography variant="body2" color="textSecondary" component="p" align="center">
               Progress
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
            <Typography align="center" color="primary" style={{ marginTop: 10, fontSize: 16 }}>
                {progress.toFixed(0)}%
            </Typography>
        </Box>
    );
};

export default StatusProgress;
