import pandas as pd
import os

class GetProductsData:
    def __init__(self):
        self.DBdf = None
        self.loadDatabase() 


    def loadDatabase(self):
        """Loads the Excel file DataBase.xlsx and stores it in memory"""
        baseDir = os.path.dirname(os.path.abspath(__file__))
        filePath = os.path.normpath(os.path.join(baseDir, './resources/DataBase.xlsx'))
        
        try:
            # Load the entire 'filters' sheet
            self.DBdf = pd.read_excel(filePath, sheet_name='filters')
            self.DBdf.fillna('', inplace=True)  # Replace NaNs with empty strings
            #  important as causing error when strinify
        except Exception as e:
            print(f"Error loading database: {e}")
            self.DBdf = pd.DataFrame()  # Empty DataFrame as fallback
            
    
    def getActualColName(self, col_name):
        """Helper to match column name case-insensitively"""
        for actual_col in self.DBdf.columns:
            if actual_col.lower() == col_name.lower():
                return actual_col
        return col_name  # fallback
            

    def filterProducts(self, selectedFilters):
        """Returns products filtered by the selected filters"""
        if self.DBdf is None or self.DBdf.empty:
            return []
        
        try:
            df = self.DBdf.copy()
            
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

            
            return df.to_dict('records')
            
        except Exception as e:
            print(f"Error filtering products: {e}")
            return []