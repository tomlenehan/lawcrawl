import React, {useEffect} from 'react'
import Navbar from "./Navbar";
import {twitterAuthenticate} from "../actions/auth";
import {googleAuthenticate} from "../actions/auth";
import {checkAuthenticated, load_user} from '../actions/auth';
import {connect} from "react-redux";
import {useLocation} from "react-router-dom";
import queryString from "query-string";
import {GATrackPageViews} from "./GATrackPageViews";
import Hotjar from '@hotjar/browser';

const Layout = (props) => {
    const location = useLocation()

    const siteId = 3808648;
    const hotjarVersion = 6;

    Hotjar.init(siteId, hotjarVersion);

    // Check if user is authenticated
    // useEffect(() => {
    //     checkAuthenticated();
    //     load_user();
    // }, []);

    // Scroll to top effect
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    // Twitter authentication effect
    useEffect(() => {
        const values = queryString.parse(location.search);
        const state = values.redirect_state ? values.redirect_state : null;
        const code = values.oauth_token ? values.oauth_token : null;
        const verifier = values.oauth_verifier ? values.oauth_verifier : null;
        if (state && code && verifier) {
            props.twitterAuthenticate(state, code, verifier);
        }
    }, [location]);

    // Google authentication effect
    useEffect(() => {
        const values = queryString.parse(location.search);
        const state = values.state ? values.state : null;
        const code = values.code ? values.code : null;
        if (state && code) {
            props.googleAuthenticate(state, code);
        }
    }, [location]);

    return (
        <div className="container">
            <Navbar/>
            <GATrackPageViews/>
            {props.children}
        </div>
    )
}

export default connect(null, {twitterAuthenticate, googleAuthenticate})(Layout)
