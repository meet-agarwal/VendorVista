from bs4 import BeautifulSoup
import os

class HTMLContentExtractor:
    def __init__(self, path1, path2):
        self.path1 = path1
        self.path2 = path2

    def _is_image(self, path):
        # Check for common image file extensions
        image_extensions = ('.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg')
        return path.lower().endswith(image_extensions)

    def _get_body_and_style_content(self, path):
        if self._is_image(path):
            # Return an <img> HTML string using the image path
            return f"""
            <img  
              src="{path}" 
              alt="Cover Page" 
              style="
                display: block;
                width: 100%;
                max-width: 1000px;
                height: auto;
                margin: 0 auto;
                object-fit: contain;
                padding: 40px 0;
              "
            >
            """
        else:
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    soup = BeautifulSoup(file, 'html.parser')

                    # Get the full content of <body>
                    body = soup.body
                    body_content = str(body) if body else None

                    # Get all <style> tags
                    styles = soup.find_all('style')
                    styles_content = ''.join(str(tag) for tag in styles) if styles else ''

                    # Return <style> + <body> HTML
                    return styles_content + body_content if body_content else None
            except FileNotFoundError:
                print(f"File not found: {path}")
                return None

    def get_first_and_last_page_content(self):
        first_page_content = self._get_body_and_style_content(self.path1)
        if not first_page_content:
            print(f"Failed to extract content from: {self.path1}")
            return None, None

        last_page_content = self._get_body_and_style_content(self.path2)
        if not last_page_content:
            print(f"Failed to extract content from: {self.path2}")
            return None, None

        return first_page_content, last_page_content
