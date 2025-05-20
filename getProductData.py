import logging
from loadDataBase import DataLoader
from config import Config
import uuid
import pandas as pd


logging.basicConfig(level=logging.INFO)

class GetProductsData:
    def __init__(self):
        self.df = self._load_data()



    def _load_data(self):
        try:
            df = DataLoader.load_excel(Config.DATABASE_PATH, "filters")
            df.reset_index(drop=True, inplace=True)  # Ensure clean indexing
            df.fillna('', inplace=True)  # Handle missing data

            # Remove leading/trailing whitespace from all string entries
            df = df.applymap(lambda x: x.strip() if isinstance(x, str) else x)


            # Add unique ID per row — consistent in-memory
            df["_id"] = [str(uuid.uuid4()) for _ in range(len(df))]

            logging.info("Loaded product data with unique IDs.")
            return df
        except Exception as e:
            logging.error(f"Failed to load product data: {e}")
            return pd.DataFrame()
        
    
    
    def getAllSettingsOptions(self):
        optionList  = self.df.columns.to_list() 
        print("optionList of Setting is:",optionList)
        return optionList
    
    
    
    def getActualColName(self, col_name):
        """Helper to match column name case-insensitively"""
        for actual_col in self.df.columns:
            if actual_col.lower() == col_name.lower():
                return actual_col
        return col_name # fallback
            

    def filterProducts(self, selectedFilters):
        """Returns products filtered by the selected filters"""
        if self.df.empty:
            return []
        
        try:
            df = self.df.copy()
            
            # Apply parent filter
            if 'parent' in selectedFilters:
                parent_filter = selectedFilters['parent']
                parent_col = self.getActualColName( parent_filter['name'])
                parentVal = parent_filter['value']
                parent_val = parentVal.replace('-',' ')
                df = df[df[parent_col].astype(str).str.lower() == str(parent_val).lower()]

            
            # Apply child filters
            if 'child' in selectedFilters:
                child_filters = selectedFilters['child']
                for filter_name, filter_values in child_filters.items():
                    col_name = self.getActualColName( filter_name)
                    if col_name in df.columns:
                        if isinstance(filter_values, list):
                            filter_values = [str(v).lower() for v in filter_values]
                            df = df[df[col_name].astype(str).str.lower().isin(filter_values)]
                        else:
                            df = df[df[col_name].astype(str).str.lower() == str(filter_values).lower()]
                            
            # Remove leading/trailing whitespace from all string entries
            df = df.applymap(lambda x: x.strip() if isinstance(x, str) else x)

            
            return df.to_dict('records')
            
        except Exception as e:
            logging.error(f"Error filtering products: {e}")
            return []
    
    