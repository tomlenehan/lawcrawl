#!/bin/bash

# Install necessary dependencies
yum install -y ghostscript tesseract qpdf libxml2 libxslt pngquant

# Install pip if not present
which pip || easy_install pip

# Install ocrmypdf
pip install ocrmypdf
