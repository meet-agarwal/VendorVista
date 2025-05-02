import pandas as pd
import os

class GetFilter:
    def __init__(self):
        self.filterData = None

    def loadFilterDictData(self , filePath):
        try:
            # Load the Excel file, specifying the 'filters' sheet
            df = pd.read_excel(filePath, sheet_name='filters')
            
            # Assuming the filter names are in column A (index 0)
            # Drop any empty rows and convert to list
            self.filterData = df.iloc[:, 0].dropna().tolist()
            
        except FileNotFoundError:
            print(f"Error: File not found at {filePath}")
          
        except Exception as e:
            print(f"Error loading filter data: {str(e)}")
       

    def getFilterDict(self):
        baseDir = os.path.dirname(os.path.abspath(__file__))
        filePath = os.path.normpath(os.path.join(baseDir , './resources/FilterDict.xlsx' ))
        self.loadFilterDictData(filePath)


    def getFilternames(self):
        return self.filterData

