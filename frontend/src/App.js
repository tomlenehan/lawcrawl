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
import ActivationPage from "./components/ActivationPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import ResetPasswordConfirmationPage from "./components/ResetPasswordConfirmPage";
import ChatPage from "./components/ChatPage";
import TermsOfServicePage from "./components/TermsOfServicePage";
import BlogPostPage from "./components/BlogPostPage";
import BlogListPage from "./components/BlogListPage";
import AccountPage from "./components/AccountPage";


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
                                <Route path="/account" element={<AccountPage/>}/>
                                <Route path='/activation/:uid/:token' element={<ActivationPage/>}/>
                                <Route path='/reset_password' element={<ResetPasswordPage/>}/>
                                <Route path='/password/reset/confirm/:uid/:token' element={<ResetPasswordConfirmationPage/>}/>
                                <Route path="/upload" element={<UploadPage/>}/>
                                <Route path="/chat" element={<ChatPage/>}/>
                                <Route path="/terms" element={<TermsOfServicePage/>}/>
                                <Route path="/blog_post/:id" element={<BlogPostPage/>}/>
                                <Route path="/blog_list" element={<BlogListPage/>}/>

                                {/*example of pw protected route*/}
                                {/*<PasswordProtectedRoute path="/" element={<HomePage/>}/>*/}
                            </Routes>
                        </div>
                    </Layout>
                </BrowserRouter>
            </Provider>
        </ThemeProvider>
    );
}
