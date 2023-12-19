import React, { useEffect } from "react";
import {Provider} from "react-redux";
import {Routes, Route, BrowserRouter, useLocation, RouterProvider} from "react-router-dom";
// import PasswordProtectedRoute from './components/PasswordProtectedRoute';
import Layout from "./components/Layout";
import store from "./store";
import theme from './components/Theme';
import CssBaseline from '@mui/material/CssBaseline';
import {ThemeProvider} from '@mui/material/styles';
import {makeStyles} from "@material-ui/core";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import UploadPage from "./components/UploadPage";
import ChatPage from "./components/ChatPage";
import TermsOfServicePage from "./components/TermsOfServicePage";


const bodyStyles = makeStyles(() => ({
    htmlBody: {
        height: '100%',
        width: '100%',
        margin: 0,
        padding: 0,
        backgroundColor: '#B2DFDB',
        color: '#3a3a3a',
        fontFamily: 'Roboto, sans-serif',
    },
}));

// const tagManagerArgs = {
//     gtmId: 'GTM-5L4W47L'
// }

// TagManager.initialize(tagManagerArgs)

export default function App() {

    const bodyClasses = bodyStyles();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Provider store={store}>
                <BrowserRouter>
                    <Layout>
                        <div className={bodyClasses.htmlBody}>
                            <Routes>
                                <Route path="/" element={<HomePage/>}/>
                                <Route path="/home" element={<HomePage/>}/>
                                <Route path="/login" element={<LoginPage/>}/>
                                <Route path="/signup" element={<SignupPage/>}/>
                                <Route path="/upload" element={<UploadPage/>}/>
                                <Route path="/chat" element={<ChatPage/>}/>
                                <Route path="/terms" element={<TermsOfServicePage/>}/>

                                {/*<PasswordProtectedRoute path="/" element={<HomePage/>}/>*/}
                                {/*<PasswordProtectedRoute path="/home" element={<HomePage/>}/>*/}
                                {/*<PasswordProtectedRoute path="/login" element={<LoginPage/>}/>*/}
                                {/*<PasswordProtectedRoute path="/upload" element={<UploadPage/>}/>*/}
                                {/*<PasswordProtectedRoute path="/chat" element={<ChatPage/>}/>*/}

                            </Routes>
                        </div>
                    </Layout>
                </BrowserRouter>
            </Provider>
        </ThemeProvider>
    );
}
