# from bs4 import BeautifulSoup
# import os

# class TemplateProcessor:
#     def __init__(self, template_name: str, templates_dir: str = None):
#         """
#         Load the base template HTML and extract the page_break block.
#         """
#         self.templates_dir = templates_dir or os.path.join(os.getcwd(), 'templates')
#         path = os.path.join(self.templates_dir, template_name)
#         with open(path, 'r', encoding='utf-8') as f:
#             raw_html = f.read()

#         # Parse full document
#         self.soup = BeautifulSoup(raw_html, 'html.parser')
#         # Locate the page break div
#         page_div = self.soup.find('div', class_='page_break')
#         if page_div is None:
#             raise ValueError("No <div class='page_break'> found in template")

#         # read pagination attributes
#         try:
#             self.items_per_page = int(page_div['product'])
#         except (KeyError, ValueError):
#             raise ValueError("page_break div must have integer 'product' attribute")

#         self.rows = [rid.strip().replace('_', ' ') for rid in page_div.get('rows', '').split(',') if rid.strip()]
#         # Store the raw page template HTML
#         self.page_template_html = page_div.decode_contents()

#         # Placeholder for data
#         self.selected_data = {}

#     def load_data(self, selected_data: dict):
#         """
#         Store and validate selected_data.
#         """
#         if not isinstance(selected_data, dict) or not selected_data:
#             raise ValueError("selected_data must be a non-empty dict")
#         # Optionally: validate each item
#         self.selected_data = selected_data

#     def render_pages(self) -> str:
#         pages_html = []
#         item_ids = list(self.selected_data.keys())
#         total = len(item_ids)

#         for start_idx in range(0, total, self.items_per_page):
#             subset_ids = item_ids[start_idx : start_idx + self.items_per_page]
#             frag_soup = BeautifulSoup(self.page_template_html, 'html.parser')

#             # 1) Grab all the .item-slot containers
#             #    (e.g. <div class="item1"> … </div>, <div class="item2"> … </div>, etc.)
#             item_divs = frag_soup.select('[class^="item"]')

#             # 2) Loop per-slot
#             for slot_idx, slot_div in enumerate(item_divs):
#                 if slot_idx >= len(subset_ids):
#                     # No product for this slot → completely remove it
#                     slot_div.decompose()
#                     continue

#                 product_key = subset_ids[slot_idx]
#                 data = self.selected_data[product_key]

#                 # 3) Fill the image (if any)
#                 img_tag = slot_div.find('img', id='image')
#                 if img_tag:
#                     img_tag['src'] = data.get('Image', '')

#                 # 4) Fill each row inside that slot
#                 #    We know self.rows is a list of strings like ["Metal", "Metal Purity", ...]
#                 for rid in self.rows:
#                     eid = rid.replace(' ', '_')
#                     cell = slot_div.find(id=eid)  # *only* inside this slot_div

#                     if not cell:
#                         # Maybe the template doesn’t even have this <td id="…">,
#                         # just skip it
#                         continue

#                     # JS’s logic: if value is empty, remove the entire <tr>
#                     display_key = rid  # rid is already "Metal" or "Main Stone Color"
#                     value = data.get(display_key, '')

#                     if value in (None, '', []):
#                         # Remove the whole <tr> row
#                         tr = cell.find_parent('tr')
#                         if tr:
#                             tr.decompose()
#                     else:
#                         # Write label and value
#                         label_td = cell.find_previous_sibling('td')
#                         if label_td:
#                             label_td.string = display_key
#                         cell.string = str(value)

#             # After all slots are processed, convert frag_soup back to string and append
#             pages_html.append(str(frag_soup))

#         # Finally, stitch pages_html together, insert first_page/last_page wrappers, etc.
#         return "".join(pages_html)

#     def inject_first_last(self, first_path: str, last_path: str) -> str:
#         """
#         Load first and last HTML fragments and insert into template.
#         """
#         # Render the core pages first
#         content = self.render_pages()

#         # Load first.html
#         with open(first_path, 'r', encoding='utf-8') as f:
#             first_soup = BeautifulSoup(f.read(), 'html.parser')
#         first_body = first_soup.body.decode_contents() if first_soup.body else ''
#         first_style = ''.join([str(s) for s in first_soup.find_all('style')])

#         # Load last.html
#         with open(last_path, 'r', encoding='utf-8') as f:
#             last_soup = BeautifulSoup(f.read(), 'html.parser')
#         last_body = last_soup.body.decode_contents() if last_soup.body else ''
#         last_style = ''.join([str(s) for s in last_soup.find_all('style')])

#         # Build full document
#         full_soup = BeautifulSoup('<div id="first_page"></div>' + content + '<div id="last_page"></div>', 'html.parser')
#         # Insert first
#         fp = full_soup.find('div', id='first_page')
#         if fp:
#             fp.clear()
#             if first_style:
#                 fp.append(BeautifulSoup(first_style, 'html.parser'))
#             fp.append(BeautifulSoup(first_body, 'html.parser'))
#         # Insert last
#         lp = full_soup.find('div', id='last_page')
#         if lp:
#             lp.clear()
#             if last_style:
#                 lp.append(BeautifulSoup(last_style, 'html.parser'))
#             lp.append(BeautifulSoup(last_body, 'html.parser'))

