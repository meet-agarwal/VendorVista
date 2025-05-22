import logging
import os
import glob
import pandas as pd
from loadDataBase import DataLoader
from config import Config

logging.basicConfig(level=logging.DEBUG)


class GetImagesDict:
    """
    Builds a mapping from folder names (from a DataFrame column) to lists of image file paths.
    If a folder is missing or has no images, the list will be empty.
    """

    def __init__(self, image_column: str = "Images"):
        """
        :param image_column: Name of the column in the DataFrame that holds the folder names.
        """
        self.base_dir = Config.BASE_IMAGE_DIR
        self.image_col = image_column
        logging.debug(f"Base image directory: {self.base_dir}, exists: {os.path.isdir(self.base_dir)}")
        self.df = self._load_data()
        logging.debug(f"Loaded DataFrame columns: {self.df.columns.tolist()}")
        if self.df.empty:
            logging.warning("DataFrame is empty after loading.")
        if self.image_col not in self.df.columns:
            logging.error(f"Specified image column '{self.image_col}' not found in DataFrame.")
        self.image_dict = self._build_image_dict()

    def _load_data(self) -> pd.DataFrame:
        """
        Load the DataFrame using DataLoader and Config.
        Cleans up whitespace and missing values.
        """
        try:
            df = DataLoader.load_excel(Config.DATABASE_PATH, "filters")
            df.reset_index(drop=True, inplace=True)
            df.fillna('', inplace=True)
            df = df.applymap(lambda x: x.strip() if isinstance(x, str) else x)

            logging.info(f"Loaded product data: {len(df)} rows.")
            return df
        except Exception as e:
            logging.error(f"Failed to load product data: {e}")
            return pd.DataFrame()

    def _build_image_dict(self) -> dict:
        """
        Create a dict mapping folder names to lists of image paths.
        """
        mapping = {}
        # Ensure DataFrame and required column exist
        if self.df.empty or self.image_col not in self.df.columns:
            logging.warning("DataFrame is empty or missing the image column. Cannot build image dict.")
            return mapping

        # Get unique folder names
        folder_names = self.df[self.image_col].astype(str).str.strip().unique()
        logging.debug(f"Folder names from DataFrame: {folder_names}")

        # Define image file patterns
        patterns = ["*.jpg", "*.jpeg", "*.png", "*.gif", "*.bmp"]

        for folder_name in folder_names:
            if not folder_name:
                continue
            folder_path = os.path.join(self.base_dir, folder_name)
            # logging.debug(f"Checking folder path: {folder_path}, exists: {os.path.isdir(folder_path)}")
            if os.path.isdir(folder_path):
                images = []
                for pat in patterns:
                    matched = glob.glob(os.path.join(folder_path, pat))
                    # logging.debug(f"Pattern {pat} found {len(matched)} files in {folder_path}")
                    images.extend(matched)
                mapping[folder_name] = images
            else:
                # logging.warning(f"Folder does not exist: {folder_path}")
                mapping[folder_name] = []

        # logging.info(f"Built image dict for {len(mapping)} folders.")
        return mapping

    def get_image_paths(self, folder_name: str) -> list:
        """
        Retrieve the list of image paths for a given folder name.
        Returns empty list if folder not found or no images.
        """
        return self.image_dict.get(folder_name, [])

    def get_mapping(self) -> dict:
        """
        Get the complete folder-to-image-paths mapping.
        """
        imageD = self.image_dict
        return imageD
