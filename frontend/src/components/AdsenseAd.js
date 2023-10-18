// AdSenseAd.js
import React, { useEffect } from 'react';

function AdSenseAd() {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  return (
    <ins className="adsbygoogle"
         style={{ display: 'block' }}
         data-ad-client="ca-pub-XXXXXXX"  // Replace with your Ad client ID
         data-ad-slot="XXXXXXX"  // Replace with your Ad slot ID
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  );
}

export default AdSenseAd;
