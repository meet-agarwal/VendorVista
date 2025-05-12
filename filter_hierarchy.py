import logging
from loadDataBase import DataLoader
from config import Config

logging.basicConfig(level=logging.INFO)

class FilterHierarchyBuilder:
    def __init__(self, filters_data):
        self.filters_data = filters_data
        self.parent_keys = [k for k, v in filters_data.items() if v == "Parent"]
        self.child_keys = [k for k, v in filters_data.items() if v == "Child"]
        self.master_filter_dict = {}

        logging.info(f"Parent keys: {self.parent_keys}")
        logging.info(f"Child keys: {self.child_keys}")

    def build_hierarchy(self):
        df = DataLoader.load_excel(Config.DATABASE_PATH, "filters")

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
                for child_key in self.child_keys:
                    if child_key in filtered_df.columns:
                        child_dict[child_key] = filtered_df[child_key].dropna().unique().tolist()
                self.master_filter_dict[parent_value] = child_dict

    def get_master_filter_dict(self):
        return self.master_filter_dict

    def get_parent_filter_dict(self):
        parent_values = list(self.master_filter_dict.keys())
        return {parent_key: parent_values for parent_key in self.parent_keys}
