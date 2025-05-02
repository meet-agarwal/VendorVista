import pandas as pd
import os

class GetDataBase:
    def __init__(self , filters):
        self.filters = filters
        self.filterDataDictValues = None

    def loadDataBaseDictData(self , filePath):
        try:
            # Load the Excel file, specifying the 'filters' sheet
              # Load only the specified columns (filters) from the 'filters' sheet
            df = pd.read_excel(filePath, sheet_name='filters', usecols=self.filters)
        
        # Convert each column to a list of unique values and store in a dictionary
            filter_dict = {}
            for col in df.columns:
                filter_dict[col] = df[col].dropna().unique().tolist()
        
        # Store the dictionary in the class attribute
            self.filterDataDictValues = filter_dict

            
        except FileNotFoundError:
            print(f"Error: File not found at {filePath}")
          
        except Exception as e:
            print(f"Error loading filter data: {str(e)}")
       

    def getDataBaseDict(self):
        baseDir = os.path.dirname(os.path.abspath(__file__))
        filePath = os.path.normpath(os.path.join(baseDir , './resources/DataBase.xlsx' ))
        self.loadDataBaseDictData(filePath)


    def getDataBaseFilterValue(self):
        return self.filterDataDictValues
