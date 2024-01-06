import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import ReactMarkdown from 'react-markdown';
import Typography from '@material-ui/core/Typography';
import {Link} from "react-router-dom";
import {Button} from "@material-ui/core";
import DisabledByDefaultIcon from '@mui/icons-material/DisabledByDefault';

const useStyles = makeStyles((theme) => ({
    termsText: {
        backgroundColor: '#fdfbee',
        padding: 20,
        border: '2px solid #80cbc4',
        borderRadius: '10px',
        position: 'relative', // For positioning the close button
    },
    heading: {
        color: '#3a3a3a',
        marginBottom: theme.spacing(1),
        fontWeight: 'bold', // Make headings bold
    },
    paragraph: {
        color: '#3a3a3a',
        marginBottom: theme.spacing(2),
    },
    closeButton: {
        position: 'absolute',
        right: 4,
        top: 4,
    }
}));

const TermsOfService = ({open, onClose}) => {
    const classes = useStyles();

    return (
        <div className={classes.termsText}>
            <Button className={classes.closeButton} onClick={onClose}>
                <DisabledByDefaultIcon style={{color: '#26a69a'}}/>
            </Button>

            <Typography variant="h6" className={classes.heading}>
                Terms of Service for LawCrawl
            </Typography>
            <Typography variant="subtitle1" className={classes.heading}>
                1. Introduction
            </Typography>
            <Typography variant="body2" className={classes.paragraph}>
                Welcome to LawCrawl. By using our platform, you are agreeing to the following terms
                and conditions. Please read them carefully.
            </Typography>

            <Typography variant="subtitle1" className={classes.heading}>
                2. Services Provided
            </Typography>
            <Typography variant="body2" className={classes.paragraph}>
                LawCrawl offers users the ability to upload legal documents and interact with an AI
                chatbot for legal advice. Our goal is to assist you in understanding and navigating
                legal matters, but our responses should not be considered as a substitute for
                professional legal advice.
            </Typography>

            <Typography variant="subtitle1" className={classes.heading}>
                3. Document Storage
            </Typography>
            <Typography variant="body2" className={classes.paragraph}>
                When you upload documents to LawCrawl, we store them on our secure servers. These
                documents are accessible only through your account. We take your privacy seriously
                and implement robust security measures to protect your data. However, it's
                essential to understand that no system can be entirely secure. If you have
                sensitive or confidential documents, please ensure you are comfortable with this
                level of risk before using our services.
            </Typography>

            <Typography variant="subtitle1" className={classes.heading}>
                4. Privacy
            </Typography>
            <Typography variant="body2" className={classes.paragraph}>
                Your privacy is of utmost importance to us. While we store the documents you
                upload, we will not share, sell, or distribute your personal information or
                documents to third parties without your explicit consent, except as required by
                law.
            </Typography>

            <Typography variant="subtitle1" className={classes.heading}>
                5. Limitation of Liability
            </Typography>
            <Typography variant="body2" className={classes.paragraph}>
                While we strive to provide accurate and timely legal insights through our AI
                chatbot, the advice given should not be considered as a replacement for
                professional legal counsel. LawCrawl will not be held responsible for any decisions
                made based on the advice provided by our platform.
            </Typography>

            <Typography variant="subtitle1" className={classes.heading}>
                6. Changes to the Terms
            </Typography>
            <Typography variant="body2" className={classes.paragraph}>
                We may update our Terms of Service from time to time. We will notify you of any
                changes by posting the new Terms of Service on this page. It is advised to review
                this Terms of Service periodically for any changes.
            </Typography>

            <Typography variant="subtitle1" className={classes.heading}>
                7. Contact Us
            </Typography>
            <Typography variant="body2" className={classes.paragraph}>
                If you have any questions about these Terms of Service, please contact us at
                <a href="mailto:tom@lawcrawl.com">tom@lawcrawl.com</a> or <a href="mailto:tom@lawcrawl.com">tess@lawcrawl.com</a>
            </Typography>

            <Typography variant="subtitle1" className={classes.heading}>
                8. GDPR Compliance
            </Typography>
            <Typography variant="body2" className={classes.paragraph}>
                LawCrawl complies with the General Data Protection Regulation (GDPR). We are
                committed to safeguarding the personal information of our users residing within the
                European Union. We ensure that we collect, process, and store data in accordance
                with the GDPR guidelines. For more information on how we handle personal data,
                please refer to our Privacy Policy.
            </Typography>

            <Typography variant="subtitle1" className={classes.heading}>
                9. CPRA Compliance
            </Typography>
            <Typography variant="body2" className={classes.paragraph}>
                LawCrawl complies with the California Privacy Rights Act (CPRA). We are dedicated
                to protecting the privacy and data of our users residing in California. We adhere
                to the guidelines set forth by the CPRA in managing the personal information of our
                users. For more detailed information on our data handling practices, please refer
                to our Privacy Policy.
            </Typography>

            <Typography variant="subtitle1" className={classes.heading}>
                10. Google Account Management and Data Sharing
            </Typography>
            <Typography variant="body2" className={classes.paragraph}>
                Users can manage access to their Google Account at any time through their Google
                Account settings. We adhere to strict data privacy standards to ensure the security
                of our users' data. Learn more about how Google helps users share their data safely
                via this <Link href="https://support.google.com/accounts/answer/7675428?hl=en"
                               target="_blank" rel="noopener noreferrer">Google article</Link>.
            </Typography>

            <Typography variant="subtitle1" className={classes.heading}>
                11. Changes to the Service
            </Typography>
            <Typography variant="body2" className={classes.paragraph}>
                Please note that LawCrawl reserves the right to regulate or throttle usage at our
                discretion to ensure optimal service performance as well as transition to a paid
                service model, which may affect access to certain features and functionality
                without an upgrade.
            </Typography>
        </div>
    );
};

export default TermsOfService;
