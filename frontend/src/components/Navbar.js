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
        height: 50,
        position: 'relative',
        zIndex: 5,
        boxShadow: 'none',
        border: 'none',
    },
    menuButton: {
        color: '#3a3a3a',
        textTransform: 'none',
    },
    title: {
        flexGrow: 1,
        color: '#3a3a3a',
    },
    logo: {
        width: '40px',
        marginRight: '5px',
        color: '#3a3a3a',
    },
    toolbar: {
        justifyContent: 'space-between',
        boxShadow: 'none',
    },
    loginButton: {
        backgroundColor: '#80cbc4',
        textTransform: 'none',
        color: '#3a3a3a',
        '&:hover': {
            backgroundColor: '#26a69a',
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
                <box>
                    <Button className={classes.menuButton} color="inherit" component={Link}
                            to="/upload">
                        Upload
                    </Button>
                    {userCases && userCases.length > 0 && (
                        <Button className={classes.menuButton} color="inherit" component={Link}
                                to="/chat">
                            Chat
                        </Button>
                    )}
                </box>
            )}
        </>
    );


    return (
        <ThemeProvider theme={theme}>
            <AppBar component="nav" position="static" className={classes.appBar}>
                <Toolbar className={classes.toolbar} variant="dense">
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Button color="inherit" component={Link} to="/">
                                <img src={`${config.STATIC_URL}images/logos/LogoMD.png`}
                                     className={classes.logo}/>
                            </Button>

                            {/*Menu for screens larger than xs */}
                            <Hidden xsDown>
                                {renderMenuItems()}
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
                                            <MenuItem
                                                onClick={handleMobileMenuClose}
                                                component={Link}
                                                to="/upload"
                                            >
                                                Upload
                                            </MenuItem>

                                            {userCases && userCases.length > 0 && (
                                                <MenuItem
                                                    onClick={handleMobileMenuClose}
                                                    component={Link}
                                                    to="/chat"
                                                >
                                                    Chat
                                                </MenuItem>
                                            )}
                                        </Box>
                                    )}

                                < /Menu>
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
                                    logout
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
