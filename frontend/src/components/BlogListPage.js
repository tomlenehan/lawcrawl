import React, {useEffect, useState} from "react";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import theme from './Theme';
import {
    ThemeProvider,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Link as MuiLink, Box, Container, TextField
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import Pagination from '@material-ui/lab/Pagination';
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import config from "./config";
import Footer from "./Footer";


const contentful = require('contentful')

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        overflowY: "auto",
        justifyContent: "center",
        minHeight: "100vh",
        paddingBottom: 35,
        backgroundColor: '#f6f8f6',
    },
    contentContainer: {
        display: "flex",
        flexDirection: "column",
        paddingTop: theme.spacing(7),
        paddingBottom: theme.spacing(5),
        alignItems: "center",
        textAlign: "center",
    },
    card: {
        height: '100%',
        margin: 'auto',
        marginBottom: theme.spacing(2),
        backgroundColor: '#ffffff',
        borderRadius: 8,
        border: '1px solid rgba(15, 118, 110, 0.12)',
        boxShadow: 'none',
        overflow: 'hidden',
        transition: 'transform 160ms ease, border-color 160ms ease',
        '&:hover': {
            transform: 'translateY(-2px)',
            borderColor: 'rgba(15, 118, 110, 0.28)',
        },
    },
    media: {
        height: 172,
    },
    button: {
        marginTop: theme.spacing(1),
    },
    title: {
        fontWeight: 'bold',
        color: '#202124',
    },
    subTitle: {
        color: '#667085',
        lineHeight: 1.6,
        marginTop: theme.spacing(1.5),
    },
    mainLogo: {
        width: 76,
        margin: '0 auto',
        display: 'block',
        marginBottom: theme.spacing(2),
    },
    loginHeadline: {
        fontFamily: "DMSans, sans-serif",
        marginBottom: theme.spacing(1),
        color: '#202124',
        fontWeight: 900,
    },
    headlineContainer: {
        display: "flex",
        color: '#202124',
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        marginBottom: theme.spacing(4),
        maxWidth: 640,
    },
    readMoreButton: {
        backgroundColor: '#0f766e',
        borderRadius: 6,
        color: '#ffffff',
        textTransform: 'none',
        padding: '8px 18px',
        width: 140,
        height: 42,
        marginTop: 22,
        boxShadow: 'none',
        fontWeight: 800,
        "&:hover": {
            backgroundColor: '#0b5f59',
            boxShadow: 'none',
        },
        '& .MuiButton-startIcon': {
            margin: 0,
        },
    },
    searchButton: {
        height: 43,
        marginTop: 10,
        backgroundColor: '#0f766e',
        borderRadius: 6,
        color: '#ffffff',
        textTransform: 'none',
        width: 52,
        minWidth: 52,
        boxShadow: 'none',
        "&:hover": {
            backgroundColor: '#0b5f59',
            boxShadow: 'none',
        },
    },
    textField: {
        minWidth: 280,
        marginTop: 12,
        width: '100%',
        color: '#202124',
        [theme.breakpoints.down('xs')]: {
            minWidth: 0,
        },
    },
    blackLabel: {
        color: '#667085',
    },
    creamInput: {
        backgroundColor: '#ffffff',
    },
}));

const BlogListPage = ({isAuthenticated}) => {
    const classes = useStyles();
    const [blogPosts, setBlogPosts] = useState([])
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPosts, setTotalPosts] = useState(0);
    const postsPerPage = 24;

    useEffect(() => {
        getAllEntries();
    }, [currentPage]);

    const client = contentful.createClient({
        space: '2fv6bnf49mi7',
        environment: 'master',
        accessToken: 'ArdbUL67iqccrue3LoaydRznq-5MT9jGhgteDtJKCW4'
    })

    const getAllEntries = async () => {
        try {
            const response = await client.getEntries({
                content_type: 'blogPost',
                limit: postsPerPage,
                skip: (currentPage - 1) * postsPerPage,
                'fields.blogTitle[match]': searchQuery,
                'fields.published': true,
            });

            setBlogPosts(response.items);
            setTotalPosts(response.total);
        } catch (error) {
            console.log(`Error fetching blog posts: ${error}`);
        }
    };


    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        getAllEntries();
        window.scrollTo(0, 0);
    };


    return (
        <ThemeProvider theme={theme}>
            <Box className={classes.root}>
                <Container className={classes.contentContainer}>

                    <Grid container className={classes.headlineContainer}>
                        <Grid item xs={12}>
                            <img src={`${config.STATIC_URL}images/logos/LogoLG.png`}
                                 alt="Lawcrawl Logo"
                                 className={classes.mainLogo}/>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography className={classes.loginHeadline} variant="h4"
                                        gutterBottom>
                                Law Blog
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" alignItems="center" justifyContent="center"
                                 marginBottom={2}>
                                <TextField
                                    label="Search Posts"
                                    variant="outlined"
                                    value={searchQuery}
                                    InputLabelProps={{className: classes.blackLabel}}
                                    InputProps={{
                                        className: classes.creamInput
                                    }}
                                    className={`${classes.textField}`}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            getAllEntries();
                                        }
                                    }}
                                    style={{marginRight: theme.spacing(1)}}
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => getAllEntries()}
                                    startIcon={<SearchIcon style={{fontSize: 25}} />}
                                    className={classes.searchButton}
                                    aria-label="Search posts"
                                >
                                    {/*Search*/}
                                </Button>
                            </Box>
                        </Grid>

                    </Grid>


                    <Grid container spacing={3} justifyContent="center" style={{marginTop: 10}}>
                        {Array.isArray(blogPosts) && blogPosts.length > 0 ? (
                            blogPosts.map((post) => (
                                <Grid item xs={12} md={4} key={post.sys.id}>
                                    <Card className={classes.card}>
                                        <CardMedia
                                            className={classes.media}
                                            image={post.fields.blogImage.fields.file.url}
                                            title={post.fields.title}
                                        />
                                        <CardContent>
                                            <Typography gutterBottom variant="h5" component="h2"
                                                        className={classes.title}>
                                                {post.fields.blogTitle}
                                            </Typography>

                                            <Typography variant="caption">
                                                By <MuiLink
                                                href="https://lawcrawl.com/">{post.fields.blogAuthor}</MuiLink>
                                                <br/>
                                                {post.fields.createdDate ?
                                                    new Intl.DateTimeFormat('en-GB', {
                                                        month: 'long',
                                                        day: '2-digit',
                                                        year: 'numeric',
                                                    }).format(new Date(post.fields.createdDate))
                                                    : 'No date available'}
                                            </Typography>

                                            <Typography variant="body2" color="textSecondary"
                                                        component="p"
                                                        className={classes.subTitle}>
                                                {post.fields.blogSummary}
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                className={classes.readMoreButton}
                                                component={Link}
                                                to={`/blog_post/${post.sys.id}`}
                                            >
                                                Read More
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        ) : (
                            <Typography variant="h6">No blog posts found or still
                                loading...</Typography>
                        )}
                    </Grid>

                    <Box display="flex" justifyContent="center" my={4}>
                        <Pagination
                            count={Math.ceil(totalPosts / postsPerPage)}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="secondary"
                            size="large"
                            variant="outlined"
                            shape="rounded"
                        />
                    </Box>

                </Container>
            </Box>
            <Footer/>
        </ThemeProvider>
    );
};

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
});
export default connect(mapStateToProps)(BlogListPage);
