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

        # Locate raw page_break section and its parent using object attribute
        self.raw_block = self.soup.find('div', attrs={'object': 'page_break'})
        if not self.raw_block:
            raise ValueError("Template must contain a <div object='page_break'> section")
        self.parent = self.raw_block.parent

        # Read items per page and row IDs
        try:
            self.items_per_page = int(self.raw_block['products'])
        except Exception:
            raise ValueError("Attribute 'products' on page_break must be an integer")
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
        import json

        # Step 1: Load tags from table_options.json
        table_json_path = os.path.join(os.getcwd(), 'table_options.json')
        with open(table_json_path, 'r', encoding='utf-8') as f:
            tag_list = json.load(f).get('tags', [])

        entries = list(selected_data.items())
        total = len(entries)
        pages = math.ceil(total / self.items_per_page)

        for p in range(pages):
            # Clone raw block
            clone = BeautifulSoup(str(self.raw_block), 'html.parser').div

            # Determine entries for this page
            page_items = entries[p * self.items_per_page: (p + 1) * self.items_per_page]
            slots = clone.find_all(attrs={'object': lambda x: x and x.startswith('item')})

            for idx, slot in enumerate(slots):
                if idx >= len(page_items):
                    slot.decompose()
                    continue

                key, data = page_items[idx]

                # Fill image
                img_tag = slot.find(attrs={'object': 'image'})
                folder = data.get('Images')
                sources = image_data.get(folder, [])
                if img_tag and sources:
                    img_tag['src'] = sources[0]

                # Fill table dynamically using tags
                table = slot.find(attrs={'object': 'product_details'})
                if table:
                    table = table.find('table')  # Find the table inside product_details
                    if table:
                        table.clear()  # Remove any template content
                        for tag in tag_list:
                            value = data.get(tag)
                            if value:
                                row = self.soup.new_tag("tr")

                                label_cell = self.soup.new_tag("td")
                                label_cell.string = tag

                                value_cell = self.soup.new_tag("td")
                                value_cell.string = str(value)

                                row.append(label_cell)
                                row.append(value_cell)
                                table.append(row)

            self.page_break.append(clone)

        # Clean and add first page
        first_div = self.soup.find(attrs={'object': 'first_page'})
        if first_div:
            first_div.decompose()
        new_first_div = self.soup.new_tag("div", attrs={"object": "first_page"})
        self.parent.insert(0, new_first_div)
        self._inject_fragment('first_page', first_path)

        for block in self.page_break:
            self.parent.append(block)

        # Clean and add last page
        last_div = self.soup.find(attrs={'object': 'last_page'})
        if last_div:
            last_div.decompose()
        new_last_div = self.soup.new_tag("div", attrs={"object": "last_page"})
        self.parent.append(new_last_div)
        self._inject_fragment('last_page', last_path)

        return str(self.soup)


    def _inject_fragment(self, div_id: str, fragment_path: str):
        """
        Reads an HTML fragment and injects its <style> and <body>
        contents into the <div object=div_id> placeholder.
        """
        target_div = self.soup.find('div', attrs={'object': div_id})
        if not target_div:
            raise ValueError(f"No <div object='{div_id}'> found in template")

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