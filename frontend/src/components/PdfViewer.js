import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Document, Page} from 'react-pdf';
// import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import {StyleSheet} from '@react-pdf/renderer';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import {pdfjs} from "react-pdf";
import {makeStyles} from '@material-ui/core/styles';
import {SizeMe} from 'react-sizeme';
import {Button} from "@material-ui/core";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#e0f2f1',
        color: '#3a3a3a',
    }
    // section: { color: 'white', textAlign: 'center', margin: 30 }
});

const useStyles = makeStyles({
    pdfContainer: {
        position: 'relative',
        height: '100%',
    },
    pdfWrapper: {
        height: '100%',
        overflowY: 'scroll',
        borderRadius: 15,
    },
    pdfPage: {
        color: '#3a3a3a',
        backgroundColor: '#e0f2f1',
    },
    navIcon: {
        color: '#80cbc4',
        '&disabled': {
            color: '#bdbdbd',
        },
        '&:hover': {
            backgroundColor: '#26a69a',
        },
    },
    navigationButton: {
        position: 'absolute',
        top: '10%',
        zIndex: 1000,
        backgroundColor: 'white',
        '&:hover': {
            backgroundColor: '#26a69a',
        },
    },
    disabledButton: {
        opacity: 0.5,
        pointerEvents: 'none',
    },
    backButton: {
        left: '10px',
    },
    forwardButton: {
        right: '10px',
    },
});

const PdfViewer = ({file}) => {
    const classes = useStyles();
    const [numPages, setNumPages] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [loaded, setLoaded] = useState(false);
    const [scrolledToHighlight, setScrolledToHighlight] = useState(false);
    const [highlightedRegions, setHighlightedRegions] = useState([]);
    const [currentRegionIndex, setCurrentRegionIndex] = useState(0);
    const isPrevDisabled = currentRegionIndex === 0;
    const isNextDisabled = currentRegionIndex === (highlightedRegions.length - 1);
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
        setSearchText(event.target.value);
    }

    function onDocumentLoadSuccess({numPages}) {
        setNumPages(numPages);
    }

useEffect(() => {
    if (loaded && containerRef.current) {
        const maxWaitTime = 10000; // Maximum wait time in milliseconds (e.g., 10 seconds)
        const intervalTime = 500; // Interval time in milliseconds for checking SVG elements
        let elapsedTime = 0;

        const checkSvgElements = () => {
            const renderedPages = containerRef.current.querySelectorAll('.react-pdf__Page');
            if (renderedPages.length === numPages) {
                const svgElements = containerRef.current.querySelectorAll('svg.quadrilateralsContainer');
                if (svgElements.length > 0 || elapsedTime >= maxWaitTime) {
                    setHighlightedRegions(Array.from(svgElements));
                    svgElements[0].scrollIntoView({behavior: 'smooth', block: 'center'});
                    setScrolledToHighlight(true);
                    clearInterval(intervalId);
                }
            }
            elapsedTime += intervalTime;
        };

        const intervalId = setInterval(checkSvgElements, intervalTime);

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }
}, [loaded, numPages]);



    const scrollToRegion = (index) => {
        if (index >= 0 && index < highlightedRegions.length) {
            highlightedRegions[index].scrollIntoView({behavior: 'smooth', block: 'center'});
            setCurrentRegionIndex(index);
        }
    };

    const scrollToNextRegion = () => scrollToRegion(currentRegionIndex + 1);
    const scrollToPrevRegion = () => scrollToRegion(currentRegionIndex - 1);


    return (
        <div className={classes.pdfContainer}>
            <div ref={containerRef} className={classes.pdfWrapper}>
                <SizeMe
                    monitorHeight
                    refreshRate={128}
                    refreshMode={"debounce"}
                    render={({size}) => (
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading = ""
                        >
                            {Array.from(
                                new Array(numPages),
                                (el, index) => (
                                    <Page
                                        key={`page_${index + 1}`}
                                        pageNumber={index + 1}
                                        width={size.width}
                                        onRenderSuccess={handlePageRender}
                                        className={classes.pdfPage}
                                        style={styles.page}
                                    />
                                ),
                            )}
                        </Document>
                    )}
                />
            </div>

            <Button
                className={`${classes.navigationButton} ${classes.backButton} ${isPrevDisabled ? classes.disabledButton : ''}`}
                onClick={scrollToPrevRegion}
                disabled={isPrevDisabled}
            >
                <ArrowBackIosIcon className={classes.navIcon} />
            </Button>

            <Button
                className={`${classes.navigationButton} ${classes.forwardButton} ${isNextDisabled ? classes.disabledButton : ''}`}
                onClick={scrollToNextRegion}
                disabled={isNextDisabled}
            >
                <ArrowForwardIosIcon className={classes.navIcon} />
            </Button>

        </div>
    );

}

export default PdfViewer;
