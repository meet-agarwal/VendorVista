import os
import pdfkit

class Config:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATABASE_PATH = os.path.join(BASE_DIR, "resources/MasterDB.xlsx")
    FILTERS_PATH = os.path.join(BASE_DIR, "resources/FilterDict.xlsx")
    BASE_IMAGE_DIR = os.path.join(BASE_DIR, "resources", "images")
    WKHTMLTOPDF_PATH = pdfkit.configuration(
        wkhtmltopdf=r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
    )   
