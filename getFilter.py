import pandas as pd
import os

class GetFilter:
    def __init__(self):
        self.filterData = None
       

    def loadFilterDictData(self , filePath):
        try:
            # Load the Excel file, specifying the 'filters' sheet
            df = pd.read_excel(filePath, sheet_name='filters')
            
            # Create a dictionary from the two columns
            # First column (Filters) as keys, second column (Type) as values
            self.filterData = dict(zip(df.iloc[:, 0], df.iloc[:, 1]))
            

            
        except FileNotFoundError:
            print(f"Error: File not found at {filePath}")
          
        except Exception as e:
            print(f"Error loading filter data: {str(e)}")
       

    def getFilterDict(self):
        baseDir = os.path.dirname(os.path.abspath(__file__))
        filePath = os.path.normpath(os.path.join(baseDir , './resources/FilterDict.xlsx' ))
        self.loadFilterDictData(filePath)


    def getFilterData(self):
        print("filterData:",self.filterData)
        return self.filterData

