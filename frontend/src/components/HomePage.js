import React from 'react';
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import DescriptionIcon from '@material-ui/icons/Description';
import FindInPageIcon from '@material-ui/icons/FindInPage';
import ChatIcon from '@material-ui/icons/Chat';
import Footer from "./Footer";
import theme from './Theme';
import {Box, Button, Container, ThemeProvider} from "@material-ui/core";
import LoginIcon from '@mui/icons-material/Login';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import {Link} from 'react-router-dom';
import config from './config';
import {connect} from "react-redux";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MailOutlineIcon from '@material-ui/icons/MailOutline';

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: "100vh",
        backgroundColor: '#f6f8f6',
        color: '#202124',
        overflowX: 'hidden',
    },
    heroSection: {
        position: 'relative',
        borderBottom: '1px solid rgba(15, 118, 110, 0.12)',
        backgroundColor: '#ffffff',
    },
    heroInner: {
        maxWidth: 1180,
        paddingTop: theme.spacing(9),
        paddingBottom: theme.spacing(8),
        [theme.breakpoints.down('sm')]: {
            paddingTop: theme.spacing(6),
            paddingBottom: theme.spacing(6),
        },
    },
    eyebrow: {
        color: '#0f766e',
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: 0,
        textTransform: 'uppercase',
        marginBottom: theme.spacing(1.5),
    },
    heroTitle: {
        color: '#202124',
        fontFamily: 'DMSans, sans-serif',
        fontSize: 64,
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: 0,
        marginBottom: theme.spacing(2),
        [theme.breakpoints.down('sm')]: {
            fontSize: 46,
        },
    },
    heroCopy: {
        maxWidth: 520,
        color: '#667085',
        fontSize: 19,
        lineHeight: 1.7,
        marginBottom: theme.spacing(3.5),
        [theme.breakpoints.down('sm')]: {
            fontSize: 17,
        },
    },
    ctaRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(1.5),
        marginBottom: theme.spacing(3),
    },
    primaryButton: {
        backgroundColor: '#0f766e',
        color: '#ffffff',
        borderRadius: 6,
        minHeight: 46,
        padding: theme.spacing(1.2, 2.75),
        boxShadow: 'none',
        textTransform: 'none',
        fontWeight: 800,
        '&:hover': {
            backgroundColor: '#0b5f59',
            boxShadow: 'none',
        },
    },
    secondaryButton: {
        backgroundColor: '#ffffff',
        color: '#202124',
        border: '1px solid rgba(32, 33, 36, 0.18)',
        borderRadius: 6,
        minHeight: 46,
        padding: theme.spacing(1.2, 2.75),
        boxShadow: 'none',
        textTransform: 'none',
        fontWeight: 800,
        '&:hover': {
            backgroundColor: '#f3f6f4',
            boxShadow: 'none',
        },
    },
    proofStrip: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(1),
        color: '#475467',
        fontSize: 13,
        fontWeight: 700,
    },
    proofItem: {
        border: '1px solid rgba(15, 118, 110, 0.16)',
        backgroundColor: '#f6f8f6',
        borderRadius: 6,
        padding: theme.spacing(0.75, 1.25),
    },
    visualWrap: {
        width: '100%',
        maxWidth: 620,
        marginLeft: 'auto',
        [theme.breakpoints.down('sm')]: {
            marginTop: theme.spacing(5),
            marginRight: 'auto',
        },
    },
    previewFrame: {
        overflow: 'hidden',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        border: '1px solid rgba(32, 33, 36, 0.12)',
        boxShadow: '0 22px 60px rgba(32, 33, 36, 0.14)',
    },
    previewToolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 48,
        padding: theme.spacing(0, 2),
        backgroundColor: '#202124',
        color: '#ffffff',
    },
    previewDots: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
    },
    previewDot: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: '#d0d5dd',
        opacity: 0.85,
    },
    previewTitle: {
        color: '#f2f4f7',
        fontSize: 13,
        fontWeight: 800,
    },
    previewBody: {
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: theme.spacing(2),
        padding: theme.spacing(2),
        backgroundColor: '#f8faf9',
        [theme.breakpoints.down('xs')]: {
            gridTemplateColumns: '1fr',
        },
    },
    documentPane: {
        minHeight: 280,
        borderRadius: 8,
        border: '1px solid rgba(32, 33, 36, 0.1)',
        backgroundColor: '#ffffff',
        padding: theme.spacing(2),
    },
    documentMeta: {
        color: '#667085',
        fontSize: 12,
        fontWeight: 800,
        marginBottom: theme.spacing(1),
    },
    docTitle: {
        color: '#202124',
        fontWeight: 900,
        fontSize: 21,
        marginBottom: theme.spacing(1.5),
    },
    docRows: {
        display: 'grid',
        gap: 9,
        marginBottom: theme.spacing(2),
    },
    docLine: {
        display: 'block',
        height: 8,
        borderRadius: 4,
        backgroundColor: '#e4e7ec',
    },
    highlightBox: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: theme.spacing(1.25),
        borderRadius: 8,
        border: '1px solid rgba(15, 118, 110, 0.18)',
        backgroundColor: '#e6f4f1',
        color: '#0f766e',
        padding: theme.spacing(1.5),
        '& svg': {
            flexShrink: 0,
            marginTop: 2,
        },
    },
    highlightTitle: {
        color: '#0b5f59',
        fontWeight: 900,
        fontSize: 14,
        marginBottom: 4,
    },
    highlightText: {
        color: '#344054',
        fontSize: 13,
        lineHeight: 1.5,
    },
    reviewPane: {
        display: 'grid',
        gap: theme.spacing(1.5),
    },
    statusBlock: {
        borderRadius: 8,
        border: '1px solid rgba(32, 33, 36, 0.1)',
        backgroundColor: '#ffffff',
        padding: theme.spacing(1.5),
    },
    statusHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing(1),
    },
    statusTitle: {
        color: '#202124',
        fontSize: 14,
        fontWeight: 900,
    },
    statusPill: {
        color: '#0f766e',
        backgroundColor: '#e6f4f1',
        borderRadius: 999,
        padding: theme.spacing(0.35, 1),
        fontSize: 11,
        fontWeight: 900,
    },
    issueList: {
        display: 'grid',
        gap: theme.spacing(1),
    },
    issueItem: {
        borderLeft: '3px solid #0f766e',
        paddingLeft: theme.spacing(1),
    },
    issueLabel: {
        color: '#202124',
        fontSize: 13,
        fontWeight: 900,
    },
    issueText: {
        color: '#667085',
        fontSize: 12,
        lineHeight: 1.45,
    },
    chatPreview: {
        borderRadius: 8,
        backgroundColor: '#202124',
        color: '#ffffff',
        padding: theme.spacing(1.5),
    },
    chatPrompt: {
        color: '#d0d5dd',
        fontSize: 12,
        fontWeight: 800,
        marginBottom: theme.spacing(1),
    },
    chatBubble: {
        backgroundColor: '#ffffff',
        color: '#202124',
        borderRadius: 8,
        padding: theme.spacing(1.25),
        fontSize: 13,
        lineHeight: 1.55,
    },
    insightPanel: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: theme.spacing(1),
        marginTop: theme.spacing(1.5),
        [theme.breakpoints.down('xs')]: {
            gridTemplateColumns: '1fr',
        },
    },
    insightTile: {
        backgroundColor: '#ffffff',
        border: '1px solid rgba(15, 118, 110, 0.14)',
        borderRadius: 8,
        padding: theme.spacing(1.5),
        textAlign: 'left',
    },
    insightLabel: {
        color: '#667085',
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 4,
    },
    insightValue: {
        color: '#202124',
        fontSize: 15,
        fontWeight: 800,
    },
    section: {
        paddingTop: theme.spacing(7),
        paddingBottom: theme.spacing(7),
    },
    sectionHeader: {
        maxWidth: 720,
        margin: '0 auto',
        textAlign: 'center',
        marginBottom: theme.spacing(4),
    },
    sectionTitle: {
        color: '#202124',
        fontFamily: 'DMSans, sans-serif',
        fontWeight: 900,
        fontSize: 34,
        letterSpacing: 0,
        marginBottom: theme.spacing(1.5),
    },
    sectionCopy: {
        color: '#667085',
        fontSize: 17,
        lineHeight: 1.7,
    },
    featureCard: {
        height: '100%',
        borderRadius: 8,
        border: '1px solid rgba(15, 118, 110, 0.14)',
        boxShadow: 'none',
        backgroundColor: '#ffffff',
    },
    featureContent: {
        padding: theme.spacing(3),
        textAlign: 'left',
    },
    cardIcon: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#e6f4f1',
        color: '#0f766e',
        marginBottom: theme.spacing(2),
        '& svg': {
            fontSize: 25,
        },
    },
    cardTitle: {
        color: '#202124',
        fontWeight: 900,
        fontSize: 20,
        marginBottom: theme.spacing(1),
    },
    cardText: {
        color: '#667085',
        lineHeight: 1.7,
    },
    ctaBand: {
        backgroundColor: '#202124',
        color: '#ffffff',
        paddingTop: theme.spacing(5),
        paddingBottom: theme.spacing(5),
    },
    ctaBandInner: {
        maxWidth: 960,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing(3),
        [theme.breakpoints.down('sm')]: {
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
    },
    ctaBandTitle: {
        fontWeight: 900,
        fontSize: 26,
        letterSpacing: 0,
        marginBottom: theme.spacing(0.5),
    },
    ctaBandCopy: {
        color: '#d0d5dd',
        maxWidth: 560,
    },
    ctaBandActions: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: theme.spacing(1.5),
    },
}));

