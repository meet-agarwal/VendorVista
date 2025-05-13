import filterTypes
from loadDataBase import DataLoader
from config import Config
import logging

class HierarchyManager:
    def __init__(self):
        self.hierarchy = {}
        self.loader = DataLoader()
        self.filter_child_list = filterTypes.FilterTypeLoader().get_child_filter_list()
        
        self.df = None
        try:
            self.df = self.loader.load_excel(Config.DATABASE_PATH, sheet_name="filters")
            
            logging.info("Successfully loaded filter types.")
        except FileNotFoundError as e:
            logging.error(f"Filter file not found: {str(e)}")
        except Exception as e:
            logging.error(f"Failed to load filter types: {str(e)}")
            self.df = None
        
    
    def check_position(self, filter_name):
            if filter_name in self.filter_child_list:   
                # Get the position of the filter_name in the filter_child_list
                position = self.filter_child_list.index(filter_name)
                print(f"Position of {filter_name} in filter_child_list: {position}")
                return position
            else:
                return -1
        
    def update_hierarchy(self, ):
       