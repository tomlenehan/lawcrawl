// src/components/TermsOfService.js
import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
    termsText: {
        backgroundColor: '#fdfbee',
        padding: 20,
        border: '2px solid #80cbc4',
        borderRadius: '10px',
    },
    heading: {
        color: '#3a3a3a',
        marginBottom: theme.spacing(1),
    },
    paragraph: {
        color: '#3a3a3a',
        marginBottom: theme.spacing(2),
    },
}));

const TermsOfService = ({open, onClose}) => {
    const classes = useStyles();

    return (
        <div className={classes.termsText}>
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
                If you have any questions about these Terms of Service, please contact us at <a href="mailto:tom@lawcrawl.com">tom@lawcrawl.com</a>.
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
        </div>
    );
};

export default TermsOfService;
