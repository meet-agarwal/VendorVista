import filterTypes
from loadDataBase import DataLoader
from config import Config
import pandas as pd
import filter_hierarchy
import logging

class HierarchyManager:
    def __init__(self):
        self.hierarchy = {}
        self.loader = DataLoader()
        self.filter_child_list = [item.lower() for item in filterTypes.FilterTypeLoader.get_child_keys()]
        self.master_filter_dict = None 
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
            
    def load_master_dict(self):
        if self.master_filter_dict is not None:
            return self.master_filter_dict
        try:
            
            master = filter_hierarchy.FilterHierarchyBuilder.master_filter_dict_Options
            self.master_filter_dict = master 
            
            logging.info("Successfully loaded master filter dictionary.")
        except Exception as e:
            logging.error(f"Failed to load master filter dictionary: {str(e)}")
        return self.master_filter_dict
        
    # def update_hierarchy(self, selected_filters: dict):
        if self.df is None:
            return {}

        self.load_master_dict()
        
        # 1. Extract selected product(s)
        products = list(selected_filters.keys())
        if not products:
            return {}

        result = {}

        for product in products:
            product_filters = selected_filters.get(product, {})
            # if not isinstance(product_filters, dict):
            #     continue

            # 2. Determine max position in child filters
            selected_keys = list(product_filters.keys())
            max_pos = max([self.check_position(k) for k in selected_keys], default=-1)
            filters_to_process = self.filter_child_list[max_pos + 1:]

            # 3. Extract from master_filter_dict[product] the filters below current selection
            if product not in self.master_filter_dict:
                continue

            process_filters = {}
            product_dict = self.master_filter_dict[product]

            for f in filters_to_process:
                if f in product_dict:
                    process_filters[f] = product_dict[f]

            # 4. Filter the dataframe using selected values
            filtered_df = self.df[self.df['Product'] == product].copy()

            for k, v in product_filters.items():
                if k in filtered_df.columns:
                    if not isinstance(v, list):
                        v = [v]
                    filtered_df = filtered_df[filtered_df[k].isin(v)]

            # 5. Collect options for filters below
            result[product] = {}
            for k in process_filters.keys():
                if k in filtered_df.columns:
                    result[product][k] = sorted(filtered_df[k].dropna().unique().tolist())

        return result

        
    # def update_hierarchy(self, selected_filters: dict):
    #     if self.df is None:
    #         return {}

    #     self.load_master_dict()

    #     if not selected_filters:
    #         return {}

    #     # 1. Determine max position in child filters
    #     selected_keys = list(selected_filters.keys())
    #     max_pos = max([self.check_position(k) for k in selected_keys], default=-1)
    #     if(max_pos == -1):
    #         filters_to_process = self.filter_child_list
            
    #     filters_to_process = self.filter_child_list[max_pos + 1:]
        
        

    #     # 2. Filter the dataframe using selected values
    #     filtered_df = self.df.copy()
        
    #     # Step 1: Convert DataFrame columns to lowercase once
    #     filtered_df.columns = map(str.lower, filtered_df.columns)
        
    #     # for k, v in selected_filters.items():
          
    #     #     k = k.lower()  # normalize key
    #     #     if k in filtered_df.columns:
    #     #         if not isinstance(v, list):
    #     #             v = [v]
    #     #         filtered_df = filtered_df[filtered_df[k].isin(v)]
        
    #     # Normalize column names to lowercase
    #     filtered_df.columns = [col.lower() for col in filtered_df.columns]

    #     for k, v in selected_filters.items():
    #         k = k.lower()  # normalize filter key to match DataFrame columns
    #         if k in filtered_df.columns:
    #             if not isinstance(v, list):
    #                 v = [v]
    #             # Convert both the filter values and column data to lowercase for comparison
    #             filtered_df = filtered_df[filtered_df[k].str.lower().isin([str(val).lower() for val in v])]


    #     # 3. Collect options for filters below
    #     result = {}
    #     for k in filters_to_process:
    #         k = k.lower()  # normalize key
    #         if k in filtered_df.columns:
    #             result[k] = sorted(filtered_df[k].dropna().unique().tolist())

    #     return result
 
    def normalize_key(self , key):
        return key.strip().lower().replace("-", " ")

    def update_hierarchy(self, selected_filters: dict):
        if self.df is None or not selected_filters:
            return {}

        self.load_master_dict()

        # Normalize keys in selected_filters
        selected_filters = {self.normalize_key(k): v for k, v in selected_filters.items()}

        # Normalize product
        product = selected_filters.get('product')
        if not product:
            return {}

        if not isinstance(product, list):
            product = [product]

        # Normalize column names in DataFrame
        filtered_df = self.df.copy()
        filtered_df.columns = [self.normalize_key(col) for col in filtered_df.columns]

        # Filter by product
        filtered_df = filtered_df[filtered_df['product'].str.lower().isin([str(p).lower() for p in product])]

        # Remove product from selected_filters
        selected_filters.pop('product', None)

        # Normalize filter_child_list
        normalized_filter_child_list = [self.normalize_key(f) for f in self.filter_child_list]

        result = {}

        for key in normalized_filter_child_list:
            if key not in filtered_df.columns:
                continue

            # # Fill unique values
            # result[key] = sorted(filtered_df[key].dropna().unique().tolist())

            # If key exists in selected_filters, filter again
            if key in selected_filters:
                val = selected_filters[key]
                if not isinstance(val, list):
                    val = [val]
                val = [str(v).lower() for v in val]
                filtered_df = filtered_df[filtered_df[key].str.lower().isin(val)]
                
        for key in normalized_filter_child_list:
            if key not in filtered_df.columns:
                continue

            # Fill unique values
            result[key] = sorted(filtered_df[key].dropna().unique().tolist())

            # # If key exists in selected_filters, filter again
            # if key in selected_filters:
            #     val = selected_filters[key]
            #     if not isinstance(val, list):
            #         val = [val]
            #     val = [str(v).lower() for v in val]
            #     filtered_df = filtered_df[filtered_df[key].str.lower().isin(val)]

        return result
        
       
       
