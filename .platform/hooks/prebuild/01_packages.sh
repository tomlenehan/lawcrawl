#!/bin/bash

# Check if Tesseract is installed
if tesseract --version > /dev/null 2>&1; then
    echo "Tesseract is already installed."
    exit 0
fi

sudo su
set -e

# Install dependencies
yum -y install -y git
yum -y groupinstall "Development Tools"
yum -y install clang autoconf automake
yum -y install libtool asciidoc
yum -y install libpng-devel libtiff-devel zlib-devel libwebp-devel libjpeg-turbo-devel wget tar gzip
yum -y install -y ghostscript qpdf libxml2 libxslt pngquant


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
./configure && make
make install

# Install JBIG2 to speed up OCRMyPDF
cd /usr/share/
if [ ! -d "jbig2enc" ]; then
  git clone https://github.com/agl/jbig2enc
fi
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
wget https://github.com/tesseract-ocr/tesseract/archive/5.3.3.tar.gz
tar -zxvf 5.3.3.tar.gz
rm 5.3.3.tar.gz
cd tesseract-5.3.3

export PKG_CONFIG_PATH='/usr/local/lib/pkgconfig'
export LIBLEPT_HEADERSDIR='/usr/local/include'
export TESSDATA_PREFIX='/usr/local/share/tessdata'
./autogen.sh
./configure --with-extra-libraries=/usr/local/lib
make
make install
ldconfig

# add tesseract language (eng)
cd /usr/local/share/tessdata
wget https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata
export TESSDATA_PREFIX='/usr/local/share/tessdata'

# install Python packages
cd /var/app/current/
pip install -r requirements.txt