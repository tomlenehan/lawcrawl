import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import theme from './Theme';
import {
    ThemeProvider,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Link as MuiLink,
    Button, Container, Box
} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {Link, useParams} from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Grid from "@material-ui/core/Grid";
import config from "./config";
import Footer from "./Footer";

const contentful = require('contentful');

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
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        marginBottom: 20,
        maxWidth: 220,
    },
    card: {
        maxWidth: 800,
        margin: 'auto',
    },
    media: {
        height: 300,
    },
    title: {
        fontWeight: 'bold',
        color: '#3a3a3a',
        marginBottom: theme.spacing(2),
    },
    content: {
        marginTop: theme.spacing(2),
        color: '#3a3a3a',
    },
    backButton: {
        backgroundColor: '#80cbc4',
        borderRadius: '50px',
        color: '#3a3a3a',
        textTransform: 'none',
        padding: '4px 25px',
        width: 165,
        height: 40,
        marginTop: 10,
        "&:hover": {
            backgroundColor: '#26a69a',
        },
    },
}));

const BlogPostPage = ({isAuthenticated}) => {
    const classes = useStyles();
    const [blogPost, setBlogPost] = useState(null);
    let {id} = useParams();

    const client = contentful.createClient({
        space: '2fv6bnf49mi7',
        environment: 'master',
        accessToken: 'ArdbUL67iqccrue3LoaydRznq-5MT9jGhgteDtJKCW4'
    });

    useEffect(() => {
        const getEntryById = async () => {
            try {
                const entry = await client.getEntry(id);
                setBlogPost(entry);
            } catch (error) {
                console.log(`Error fetching blog post ${error}`);
            }
        };
        getEntryById();
    }, [id]);

    if (!blogPost) {
        return <div>Loading...</div>; // Or any other loading indicator
    }

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
                                {blogPost.fields.blogTitle}
                            </Typography>

                        </Grid>

                        <Grid item xs={12}>
                            {/* Back Button */}
                            <Button
                                variant="contained"
                                className={classes.backButton}
                                component={Link}
                                to="/blog_list"
                                startIcon={<ArrowBackIcon/>}
                            >
                                Back to Posts
                            </Button>
                        </Grid>

                    </Grid>

                    <Card className={classes.card}>
                        <CardMedia
                            className={classes.media}
                            image={blogPost.fields.blogImage.fields.file.url}
                            title={blogPost.fields.blogTitle}
                        />
                        <CardContent>
                            <Typography variant="h4" className={classes.title}>
                                {blogPost.fields.blogTitle}
                            </Typography>

                            <Typography variant="caption">
                                By <MuiLink
                                href="https://lawcrawl.com/">{blogPost.fields.blogAuthor}</MuiLink> -
                                {blogPost.fields.createdDate ?
                                    new Intl.DateTimeFormat('en-GB', {
                                        month: 'long',
                                        day: '2-digit',
                                        year: 'numeric',
                                    }).format(new Date(blogPost.fields.createdDate))
                                    : 'No date available'}
                            </Typography>

                            <Typography variant="body1" className={classes.content}>
                                <ReactMarkdown>
                                    {blogPost.fields.postContent}
                                </ReactMarkdown>
                            </Typography>

                        </CardContent>
                    </Card>
                </Container>
            </Box>
            <Footer/>
        </ThemeProvider>
    );
};

export default BlogPostPage;