const HomePage = ({isAuthenticated}) => {
    const classes = useStyles();

    const features = [
        {
            icon: <DescriptionIcon/>,
            title: 'Upload documents',
            body: 'Start with contracts, agreements, invoices, or other PDFs you need to understand quickly.',
        },
        {
            icon: <FindInPageIcon/>,
            title: 'Spot unusual terms',
            body: 'Surface non-standard language, risky obligations, and details that deserve a closer read.',
        },
        {
            icon: <ChatIcon/>,
            title: 'Ask follow-ups',
            body: 'Keep the conversation going until the document feels clear enough to act on.',
        },
    ];

    return (
        <ThemeProvider theme={theme}>
            <div className={classes.root}>
                <section className={classes.heroSection}>
                    <Container className={classes.heroInner}>
                        <Grid container spacing={4} alignItems="center">
                            <Grid item xs={12} md={5}>
                                <Typography className={classes.eyebrow}>
                                    Lawcrawl Document Review
                                </Typography>
                                <Typography component="h1" className={classes.heroTitle}>
                                    Lawcrawl
                                </Typography>
                                <Typography className={classes.heroCopy}>
                                    Upload a legal document, see the terms that deserve attention,
                                    and ask plain-language follow-up questions in one focused workspace.
                                </Typography>
                                <Box className={classes.ctaRow}>
                                    {isAuthenticated ? (
                                        <Button
                                            variant="contained"
                                            className={classes.primaryButton}
                                            startIcon={<ChatIcon/>}
                                            component={Link}
                                            to="/chat"
                                        >
                                            Open Chat
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                variant="contained"
                                                className={classes.primaryButton}
                                                startIcon={<PersonAddIcon/>}
                                                component={Link}
                                                to="/signup"
                                            >
                                                Start Reviewing
                                            </Button>
                                            <Button
                                                variant="contained"
                                                className={classes.secondaryButton}
                                                startIcon={<LoginIcon/>}
                                                component={Link}
                                                to="/login"
                                            >
                                                Login
                                            </Button>
                                        </>
                                    )}
                                </Box>
                                <Box className={classes.proofStrip}>
                                    <span className={classes.proofItem}>PDF upload</span>
                                    <span className={classes.proofItem}>Term analysis</span>
                                    <span className={classes.proofItem}>Document chat</span>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={7}>
                                <div className={classes.visualWrap}>
                                    <div className={classes.previewFrame}>
                                        <div className={classes.previewToolbar}>
                                            <span className={classes.previewDots}>
                                                <span className={classes.previewDot}/>
                                                <span className={classes.previewDot}/>
                                                <span className={classes.previewDot}/>
                                            </span>
                                            <span className={classes.previewTitle}>Review workspace</span>
                                        </div>
                                        <div className={classes.previewBody}>
                                            <div className={classes.documentPane}>
                                                <div className={classes.documentMeta}>Service Agreement.pdf</div>
                                                <Typography className={classes.docTitle}>
                                                    Important terms surfaced
                                                </Typography>
                                                <div className={classes.docRows}>
                                                    <span className={classes.docLine} style={{width: '94%'}}/>
                                                    <span className={classes.docLine} style={{width: '88%'}}/>
                                                    <span className={classes.docLine} style={{width: '96%'}}/>
                                                    <span className={classes.docLine} style={{width: '72%'}}/>
                                                    <span className={classes.docLine} style={{width: '91%'}}/>
                                                </div>
                                                <div className={classes.highlightBox}>
                                                    <FindInPageIcon/>
                                                    <div>
                                                        <div className={classes.highlightTitle}>
                                                            Non-standard renewal clause
                                                        </div>
                                                        <div className={classes.highlightText}>
                                                            Auto-renewal and termination timing need a closer read.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={classes.reviewPane}>
                                                <div className={classes.statusBlock}>
                                                    <div className={classes.statusHeader}>
                                                        <span className={classes.statusTitle}>Findings</span>
                                                        <span className={classes.statusPill}>3 flagged</span>
                                                    </div>
                                                    <div className={classes.issueList}>
                                                        <div className={classes.issueItem}>
                                                            <div className={classes.issueLabel}>Payment timing</div>
                                                            <div className={classes.issueText}>
                                                                Net terms differ from the expected template.
                                                            </div>
                                                        </div>
                                                        <div className={classes.issueItem}>
                                                            <div className={classes.issueLabel}>Liability cap</div>
                                                            <div className={classes.issueText}>
                                                                Cap language may leave exclusions unclear.
                                                            </div>
                                                        </div>
                                                        <div className={classes.issueItem}>
                                                            <div className={classes.issueLabel}>Notice window</div>
                                                            <div className={classes.issueText}>
                                                                Cancellation timing is buried in the renewal section.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={classes.chatPreview}>
                                                    <div className={classes.chatPrompt}>Ask Lawcrawl</div>
                                                    <div className={classes.chatBubble}>
                                                        What happens if we miss the notice deadline?
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={classes.insightPanel}>
                                        <div className={classes.insightTile}>
                                            <div className={classes.insightLabel}>Review Mode</div>
                                            <div className={classes.insightValue}>Clause-focused</div>
                                        </div>
                                        <div className={classes.insightTile}>
                                            <div className={classes.insightLabel}>Output</div>
                                            <div className={classes.insightValue}>Plain English</div>
                                        </div>
                                        <div className={classes.insightTile}>
                                            <div className={classes.insightLabel}>Workflow</div>
                                            <div className={classes.insightValue}>Upload to chat</div>
                                        </div>
                                    </div>
                                </div>
                            </Grid>
                        </Grid>
                    </Container>
                </section>

                <section className={classes.section}>
                    <Container maxWidth="lg">
                        <div className={classes.sectionHeader}>
                            <Typography component="h2" className={classes.sectionTitle}>
                                A cleaner way to read what matters
                            </Typography>
                            <Typography className={classes.sectionCopy}>
                                Lawcrawl keeps document review focused on the path from source file
                                to specific answers, without sending you through a maze of tabs.
                            </Typography>
                        </div>
                        <Grid container spacing={3}>
                            {features.map((feature) => (
                                <Grid item xs={12} md={4} key={feature.title}>
                                    <Card className={classes.featureCard}>
                                        <CardContent className={classes.featureContent}>
                                            <span className={classes.cardIcon}>{feature.icon}</span>
                                            <Typography component="h3" className={classes.cardTitle}>
                                                {feature.title}
                                            </Typography>
                                            <Typography variant="body2" className={classes.cardText}>
                                                {feature.body}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Container>
                </section>

                <section className={classes.ctaBand}>
                    <Container className={classes.ctaBandInner}>
                        <Box>
                            <Typography className={classes.ctaBandTitle}>
                                Need a little more context first?
                            </Typography>
                            <Typography className={classes.ctaBandCopy}>
                                Read the latest notes or reach out before uploading anything sensitive.
                            </Typography>
                        </Box>
                        <Box className={classes.ctaBandActions}>
                            <Button
                                variant="contained"
                                className={classes.primaryButton}
                                startIcon={<LibraryBooksIcon/>}
                                component={Link}
                                to="/blog_list"
                            >
                                Blog
                            </Button>
                            <Button
                                variant="contained"
                                className={classes.secondaryButton}
                                startIcon={<MailOutlineIcon/>}
                                href="mailto:tess@lawcrawl.com,tom@lawcrawl.com"
                            >
                                Contact
                            </Button>
                        </Box>
                    </Container>
                </section>
                <Footer/>
            </div>
        </ThemeProvider>
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
});
export default connect(mapStateToProps)(HomePage);
