import os

class Config:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATABASE_PATH = os.path.join(BASE_DIR, "resources/DataBase.xlsx")
    FILTERS_PATH = os.path.join(BASE_DIR, "resources/FilterDict.xlsx")