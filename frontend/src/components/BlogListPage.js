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
    Link as MuiLink, Box, Container
} from '@material-ui/core';
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
        height: "100vh",
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
}));

const BlogListPage = ({isAuthenticated}) => {
    const classes = useStyles();

    const [blogPosts, setBlogPosts] = useState([])

    const client = contentful.createClient({
        space: '2fv6bnf49mi7',
        environment: 'master',
        accessToken: 'ArdbUL67iqccrue3LoaydRznq-5MT9jGhgteDtJKCW4'
    })

    useEffect(() => {
        const getAllEntries = async () => {
            try {
                const response = await client.getEntries();
                if (response.items) {
                    setBlogPosts(response.items);
                }
            } catch (error) {
                console.log(`Error fetching blog posts: ${error}`);
            }
        };
        getAllEntries();
    }, []);


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
                                Blog
                            </Typography>

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
