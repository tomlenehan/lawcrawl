import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from 'react-ga4';

export function GATrackPageViews() {
    let location = useLocation();

    useEffect(() => {
        ReactGA.send({ hitType: 'pageview', page: location.pathname });
    }, [location]);

    return null;
}
