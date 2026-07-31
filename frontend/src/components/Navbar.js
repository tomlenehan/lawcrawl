import React, {useState} from 'react';
import {
    AppBar,
    Toolbar,
    Button,
    makeStyles,
    Grid,
    ThemeProvider,
    Hidden,
    Menu,
    MenuItem,
    IconButton
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import {Box} from '@material-ui/core';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {logout} from '../actions/auth';
import theme from './Theme';
import config from './config';

const useStyles = makeStyles((theme) => ({
    appBar: {
        minHeight: 64,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(14px)',
        color: '#202124',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(15, 118, 110, 0.12)',
    },
    menuButton: {
        display: 'inline-block',
        color: '#344054',
        textTransform: 'none',
        fontWeight: 700,
        padding: theme.spacing(0.75, 1.5),
        borderRadius: 6,
        '&:hover': {
            backgroundColor: 'rgba(15, 118, 110, 0.08)',
            color: '#0f766e',
        },
    },
    title: {
        flexGrow: 1,
        color: '#202124',
    },
    logo: {
        width: 34,
        height: 34,
        marginRight: 9,
        color: '#202124',
    },
    toolbar: {
        justifyContent: 'space-between',
        boxShadow: 'none',
        minHeight: 64,
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
        [theme.breakpoints.down('xs')]: {
            paddingLeft: theme.spacing(1.5),
            paddingRight: theme.spacing(1.5),
        },
    },
    brandButton: {
        color: '#202124',
        textTransform: 'none',
        padding: theme.spacing(0.5, 1),
        marginRight: theme.spacing(1),
        borderRadius: 6,
        '&:hover': {
            backgroundColor: 'rgba(15, 118, 110, 0.08)',
        },
    },
    brandText: {
        fontFamily: 'DMSans, sans-serif',
        fontWeight: 800,
        fontSize: 18,
        color: '#202124',
    },
    navCluster: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: theme.spacing(0.5),
    },
    loginButton: {
        backgroundColor: '#0f766e',
        textTransform: 'none',
        color: '#ffffff',
        borderRadius: 6,
        fontWeight: 800,
        minWidth: 92,
        boxShadow: 'none',
        '&:hover': {
            backgroundColor: '#0b5f59',
            boxShadow: 'none',
        },
    },
}));


const Navbar = ({isAuthenticated, logout, userCases}) => {

    const classes = useStyles();

    const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

    const handleMobileMenuOpen = (event) => {
        setMobileMenuAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMenuAnchorEl(null);
    };

    const renderMenuItems = () => (
        <>
            <Button className={classes.menuButton} color="inherit" component={Link}
                    to="/blog_list">
                Blog
            </Button>
            {isAuthenticated && (
                <>
                    {/*<Button className={classes.menuButton} color="inherit" component={Link}*/}
                    {/*        to="/upload">*/}
                    {/*    Upload*/}
                    {/*</Button>*/}
                    {/*{userCases && userCases.length > 0 && (*/}
                        <Button className={classes.menuButton} color="inherit" component={Link}
                                to="/chat">
                            Chat
                        </Button>
                    {/*)}*/}
                </>
            )}
        </>
    );


    return (
        <ThemeProvider theme={theme}>
            <AppBar component="nav" position="static" className={classes.appBar}>
                <Toolbar className={classes.toolbar} variant="dense">
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Button className={classes.brandButton} color="inherit" component={Link} to="/">
                                <img src={`${config.STATIC_URL}images/logos/LogoMD.png`}
                                     className={classes.logo}
                                     alt="Lawcrawl"/>
                                <span className={classes.brandText}>Lawcrawl</span>
                            </Button>

                            {/*Menu for screens larger than xs */}
                            <Hidden xsDown>
                                <Box className={classes.navCluster}>
                                    {renderMenuItems()}
                                </Box>
                            </Hidden>

                            {/* Menu for xs screens */}
                            <Hidden smUp>
                                <IconButton
                                    edge="start"
                                    className={classes.menuButton}
                                    color="inherit"
                                    aria-label="menu"
                                    onClick={handleMobileMenuOpen}
                                >
                                    <MenuIcon/>
                                </IconButton>
                                <Menu
                                    anchorEl={mobileMenuAnchorEl}
                                    keepMounted
                                    open={Boolean(mobileMenuAnchorEl)}
                                    onClose={handleMobileMenuClose}
                                >
                                    <Box>
                                        <MenuItem
                                            onClick={handleMobileMenuClose}
                                            component={Link}
                                            to="/blog_list"
                                        >
                                            Blog
                                        </MenuItem>
                                    </Box>
                                    {isAuthenticated && (
                                        <Box>
                                            {/*<MenuItem*/}
                                            {/*    onClick={handleMobileMenuClose}*/}
                                            {/*    component={Link}*/}
                                            {/*    to="/upload"*/}
                                            {/*>*/}
                                            {/*    Upload*/}
                                            {/*</MenuItem>*/}

                                            {/*{userCases && userCases.length > 0 && (*/}
                                            <MenuItem
                                                onClick={handleMobileMenuClose}
                                                component={Link}
                                                to="/chat"
                                            >
                                                Chat
                                            </MenuItem>
                                            {/*)}*/}
                                        </Box>
                                    )}

                                </Menu>
                            </Hidden>
                        </Grid>

                        <Grid item>

                            {isAuthenticated && (
                                <Button
                                    className={classes.menuButton}
                                    color="inherit"
                                    component={Link}
                                    to="/account"
                                    startIcon={<AccountCircle />}
                                >
                                    Account
                                </Button>
                            )}

                            {isAuthenticated ? (
                                <Button className={classes.menuButton} color="inherit"
                                        href="/" onClick={logout}>
                                    Logout
                                </Button>
                            ) : (
                                <Button
                                    className={classes.loginButton}
                                    color="inherit"
                                    component={Link}
                                    to="/login"
                                >
                                    Login
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        </ThemeProvider>
    );
};

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
    userCases: state.userCases,
});
export default connect(mapStateToProps, {
    logout
})(Navbar);
