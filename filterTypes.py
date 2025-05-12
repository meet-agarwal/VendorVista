import logging
from loadDataBase import DataLoader
from config import Config

# Set up logging for this module
logging.basicConfig(level=logging.INFO)

class FilterTypeLoader:
    def __init__(self):
        self.loader = DataLoader()

    def get_filter_dict(self):
        try:
            df = self.loader.load_excel(Config.FILTERS_PATH, sheet_name="filters")
            df.fillna('', inplace=True)  # Handle missing data
            
            filter_data = dict(zip(df.iloc[:, 0], df.iloc[:, 1]))
            
            logging.info("Successfully loaded filter dictionary.")
            return filter_data
        
        except Exception as e:
            logging.error(f"Failed to load filter dictionary: {str(e)}")
            return {}
