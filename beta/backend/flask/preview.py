# preview.py
import os
import traceback
import logging
from flask import abort
from pdf2image import convert_from_path
import io
from PIL import Image
from PyPDF2 import PdfReader

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    filename='preview_errors.log'
)
logger = logging.getLogger(__name__)

class PDFPreview:
    @staticmethod
    def generate_preview(pdf_path, page=0, scale=1.0):
        try:
            logger.info(f"Generating preview for {pdf_path}, page {page}, scale {scale}")
            
            # Validate PDF path
            if not os.path.exists(pdf_path):
                logger.error(f"PDF file not found: {pdf_path}")
                abort(404, description="PDF file not found")

            # Convert PDF page to image
            pages = convert_from_path(
                pdf_path, 
                first_page=page+1, 
                last_page=page+2
            )

            if not pages:
                logger.warning(f"No pages generated for {pdf_path}")
                abort(404, description="Unable to generate preview")

            # Get the first (or only) page
            image = pages[0]

            # Resize image if scale is not 1.0
            if scale != 1.0:
                new_size = (int(image.width * scale), int(image.height * scale))
                image = image.resize(new_size, Image.LANCZOS)

            # Convert image to bytes
            img_byte_arr = io.BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)

            logger.info(f"Preview generated successfully for {pdf_path}")
            return img_byte_arr

        except Exception as e:
            logger.error(f"Preview generation error: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            abort(500, description=f"Error generating preview: {str(e)}")

    @staticmethod
    def get_total_pages(pdf_path):
        try:
            logger.info(f"Getting total pages for {pdf_path}")
            reader = PdfReader(pdf_path)
            total_pages = len(reader.pages)
            logger.info(f"Total pages: {total_pages}")
            return total_pages
        except Exception as e:
            logger.error(f"Page count error: {str(e)}")
            logger.error(f"Traceback: {traceback.format_exc()}")
            return 0
