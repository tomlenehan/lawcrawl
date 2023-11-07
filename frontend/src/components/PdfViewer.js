import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Document, Page} from 'react-pdf';
// import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import {StyleSheet} from '@react-pdf/renderer';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import {pdfjs} from "react-pdf";
import {makeStyles} from '@material-ui/core/styles';
import {SizeMe} from 'react-sizeme';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#e0f2f1',
        color: '#3a3a3a',
    }
    // section: { color: 'white', textAlign: 'center', margin: 30 }
});

const useStyles = makeStyles({
    pdfWrapper: {
        height: '100%',
        overflowY: 'scroll',
        borderRadius: 15,
        position: 'relative',
    },
    pdfPage: {
        color: '#3a3a3a',
        backgroundColor: '#e0f2f1'
    }
});

const PdfViewer = ({file}) => {
    const classes = useStyles();
    const [numPages, setNumPages] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [loaded, setLoaded] = useState(false);
    const [scrolledToHighlight, setScrolledToHighlight] = useState(false);
    const containerRef = useRef();
    // const textRenderer = useCallback(
    //     (textItem) => highlightPattern(textItem.str, searchText),
    //     [searchText]
    // );


    const handlePageRender = () => {
        // Check if all pages have been rendered
        if (document.querySelectorAll('.react-pdf__Page').length === numPages) {
            setLoaded(true);
        }
    };

    function onChange(event) {
        console.log('highlighting1');
        setSearchText(event.target.value);
    }

    function onDocumentLoadSuccess({numPages}) {
        console.log("setting num pages");
        setNumPages(numPages);
    }

    useEffect(() => {
        if (loaded && !scrolledToHighlight && containerRef.current) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length > 0) {
                        const svgElements = containerRef.current.querySelectorAll('svg.quadrilateralsContainer');
                        if (svgElements.length > 0) {
                            svgElements[0].scrollIntoView({behavior: 'smooth', block: 'center'});
                            setScrolledToHighlight(true);
                            observer.disconnect(); // Stop observing once we've scrolled to the element
                        }
                    }
                });
            });

            observer.observe(containerRef.current, {childList: true, subtree: true});

            // Clean up observer when component unmounts
            return () => observer.disconnect();
        }
    }, [loaded, scrolledToHighlight]);


    return (
        <div ref={containerRef} className={classes.pdfWrapper}>
            {/*<label htmlFor="search">Search:</label>*/}
            {/*<input type="search" id="search" value={searchText} onChange={onChange}/>*/}
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
                                    // customTextRenderer={textRenderer}
                                    onRenderSuccess={handlePageRender}
                                    className={classes.pdfPage}
                                    style={styles.page}
                                />
                            ),
                        )}
                    </Document>

                )}/>
            <div>
            </div>
        </div>
    );
}

export default PdfViewer;
