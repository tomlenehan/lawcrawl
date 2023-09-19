import React, { useState } from 'react';
import {
    AppBar as MuiAppBar,
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
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { logout } from '../actions/auth';
import theme from './Theme';
import config from './config';

const useStyles = makeStyles((theme) => ({
    menuButton: {
        fontFamily: 'DMSans, sans-serif',
    },
    title: {
        flexGrow: 1,
    },
    logo: {
        width: '50px',
        marginRight: '10px',
    },
    toolbar: {
        justifyContent: 'space-between', // Adjusted justifyContent
        boxShadow: '0px 1px 5px 0px rgba(0, 0, 0, 0.2)',
    },
    loginButton: {
        backgroundColor: theme.palette.secondary.main,
        '&:hover': {
            backgroundColor: theme.palette.secondary.dark,
        },
    },
}));



const Navbar = ({isAuthenticated, logout}) => {

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
            <Button className={classes.menuButton} color="inherit" component={Link} to="/chat">
                Chat
            </Button>
        </>
    );

    return (
        <ThemeProvider theme={theme}>
            <MuiAppBar position="static">
                <Toolbar className={classes.toolbar} variant="dense">
                    <Grid container justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Button color="inherit" component={Link} to="/">
                                <img src={`${config.STATIC_URL}images/logos/LawcrawlLogo.png`} className={classes.logo} />
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
                                    <MenuIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={mobileMenuAnchorEl}
                                    keepMounted
                                    open={Boolean(mobileMenuAnchorEl)}
                                    onClose={handleMobileMenuClose}
                                >
                                    <MenuItem onClick={handleMobileMenuClose} component={Link} to="/chat">Chat</MenuItem>
                                </Menu>
                            </Hidden>
                        </Grid>

                        <Grid item>
                            {isAuthenticated ? (
                                <Button className={classes.menuButton} color="inherit" href="/" onClick={logout}>
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
            </MuiAppBar>
        </ThemeProvider>
    );
};

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
});
export default connect(mapStateToProps, {logout})(Navbar);
