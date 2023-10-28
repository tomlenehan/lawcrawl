// PdfViewer.js
import React, {useState} from 'react';
import {Document, Page} from 'react-pdf';
import {pdfjs} from "react-pdf";
import {makeStyles} from '@material-ui/core/styles';
import {SizeMe} from 'react-sizeme';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const useStyles = makeStyles({
    pdfWrapper: {
        height: '100%',
        overflowY: 'scroll',
    },
});

const PdfViewer = ({file}) => {
    const classes = useStyles();
    const [numPages, setNumPages] = useState(null);

    function onDocumentLoadSuccess({numPages}) {
        setNumPages(numPages);
    }

    return (
        <div className={classes.pdfWrapper}>
            <SizeMe
                monitorHeight
                refreshRate={128}
                refreshMode={"debounce"}
                render={({size}) => (
                    // <div style={{maxHeight: '100%', overflowY: "hidden"}}>
                    <Document
                        file={file}
                        onLoadSuccess={onDocumentLoadSuccess}
                    >
                        {Array.from(
                            new Array(numPages),
                            (el, index) => (
                                <Page
                                    key={`page_${index + 1}`}
                                    pageNumber={index + 1}
                                    width={size.width}
                                />
                            ),
                        )}
                    </Document>
                )}/>
        </div>
    );
}

export default PdfViewer;