# import filterTypes
# import filter_hierarchy
# from loadDataBase import DataLoader
# from config import Config
# import pandas as pd
# import logging

# class HierarchyManager:
#     _dataframe_cache = None
#     _filter_dict_cache = None

#     def __init__(self):
#         self.loader = DataLoader()
#         self.master_filter_dict = self.get_master_filter_dict()
#         self.filter_child_list = self.get_child_filter_list()
#         self.df = self.load_data()

#     def get_master_filter_dict(self):
#         if HierarchyManager._filter_dict_cache is not None:
#             return HierarchyManager._filter_dict_cache

#         filter_dict = filter_hierarchy.FilterHierarchyBuilder.master_filter_dict_Options
#         HierarchyManager._filter_dict_cache = filter_dict
#         return filter_dict

#     def get_child_filter_list(self):
#         return [k for k, v in self.master_filter_dict.items() if v == "Child"]

#     def load_data(self):
#         if HierarchyManager._dataframe_cache is not None:
#             return HierarchyManager._dataframe_cache
#         try:
#             df = self.loader.load_excel(Config.DATABASE_PATH, sheet_name="filters")
#             logging.info("Excel data loaded and cached.")
#             HierarchyManager._dataframe_cache = df
#             return df
#         except FileNotFoundError as e:
#             logging.error(f"Excel file not found: {str(e)}")
#         except Exception as e:
#             logging.error(f"Error loading Excel file: {str(e)}")
#         return pd.DataFrame()

#     def check_position(self, filter_name):
#         return self.filter_child_list.index(filter_name) if filter_name in self.filter_child_list else -1

#     def validate_filters(self, selected_filters: dict):
#         return {k: v for k, v in selected_filters.items() if k in self.filter_child_list}

#     def update_filters(self, selected_filters: dict) -> dict:
#         if self.df.empty:
#             return {}

#         selected_filters = self.validate_filters(selected_filters)
#         if not selected_filters:
#             return {}

#         max_pos = max([self.check_position(f) for f in selected_filters], default=-1)
#         child_filters = self.filter_child_list[max_pos + 1:]

#         filtered_df = self.df.copy()
#         for col, values in selected_filters.items():
#             if not isinstance(values, list):
#                 values = [values]
#             filtered_df = filtered_df[filtered_df[col].isin(values)]

#         result = {}
#         for child in child_filters:
#             if child in filtered_df.columns:
#                 result[child] = sorted(filtered_df[child].dropna().unique().tolist())

#         return result