#         return str(full_soup)

#     def get_final_html(self, first_path: str, last_path: str) -> str:
#         """
#         Convenience method to produce the complete processed HTML.
#         """
#         return self.inject_first_last(first_path, last_path)




from bs4 import BeautifulSoup
import os
import copy

class TemplateProcessor:
    def __init__(self, template_name: str, templates_dir: str = None):
        """
        Load the base template HTML and extract the page_break block.
        """
        self.templates_dir = templates_dir or os.path.join(os.getcwd(), 'templates')
        path = os.path.join(self.templates_dir, template_name)
        with open(path, 'r', encoding='utf-8') as f:
            raw_html = f.read()

        # Parse full document
        self.raw_html = raw_html
        self.base_soup = BeautifulSoup(raw_html, 'html.parser')

        # Locate the template page_break div
        page_div = self.base_soup.find('div', class_='page_break')
        if page_div is None:
            raise ValueError("No <div class='page_break'> found in template")

        # Read pagination attributes
        try:
            self.items_per_page = int(page_div['product'])
        except (KeyError, ValueError):
            raise ValueError("page_break div must have integer 'product' attribute")

        # Parse field IDs
        self.rows = [rid.strip() for rid in page_div.get('rows', '').split(',') if rid.strip()]

        # Store the raw snippet and its attributes for cloning
        self.page_template_html = page_div.decode_contents()
        # Keep original tag for copying attributes
        self.page_template_attrs = dict(page_div.attrs)

        # Placeholder for data
        self.selected_data = {}

    def load_data(self, selected_data: dict):
        """
        Store and validate selected_data.
        """
        if not isinstance(selected_data, dict) or not selected_data:
            raise ValueError("selected_data must be a non-empty dict")
        self.selected_data = selected_data

    def _render_page_block(self, subset_ids):
        """
        Render a single page_break block for the given subset of keys.
        """
        frag_soup = BeautifulSoup(self.page_template_html, 'html.parser')
        # Reconstruct the wrapper div
        wrapper = BeautifulSoup('', 'html.parser').new_tag('div', **self.page_template_attrs)
        # Append inner snippet
        for child in frag_soup.contents:
            wrapper.append(child)

        item_divs = wrapper.select('[class^="item"]')
        for idx, slot_div in enumerate(item_divs):
            if idx >= len(subset_ids):
                slot_div.decompose()
                continue
            key = subset_ids[idx]
            data = self.selected_data[key]
            # Image field
            img = slot_div.find('img', id='image')
            if img:
                img['src'] = data.get('Image', '')
            # Fill text fields
            for rid in self.rows:
                cell_id = rid.replace(' ', '_')
                cell = slot_div.find(id=cell_id)
                if not cell:
                    continue
                value = data.get(rid, '')
                if not value:
                    tr = cell.find_parent('tr')
                    if tr:
                        tr.decompose()
                else:
                    label_td = cell.find_previous_sibling('td')
                    if label_td:
                        label_td.string = rid.replace('_', ' ')
                    cell.string = str(value)
        return wrapper

    def render_pages(self) -> list:
        """
        Generate list of page_break BeautifulSoup tags.
        """
        keys = list(self.selected_data.keys())
        total = len(keys)
        pages = []
        for i in range(0, total, self.items_per_page):
            subset = keys[i: i + self.items_per_page]
            pages.append(self._render_page_block(subset))
        return pages

    def get_final_html(self, first_path: str, last_path: str) -> str:
        """
        Produce the complete processed HTML by injecting first/last pages and product blocks.
        """
        # Deep copy the base soup
        soup = copy.copy(self.base_soup)
        # Render pages
        page_blocks = self.render_pages()

        # Inject into container
        container = soup.find('div', class_='container')
        if not container:
            raise ValueError("Container <div class='container'> not found")

        # Clear existing first_page, original page_break, last_page
        container.find('div', id='first_page').clear()
        for pb in container.find_all('div', class_='page_break'):
            pb.decompose()
        container.find('div', id='last_page').clear()

        # Load first.html
        with open(first_path, 'r', encoding='utf-8') as f:
            first_soup = BeautifulSoup(f.read(), 'html.parser')
        first_content = []
        for tag in first_soup.find_all(['style', 'body']):
            first_content.extend(tag.contents)

        # Load last.html
        with open(last_path, 'r', encoding='utf-8') as f:
            last_soup = BeautifulSoup(f.read(), 'html.parser')
        last_content = []
        for tag in last_soup.find_all(['style', 'body']):
            last_content.extend(tag.contents)

        # Append first, pages, last
        fp = container.find('div', id='first_page')
        for node in first_content:
            fp.append(node)
        for block in page_blocks:
            container.append(block)
        lp = container.find('div', id='last_page')
        for node in last_content:
            lp.append(node)

        return str(soup)
