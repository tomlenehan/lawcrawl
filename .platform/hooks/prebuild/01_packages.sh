#!/bin/bash

sudo su

# Install dependencies
yum groupinstall "Development Tools"
yum install clang autoconf automake
yum install libtool asciidoc
yum install libpng-devel libtiff-devel zlib-devel libwebp-devel libjpeg-turbo-devel wget tar gzip
yum install -y ghostscript qpdf libxml2 libxslt pngquant


# Install Leptonica
cd /usr/share/
if [ ! -d "/usr/share/leptonica" ]; then
mkdir leptonica
fi
cd leptonica
wget http://www.leptonica.org/source/leptonica-1.80.0.tar.gz
tar -zxvf leptonica-1.80.0.tar.gz
rm leptonica-1.80.0.tar.gz
cd leptonica-1.80.0
./autogen.sh
./configure
make
make install

# Install JBIG2 to speed up OCRMyPDF
cd /usr/share/
git clone https://github.com/agl/jbig2enc
cd jbig2enc
./autogen.sh
./configure && make
make install

# Install Tesseract
cd /usr/share/
if [ ! -d "/usr/share/tesseract" ]; then
  mkdir tesseract
fi
cd tesseract
wget https://github.com/tesseract-ocr/tesseract/archive/4.1.1.tar.gz
tar -zxvf 4.1.1.tar.gz
rm 4.1.1.tar.gz
cd tesseract-4.1.1

export PKG_CONFIG_PATH='/usr/local/lib/pkgconfig'
export LIBLEPT_HEADERSDIR='/usr/local/include'
export TESSDATA_PREFIX='/usr/local/share/tessdata'
./autogen.sh
./configure --with-extra-libraries=/usr/local/lib
make
make install
ldconfig

cd /usr/local/share/tessdata
wget https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata -O eng
export TESSDATA_PREFIX='/usr/local/share/tessdata'
