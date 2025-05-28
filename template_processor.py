from bs4 import BeautifulSoup
import os
import math

class BrochureGenerator:
    """
    Generates a paginated HTML brochure by cloning and populating
    a repeatable page section within a base template.
    """
    def __init__(self, template_name: str):
        # Load and parse the base template
        self.templates_dir = os.path.join(os.getcwd(), 'templates')
        path = os.path.join(self.templates_dir, template_name)
        with open(path, 'r', encoding='utf-8') as f:
            self.soup = BeautifulSoup(f.read(), 'html.parser')

        # Locate raw page_break section and its parent
        self.raw_block = self.soup.find('div', class_='page_break')
        if not self.raw_block:
            raise ValueError("Template must contain a <div class='page_break'> section")
        self.parent = self.raw_block.parent

        # Read items per page and row IDs
        try:
            self.items_per_page = int(self.raw_block['product'])
        except Exception:
            raise ValueError("Attribute 'product' on page_break must be an integer")
        rows_attr = self.raw_block.get('rows', '')
        self.row_ids = [r.strip().replace("_", " ") for r in rows_attr.split(',') if r.strip()]

        # Remove placeholder block for regeneration
        self.raw_block.extract()
        
        self.page_break = []

    def generate(self, selected_data: dict, image_data: dict,
                 first_path: str, last_path: str) -> str:
        """
        Build the brochure HTML string by populating data.
        - selected_data: dict mapping key -> field dict
        - image_data: dict mapping folder -> list of image URLs
        """
        entries = list(selected_data.items())
        total = len(entries)
        pages = math.ceil(total / self.items_per_page)

    

        # Build pages
        for p in range(pages):
            # Clone raw block
            clone = BeautifulSoup(str(self.raw_block), 'html.parser').div

            # Determine entries for this page
            page_items = entries[p * self.items_per_page : (p + 1) * self.items_per_page]
            slots = clone.select('[class^="item"]')

            for idx, slot in enumerate(slots):
                # If no data for this slot, remove it
                if idx >= len(page_items):
                    slot.decompose()
                    continue

                key, data = page_items[idx]

                # Fill image using image_data logic
                img_tag = slot.find('img', id='image')
                folder = data.get('Images')
                sources = image_data.get(folder, [])
                if img_tag and sources:
                    img_tag['src'] = sources[0]

                # Fill text fields in table
                table = slot.find('table')
                if table:
                    for rid in self.row_ids:
                        cell_id = rid.replace(' ', '_')
                        cell = table.find(id=cell_id)
                        if not cell:
                            continue
                        value = data.get(rid)
                        if not value:
                            row = cell.find_parent('tr')
                            if row:
                                row.decompose()
                        else:
                            # Set label and value
                            label_cell = cell.find_previous_sibling('td')
                            if label_cell:
                                label_cell.string = rid
                            cell.string = str(value)

            self.page_break.append(clone)
        
        
        # # Insert generated pages at the original raw_block location
        # self.parent.append(BeautifulSoup(self.page_break, 'html.parser'))

        # Inject first and last page fragments
        
        # Check for existing <div id="last_page">, remove if found
        first_div = self.soup.find('div', id='last_page')
        if first_div:
            first_div.decompose()  # Remove from the DOM

        # Create and append a new empty <div id="last_page">
        new_first_div = self.soup.new_tag("div", id="last_page")
        self.parent.append(new_first_div)
        
        self._inject_fragment('first_page', first_path)
        
        for block in self.page_break:
            self.parent.append(block)
            
        
        
        # Check for existing <div id="last_page">, remove if found
        last_div = self.soup.find('div', id='last_page')
        if last_div:
            last_div.decompose()  # Remove from the DOM

        # Create and append a new empty <div id="last_page">
        new_last_div = self.soup.new_tag("div", id="last_page")
        self.parent.append(new_last_div)
        
        
        self._inject_fragment('last_page', last_path)
        
        

        return str(self.soup)

    def _inject_fragment(self, div_id: str, fragment_path: str):
        """
        Reads an HTML fragment and injects its <style> and <body>
        contents into the <div id=div_id> placeholder.
        """
        target_div = self.soup.find('div', id=div_id)
        if not target_div:
            raise ValueError(f"No <div id='{div_id}'> found in template")

        with open(fragment_path, 'r', encoding='utf-8') as f:
            frag_soup = BeautifulSoup(f.read(), 'html.parser')

        for tag in frag_soup.find_all(['style', 'body']):
            if tag.name == 'style':
                target_div.append(tag)
            elif tag.name == 'body':
                for child in tag.contents:
                    if isinstance(child, str) and child.strip() == '':
                        continue
                    target_div.append(child)
            
