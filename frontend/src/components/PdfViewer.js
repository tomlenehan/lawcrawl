import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Document, Page} from 'react-pdf';
// import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import {StyleSheet} from '@react-pdf/renderer';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import {pdfjs} from "react-pdf";
import {makeStyles} from '@material-ui/core/styles';
import {TextField, InputAdornment, IconButton} from '@material-ui/core';
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
    pageSelector: {
        position: 'absolute',
        fontSize: 20,
        color: '#3a3a3a',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
    },
    pageInput: {
        width: '70px',
    },
    pageButton: {
        color: '#3a3a3a',
        fontSize: 30,
        // '&:hover': {
        //     backgroundColor: '#26a69a',
        // },
    }
});

const PdfViewer = ({file, currentPage: externalCurrentPage}) => {
    const classes = useStyles();
    const [numPages, setNumPages] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [loaded, setLoaded] = useState(false);
    const [scrolledToHighlight, setScrolledToHighlight] = useState(false);
    const [highlightedRegions, setHighlightedRegions] = useState([]);
    const [currentRegionIndex, setCurrentRegionIndex] = useState(0);
    const scrollToNextRegion = () => scrollToRegion(currentRegionIndex + 1);
    const scrollToPrevRegion = () => scrollToRegion(currentRegionIndex - 1);
    const isPrevDisabled = currentRegionIndex === 0;
    const isNextDisabled = currentRegionIndex >= highlightedRegions.length - 1;
    // const [currentPage, setCurrentPage] = useState(1);
    const [internalCurrentPage, setInternalCurrentPage] = useState(1);
    const pageRefs = useRef([]);
    const containerRef = useRef();


    const handlePageRender = () => {
        // Check if all pages have been rendered
        if (document.querySelectorAll('.react-pdf__Page').length === numPages) {
            setLoaded(true);
        }
    };

    // Effect for handling external page changes
    useEffect(() => {
        if (externalCurrentPage && externalCurrentPage !== internalCurrentPage) {
            setInternalCurrentPage(externalCurrentPage);
        }
        // setInternalCurrentPage(externalCurrentPage);
    }, [externalCurrentPage]);

    // Effect for handling internal page changes
    useEffect(() => {
        if (internalCurrentPage) {
            scrollToPage(internalCurrentPage);
        }
    }, [internalCurrentPage]);


    const handlePageChange = (event) => {
        let page = parseInt(event.target.value, 10);
        if (page >= 1 && page <= numPages) {
            setInternalCurrentPage(page); // Update internal page state
            scrollToPage(page); // Scroll to the page
        } else {
            console.error("Invalid page number");
        }
    };

    const handleInternalPageChange = (newPage) => {
        if (newPage >= 1 && newPage <= numPages) {
            setInternalCurrentPage(newPage);
        }
    };

    function onChange(event) {
        setSearchText(event.target.value);
    }

    const onDocumentLoadSuccess = ({numPages}) => {
        setNumPages(numPages);
        // Initialize refs for each page
        pageRefs.current = Array(numPages).fill().map((_, i) => pageRefs.current[i] || React.createRef());
    };

    const scrollToPage = (pageNumber) => {
        if (pageRefs.current[pageNumber - 1]) {
            pageRefs.current[pageNumber - 1].current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    };

    // useEffect(() => {
    //     // Scroll to the current page when it changes
    //     scrollToPage(currentPage);
    // }, [currentPage]);

    // useEffect(() => {
    //
    //     let num_highlights = 0;
    //
    //     if (loaded && containerRef.current) {
    //         const observer = new MutationObserver(mutations => {
    //             mutations.forEach(mutation => {
    //                 if (mutation.addedNodes.length) {
    //                     const svgElements = containerRef.current.querySelectorAll('svg.quadrilateralsContainer');
    //
    //                     // reset scrollable highlights if there are more
    //                     if (svgElements.length > num_highlights) {
    //                         num_highlights = svgElements.length;
    //                         setHighlightedRegions(Array.from(svgElements));
    //                     }
    //
    //                     // scroll to first highlight when it's available
    //                     if (svgElements.length > 0 && !scrolledToHighlight) {
    //                         svgElements[0].scrollIntoView({behavior: 'smooth', block: 'center'});
    //                         setScrolledToHighlight(true);
    //                     }
    //                 }
    //             });
    //         });
    //
    //         observer.observe(containerRef.current, {childList: true, subtree: true});
    //
    //         return () => observer.disconnect();
    //     }
    // }, [loaded, scrolledToHighlight]);
    //
    // const scrollToRegion = (index) => {
    //     console.log("region:" + index + "of" + highlightedRegions.length)
    //     if (index >= 0 && index < highlightedRegions.length) {
    //         highlightedRegions[index].scrollIntoView({behavior: 'smooth', block: 'center'});
    //         setCurrentRegionIndex(index);
    //     }
    // };
    //
    // useEffect(() => {
    //     if (currentRegionIndex >= 0 && currentRegionIndex < highlightedRegions.length) {
    //         highlightedRegions[currentRegionIndex].scrollIntoView({
    //             behavior: 'smooth',
    //             block: 'center'
    //         });
    //     }
    // }, [currentRegionIndex, highlightedRegions]);


    return (
        <div className={classes.pdfContainer}>

            <div className={classes.pageSelector}>
                <IconButton className={classes.pageButton}
                    onClick={() => handleInternalPageChange(internalCurrentPage - 1)}
                    disabled={internalCurrentPage === 1}>
                    <NavigateBeforeIcon />
                </IconButton>
                <TextField
                    className={classes.pageInput}
                    type="number"
                    size="small"
                    value={internalCurrentPage}
                    onChange={(e) => handleInternalPageChange(parseInt(e.target.value, 10))}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">/{numPages}</InputAdornment>,
                    }}
                />
                <IconButton className={classes.pageButton}
                    onClick={() => handleInternalPageChange(internalCurrentPage + 1)}
                    disabled={internalCurrentPage === numPages}>
                    <NavigateNextIcon />
                </IconButton>
            </div>

            <div ref={containerRef} className={classes.pdfWrapper}>
                <SizeMe
                    monitorHeight
                    refreshRate={128}
                    refreshMode={"debounce"}
                    render={({size}) => (
                        <Document
                            file={file}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading=" "
                        >
                            {Array.from(
                                new Array(numPages), (el, index) => (
                                    <div key={`page_${index + 1}`} ref={pageRefs.current[index]}>
                                        <Page
                                            key={`page_${index + 1}`}
                                            pageNumber={index + 1}
                                            width={size.width}
                                            onRenderSuccess={handlePageRender}
                                            className={classes.pdfPage}
                                            style={styles.page}
                                            loading=" "
                                        />
                                    </div>
                                ),
                            )}
                        </Document>
                    )}
                />
            </div>

            {/*<Button*/}
            {/*    className={`${classes.navigationButton} ${classes.backButton} ${*/}
            {/*        isPrevDisabled ? classes.disabledButton : ""*/}
            {/*    }`}*/}
            {/*    onClick={scrollToPrevRegion}*/}
            {/*    disabled={isPrevDisabled}*/}
            {/*>*/}
            {/*    <ArrowBackIosIcon className={classes.navIcon}/>*/}
            {/*</Button>*/}

            {/*<Button*/}
            {/*    className={`${classes.navigationButton} ${classes.forwardButton} ${*/}
            {/*        isNextDisabled ? classes.disabledButton : ""*/}
            {/*    }`}*/}
            {/*    onClick={scrollToNextRegion}*/}
            {/*    disabled={isNextDisabled}*/}
            {/*>*/}
            {/*    <ArrowForwardIosIcon className={classes.navIcon}/>*/}
            {/*</Button>*/}

        </div>
    );

}

export default PdfViewer;
