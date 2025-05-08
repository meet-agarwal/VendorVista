import pandas as pd
import os

class GetDataBase:
    def __init__(self , filtersData):
        self.filtersData = filtersData
        self.parent_keys = []
        self.child_keys = []

        # Iterate through the dictionary and separate keys based on their values
        for key, value in filtersData.items():
            if value == 'Parent':
                self.parent_keys.append(key)
            elif value == 'Child':
                self.child_keys.append(key)
        print("Parent keys:", self.parent_keys)
        print("Child keys:", self.child_keys)

        # self.parentFilterDict = {}
        self.masterFilterDataDict = {}


    def loadDataBaseDictData(self, filePath):
        try:
            # Load the entire 'filters' sheet
            df = pd.read_excel(filePath, sheet_name='filters')
            parentFilterDict = {}
            
            # 1. Create parentFilterDict - dictionary of parent keys and their unique values
            for parent in self.parent_keys:
                if parent in df.columns:
                    parentFilterDict[parent] = df[parent].dropna().unique().tolist()
            
        
            
            # For each parent value, create a dictionary of child filters
            for parent_key in self.parent_keys:
                if parent_key not in df.columns:
                    continue
                    
                parent_values = parentFilterDict[parent_key]
                
                for parent_value in parent_values:
                    # Filter dataframe for rows matching this parent value
                    filtered_df = df[df[parent_key] == parent_value]
                    
                    child_dict = {}
                    for child_key in self.child_keys:
                        if child_key in filtered_df.columns:
                            child_dict[child_key] = filtered_df[child_key].dropna().unique().tolist()
                    
                    self.masterFilterDataDict[parent_value] = child_dict
                    
        except FileNotFoundError:
            print(f"Error: File not found at {filePath}")

        except Exception as e:
            print(f"Error loading filter data: {str(e)}")

    def getDataBaseDict(self):
        baseDir = os.path.dirname(os.path.abspath(__file__))
        filePath = os.path.normpath(os.path.join(baseDir , './resources/DataBase.xlsx' ))
        self.loadDataBaseDictData(filePath)


    def parentFilterDictMethod(self):
        """Returns a dictionary with parent keys and their unique values"""
        parent_values = list(self.masterFilterDataDict.keys())
        print("Parent values:", parent_values)
        # this -> return {product : [] , style : []} ;
        return {parent_key: parent_values for parent_key in self.parent_keys}


    def masterFilterDataDictMethod(self):
        """Returns the master filter dictionary"""
        print("Master filter data:", self.masterFilterDataDict)
        return self.masterFilterDataDict
    

    
        
        
        
        
        