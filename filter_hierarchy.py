import logging
from loadDataBase import DataLoader
from config import Config

logging.basicConfig(level=logging.INFO)

class FilterHierarchyBuilder:
    
    master_filter_dict_Options = None
    child_keys_Options = []
    parent_keys_Options = []
    
    def __init__(self, filters_data):
        self.filters_data = filters_data
        
        # we’ll override these in build_hierarchy() once we know the DB columns
        self.parent_keys = []
        self.child_keys = []
        self.master_filter_dict = {}

    def build_hierarchy(self):
        df = DataLoader.load_excel(Config.DATABASE_PATH, "filters")
        
        df = DataLoader.load_excel(Config.DATABASE_PATH, "filters")

        #—— override key order to match the **database** sheet’s column order ——
        cols = list(df.columns)
        self.parent_keys = [col for col in cols if col in self.filters_data and self.filters_data[col] == "Parent"]
        self.child_keys  = [col for col in cols if col in self.filters_data and self.filters_data[col] == "Child"]

        FilterHierarchyBuilder.parent_keys_Options = self.parent_keys
        FilterHierarchyBuilder.child_keys_Options = self.child_keys

        parent_filter_dict = {}
        for parent in self.parent_keys:
            if parent in df.columns:
                parent_filter_dict[parent] = df[parent].dropna().unique().tolist()

        for parent_key in self.parent_keys:
            if parent_key not in df.columns:
                continue
            for parent_value in parent_filter_dict[parent_key]:
                filtered_df = df[df[parent_key] == parent_value]
                child_dict = {}
                
                # for child_key in self.child_keys:
                #     if child_key in filtered_df.columns:
                #         child_dict[child_key] = filtered_df[child_key].dropna().unique().tolist()
                
                # now this loops in **database column order**
                for child_key in self.child_keys:
                    if child_key in filtered_df.columns:
                        vals = (
                            filtered_df[child_key]
                            .dropna()
                            .drop_duplicates()
                            .tolist()
                        )
                        child_dict[child_key] = vals  #alphabetical order
                # if child_dict is empty, we still want to add it to the master dict
                # to avoid KeyErrors later
                        
                self.master_filter_dict[parent_value] = child_dict

    def get_master_filter_dict(self):
        if FilterHierarchyBuilder.master_filter_dict_Options is None:
            FilterHierarchyBuilder.master_filter_dict_Options = self.master_filter_dict 
            
        return self.master_filter_dict

    def get_parent_filter_dict(self):
        parent_values = list(self.master_filter_dict.keys())
        return {parent_key: parent_values for parent_key in self.parent_keys}
