import pandas as pd
import config
import logging

logging.basicConfig(level=logging.INFO)


class DataLoader:
    """Loads Excel files"""
    
    @staticmethod
    def load_excel(file_path, sheet_name):
        try:
            logging.info(f"Loading Excel file: {file_path} (sheet: {sheet_name})")
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
           
            
            
            return df
        except Exception as e:
            raise IOError(f"Failed to load {file_path}: {str(e)}")

# Example usage:
# DataLoader.load_excel(Config.DATABASE_PATH, "filters")