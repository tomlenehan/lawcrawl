import React, {useEffect} from 'react'
import Navbar from "./Navbar";
import {twitterAuthenticate} from "../actions/auth";
import {connect} from "react-redux";
import {useLocation} from "react-router-dom";
import queryString from "query-string";


const Layout = (props) => {
    const location = useLocation()

    // Scroll to top effect
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location]);

    useEffect(() => {
        const values = queryString.parse(location.search);
        const state = values.redirect_state ? values.redirect_state : null;
        const code = values.oauth_token ? values.oauth_token : null;
        const verifier = values.oauth_verifier ? values.oauth_verifier : null;
        if (state && code && verifier) {
            props.twitterAuthenticate(state, code, verifier);
        }
    }, [location])

    return (
        <div className="container">
            <Navbar/>
            {props.children}
        </div>
    )
}

export default connect(null, {twitterAuthenticate})(Layout)
