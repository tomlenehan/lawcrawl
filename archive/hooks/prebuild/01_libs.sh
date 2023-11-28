#!/bin/bash

# Ensure running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit
fi

set -e

yum -y upgrade --releasever=2023.2.20231113

# Install basic tools and development tools
yum -y install git htop clang autoconf automake meson cmake libtool asciidoc wget tar gzip

# Install development libraries
yum -y install libpng-devel libtiff-devel zlib-devel libwebp-devel libjpeg-turbo-devel
yum -y install cairo cairo-devel cairomm-devel pango pango-devel pangomm pangomm-devel pango-tests
yum -y install gtk-doc glib2-devel fontconfig-devel libffi libffi-devel

# Install additional utilities
yum -y install ghostscript qpdf libxml2 libxslt pngquant

# Group install for Development Tools
yum -y groupinstall "Development Tools"

# Install Leptonica
if [ ! -d "/usr/share/leptonica" ]; then
  cd /usr/share/
  mkdir leptonica
  cd leptonica
  wget http://www.leptonica.org/source/leptonica-1.80.0.tar.gz
  tar -zxvf leptonica-1.80.0.tar.gz
  rm leptonica-1.80.0.tar.gz
  cd leptonica-1.80.0
  ./autogen.sh
  ./configure && make
  make install
fi

# Install Tesseract
if [ ! -d "/usr/share/tesseract" ]; then
  cd /usr/share/
  mkdir tesseract
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
fi

# Add tesseract language (eng)
if [ ! -f "/usr/local/share/tessdata/eng.traineddata" ]; then
  cd /usr/local/share/tessdata
  wget https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata
fi
export TESSDATA_PREFIX='/usr/local/share/tessdata'

# Install JBIG2
if [ ! -d "/usr/share/jbig2enc" ]; then
  cd /usr/share/
  git clone https://github.com/agl/jbig2enc
  cd jbig2enc
  ./autogen.sh
  ./configure && make
  make install
fi
