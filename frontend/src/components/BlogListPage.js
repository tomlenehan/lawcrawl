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
        overflowY: "scroll",
        justifyContent: "center",
        minHeight: "100vh",
        paddingBottom: 35,
    },
    contentContainer: {
        display: "flex",
        flexDirection: "column",
        paddingTop: 60,
        alignItems: "center",
        textAlign: "center",
    },
    card: {
        maxWidth: 600,
        margin: 'auto',
        marginBottom: theme.spacing(2),
        backgroundColor: '#fdfbee',
    },
    media: {
        height: 140,
    },
    button: {
        marginTop: theme.spacing(1),
    },
    title: {
        fontWeight: 'bold',
        color: '#3a3a3a',
    },
    subTitle: {
        color: '#3a3a3a',
    },
    mainLogo: {
        width: 100,
        margin: '0 auto',
        display: 'block',
    },
    loginHeadline: {
        fontFamily: "DMSans, sans-serif",
        marginBottom: 0,
        color: '#3a3a3a',
    },
    headlineContainer: {
        display: "flex",
        color: '#3a3a3a',
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        marginBottom: 20,
        maxWidth: 220,
    },
    readMoreButton: {
        backgroundColor: '#80cbc4',
        borderRadius: '50px',
        color: '#3a3a3a',
        textTransform: 'none',
        padding: '4px 25px',
        width: 140,
        height: 40,
        marginTop: 22,
        "&:hover": {
            backgroundColor: '#26a69a',
        },
    },
    searchButton: {
        height: 43,
        marginTop: 10,
                backgroundColor: '#80cbc4',
        borderRadius: '12px',
        color: '#3a3a3a',
        textTransform: 'none',
        width: 140,
        "&:hover": {
            backgroundColor: '#26a69a',
        },
    },
    textField: {
        minWidth: 210,
        marginTop: 12,
        width: '100%',
        color: '#3a3a3a',
    },
    blackLabel: {
        color: '#3a3a3a',
    },
    creamInput: {
        backgroundColor: '#fdfbee',
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
