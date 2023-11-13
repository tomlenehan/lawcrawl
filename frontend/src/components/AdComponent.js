// AdComponent.js
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

// Define styles similar to your Chat component
const useStyles = makeStyles((theme) => ({
    adMessage: {
        backgroundColor: '#e0f2f1',
        display: 'flex',
        justifyContent: 'center',
    },
    adMessageCenter: {
        maxWidth: 640,
        marginRight: 'auto',
        display: 'flex',
        padding: 12,
        paddingLeft: 24,
        paddingRight: 24,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    text: {
        marginBottom: 8,
    },
    url: {
        color: '#1976d2',  // You can adjust the color to your preference
        textDecoration: 'none',
    },
    avatarAd: {
        backgroundColor: '#ffffff',
        borderRadius: '50%',
        minWidth: 40,
        height: 40,
        marginRight: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#80cbc4',
        fontWeight: 'bold',
    },
}));

function AdComponent() {
    const classes = useStyles();
    const [ads, setAds] = useState([]);
    const [randomAd, setRandomAd] = useState(null);

    useEffect(() => {
        fetch('/api/chat/ads/')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                setAds(data);
                if (data.length > 0) {
                    setRandomAd(data[Math.floor(Math.random() * data.length)]);  // Update randomAd state when ads are fetched
                }
            })
            .catch(error => console.error('There was a problem with your fetch operation:', error));
    }, []);


    const getRandomAd = () => {
        return ads[Math.floor(Math.random() * ads.length)];
    }

    console.log("random ad: "+randomAd);

return (
    <div className={classes.adMessage}>
        <div className={classes.adMessageCenter}>
            <div className={classes.avatarAd}>
                Ad
            </div>
            {randomAd && (  // Check if randomAd is not null before rendering
                <div>
                    <h3 className={classes.title}>{randomAd.title}</h3>
                    <p className={classes.text}>{randomAd.text}</p>
                    <a href={randomAd.url} className={classes.url}>Learn more</a>
                </div>
            )}
        </div>
    </div>
);
}

export default AdComponent;
