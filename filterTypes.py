import logging
from loadDataBase import DataLoader
from config import Config
from collections import OrderedDict

# Set up logging for this module
logging.basicConfig(level=logging.INFO)

class FilterTypeLoader:
    def __init__(self):
        self.loader = DataLoader()

    def get_filter_dict(self):
        try:
            df = self.loader.load_excel(Config.FILTERS_PATH, sheet_name="filters")
            df.fillna('', inplace=True)  # Handle missing data
            
            ordered = OrderedDict()
            for name, kind in zip(df.iloc[:, 0], df.iloc[:, 1]):
                ordered[name] = kind  # insertion order = Excel row order

            print(f"Loaded filter dictionary with {len(ordered)} entries.")
            print(f"Filter dictionary: {ordered}") 
            return ordered
        
        except Exception as e:
            logging.error(f"Failed to load filter dictionary: {str(e)}")
            return {}
        

    @staticmethod
    def get_child_keys():
        try:
            df = DataLoader.load_excel(Config.FILTERS_PATH, sheet_name="filters")
            child_keys = df[df.iloc[:, 1] == "Child"].iloc[:, 0].tolist()
            print(f"Loaded child keys: {child_keys}")
            return child_keys
        except Exception as e:
            logging.error(f"Failed to load child keys: {str(e)}")
            return []
