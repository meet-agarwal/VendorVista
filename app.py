from flask import Flask, render_template, jsonify, make_response, request  , send_from_directory , send_file, Response
import filterTypes
import filter_hierarchy
import getProductData
import getDataBase
import subprocess
from herirachy_manager import HierarchyManager  # Import the HierarchyManager class 
import json
from flask import Response
from get_images import GetImagesDict
import tempfile
import os   
import pdfkit
from config import Config  # Import the configuration settings
from datetime import datetime
from HTMLprocessing import TemplateProcessor
from template_processor import BrochureGenerator


app = Flask(__name__)

filterd_products_Dict = getProductData.GetProductsData()
hierarchy_manager = HierarchyManager()  # Create an instance of HierarchyManager

# you can pass the exact column name from your Excel that holds folder names
image_loader = GetImagesDict(image_column="Images")



@app.route('/')
def home():
    return render_template('index.html')


@app.route('/editor')
def editor():
    return render_template('editorIndex.html')

@app.route('/grapeEdit')
def load_template():
    return render_template('grapeEdit.html')


@app.route('/api/filters')
def get_filters():
    
    
    filters_Types = filterTypes.FilterTypeLoader().get_filter_dict()

    filter_hierarchy_builder = filter_hierarchy.FilterHierarchyBuilder(filters_Types)
    filter_hierarchy_builder.build_hierarchy()

    master_filter_dict = filter_hierarchy_builder.get_master_filter_dict()
    parent_filter_dict = filter_hierarchy_builder.get_parent_filter_dict()

    # return jsonify( master_filter_dict, parent_filter_dict)
    
    # … build master_filter_dict and parent_filter_dict …
    payload = [master_filter_dict, parent_filter_dict]
    body = json.dumps(payload, ensure_ascii=False, separators=(',',':'))
    return Response(body, mimetype='application/json')

    # getData = getDataBase.GetDataBase(filters_Types)
    # getData.load_master_filter_dict()
    # masterdict = getData.masterFilterDataDictMethod()
    # parentDict = getData.parentFilterDictMethod()
    
    # return jsonify(masterdict , parentDict)

@app.route('/api/getProducts', methods=['POST'])
def getProducts():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        ProductData = filterd_products_Dict.filterProducts(data)
        return jsonify(ProductData)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/settings/options', methods=['GET'])
def getOptionList():
    try:
        
        optionList = sorted(filterd_products_Dict.getAllSettingsOptions())
        print('optionList' , optionList)
        return jsonify(optionList)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/filters/updateFilters', methods=['POST'])
def updateFilters():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        new_data = {}
        for key, value in data.items():
            # Normalize the key by replacing hyphens with spaces
            new_key = key.replace('-', ' ')

            # If this is the ring size filter, convert each entry to float
            if new_key == 'ring size':
                new_value = []
                for item in value:
                    try:
                        # Ensure it's a string, strip hyphens/spaces, then cast
                        clean = str(item).replace('-', ' ').strip()
                        new_value.append(float(clean))
                    except ValueError:
                        print(f"Invalid ring size value: {item}. Skipping.")
                        print(f"Invalid ring size value: {item}. Skipping.")
                        continue
            else:
                # Otherwise just strip hyphens from any string entries
                new_value = []
                for item in value:
                    if isinstance(item, str):
                        new_item = item.replace('-', ' ')
                        new_value.append(new_item)
                    else:
                        new_value.append(item)

            new_data[new_key] = new_value

        # Feed into your hierarchy manager and return the updated filters
        updatedDictFilter = hierarchy_manager.update_hierarchy(new_data)
        return jsonify(updatedDictFilter)

    except Exception as e:
        # Catch-all error handler
        return jsonify({'error': str(e)}), 500
 
@app.route('/api/getImages', methods=['GET'])
def getImages():
    try:

            # builds the full mapping { folder_name: [full/path/1.jpg, ...], ... }
            mapping = image_loader.get_mapping()
            return jsonify(mapping)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/resources/<path:filename>')
def custom_static(filename):
    return send_from_directory('resources', filename)

# @app.route('/print-template')
# def print_template():
#     return render_template('broucher.html')

def savePDF(htmlPath, pdfPath):
    # Chrome executable path
    chromePath = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

    # Construct the command
    cmd = [
        chromePath,
        '--headless',
        '--disable-gpu',
        f'--print-to-pdf={pdfPath}',
        htmlPath
    ]

    # Run the command
    try:
        subprocess.run(cmd, check=True)
        print("PDF generated successfully.")
    except subprocess.CalledProcessError as e:
        print("Failed to generate PDF:", e)
        



    
    
@app.route('/save-template', methods=['POST'])
def save_template():  
    try:
        data = request.get_json()
        selected_data = data.get('selectedData')
        imageDict = data.get('imageDict')
        if not selected_data:
            return jsonify({'error': 'No selectedData provided'}), 400

        # Prepare template processor
        # processor = TemplateProcessor(template_name='broucher.html')
        # processor.load_data(selected_data)
        first_path = r"C:\Users\dell\Documents\first.html"
        last_path = r"C:\Users\dell\Documents\last.html"
        gen = BrochureGenerator('broucher.html')
        
        html_content = gen.generate(selected_data, imageDict,
                             first_path, last_path)

        # Save HTML
        temp_dir = os.path.join(tempfile.gettempdir(), 'vendor_vista_brochures')
        os.makedirs(temp_dir, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        base_filename = f'brochure_{timestamp}'
        html_filename = f'{base_filename}.html'
        html_filepath = os.path.join(temp_dir, html_filename)
        with open(html_filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)

        # STEP 2: Create a temporary path to save the generated PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as pdf_temp:
            pdf_filepath = pdf_temp.name
        
        
        savePDF(html_filepath, pdf_filepath)
        
        # STEP 4: Read the generated PDF as bytes and return it in the response
        with open(pdf_filepath, 'rb') as f:
            pdf_bytes = f.read()
            
        # Step 5: Clean up temp files
        os.remove(pdf_filepath)
    
        response = make_response(pdf_bytes)
        response.headers.set('Content-Type', 'application/pdf')
        response.headers.set('Content-Disposition', 'inline; filename=brochure.pdf')
        return response
    
    except Exception as e:
        app.logger.exception("save_template error")
        return jsonify({'error': str(e)}), 500
    
    
# Configuration
TABLE_OPTIONS_FILE = 'table_options.json'

DEFAULT_TAGS = {
    "tags": [
        "Adjustable",
        "Design",
        "Gemstone",
        "Metal"
    ]
}

def ensure_config():
    """Ensure the config file exists, create it with defaults if missing."""
    if not os.path.exists(TABLE_OPTIONS_FILE):
        with open(TABLE_OPTIONS_FILE, 'w') as f:
            json.dump(DEFAULT_TAGS, f, indent=2)
        return True  # File was created
    return False  # File already existed

def read_tags():
    """Read tags from file, return (tags_dict, created_flag)."""
    if not os.path.exists(TABLE_OPTIONS_FILE):
        # Create default file if missing
        ensure_config()
        return DEFAULT_TAGS, True
    with open(TABLE_OPTIONS_FILE, 'r') as f:
        return json.load(f), False

def write_tags(tags):
    """Write tags to file."""
    with open(TABLE_OPTIONS_FILE, 'w') as f:
        json.dump({"tags": tags}, f, indent=2)

@app.route('/settings/tableOptions', methods=['GET', 'POST'])
def settings_tableoptions():
    if request.method == 'GET':
        tags, created = read_tags()
        response = {
            'tags': tags['tags']
        }
        if created:
            response['alert'] = 'Default configuration file was missing and has been created.'
        return jsonify(response)

    elif request.method == 'POST':
        data = request.get_json(silent=True)
        if not data or 'tags' not in data or not isinstance(data['tags'], list):
            return jsonify({'error': 'Invalid format. Provide a JSON with a "tags" list.'}), 400
        write_tags(data['tags'])
        return jsonify({'message': 'Tags updated successfully', 'tags': data['tags']})
    
CONFIG_FILE = 'templates_data.json'

def read_editor_config():
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def write_editor_config(data):
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

@app.route('/api/editor-config', methods=['GET'])
def get_editor_config():
    try:
        config = read_editor_config()
        return jsonify(config)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/templates-selected', methods=['GET', 'POST'])
def get_templates_selected():
    if request.method == 'GET':
        try:
            config = read_editor_config()
            templates_selected = config.get('templates_selected', {})

            # Get the selected keys list
            selected_keys = templates_selected.get('Selected_list', [])

            # Filter templates_selected based on selected_keys
            filtered_data = {
                key: templates_selected.get(key, {}) 
                for key in selected_keys
            }

            return jsonify({'templates_selected': filtered_data})
        except Exception as e:
            return jsonify({'error': str(e)}), 500


    elif request.method == 'POST':
        try:
            new_data = request.get_json()
            if not new_data:
                return jsonify({'error': 'No data provided'}), 400

            config = read_editor_config()
            current_selection = config.get('templates_selected', {})

            # Ensure Selected_list is initialized correctly
            selected_list = current_selection.get('Selected_list', [])

            for page_key, new_value in new_data.items():
                # Allow only "first", "product", or "last"
                if page_key not in ['first', 'product', 'last']:
                    return jsonify({'error': f'Invalid page: {page_key}'}), 400

                existing_template = current_selection.get(page_key, {}).get('template', {})

                # If already filled, block overwrite
                if existing_template and isinstance(existing_template, dict) and len(existing_template) > 0:
                    return jsonify({
                        'error': f'"{page_key}" is already selected. Cannot overwrite.',
                        'page': page_key
                    }), 409  # HTTP 409 Conflict

                # Save the new template
                current_selection[page_key] = new_value

                # Keep track of updated pages
                if page_key not in selected_list:
                    selected_list.append(page_key)

            # Update the config with changes
            current_selection['Selected_list'] = selected_list
            config['templates_selected'] = current_selection

            write_editor_config(config)

            return jsonify({
                'message': 'Template saved successfully.',
                'templates_selected': config['templates_selected']
            })

        except Exception as e:
            return jsonify({'error': str(e)}), 500



# @app.route('/api/templates-selected/delete', methods=['POST'])
# def delete_selected_template():
#     try:
#         data = request.get_json()
#         page_to_clear = data.get('page')  # "first" | "product" | "last"

#         if page_to_clear not in ['first', 'product', 'last']:
#             return jsonify({'error': 'Invalid page type'}), 400

#         config = read_editor_config()
#         if 'templates_selected' not in config:
#             config['templates_selected'] = {}

#         # Reset to empty structure
#         config['templates_selected'][page_to_clear] = {
#             "template": {},
#             "links": {
#                 "pdf": "",
#                 "images": "",
#                 "html": ""
#             },
#             "mode" : "" 
#         }

#         write_editor_config(config)
#         return jsonify({'message': f'"{page_to_clear}" selection cleared.'})

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

@app.route('/api/templates-selected/delete', methods=['POST'])
def delete_selected_template():
    try:
        data = request.get_json()
        page_to_clear = data.get('page')  # "first" | "product" | "last"
        new_template = data.get('template', {})
        new_mode = data.get('mode', '')
        new_links = data.get('links', {})

        VALID_PAGES = ['first', 'product', 'last']

        if page_to_clear not in VALID_PAGES:
            return jsonify({
                "success": False,
                "error": f'Invalid page type: "{page_to_clear}".'
            }), 400

        config = read_editor_config()
        selected = config.get('templates_selected', {})

        existing_data = selected.get(page_to_clear, {})
        selected_list = selected.get("Selected_list", [])

        if not existing_data:
            return jsonify({
                "success": False,
                "error": f'No existing data found for page "{page_to_clear}".'
            }), 404

        # Check if data matches before deletion
        match = (
            existing_data.get('template', {}) == new_template and
            existing_data.get('mode', '') == new_mode and
            existing_data.get('links', {}) == new_links
        )

        if not match:
            return jsonify({
                "success": False,
                "error": "Template data does not match the current selection.",
                "details": {
                    "expected": existing_data,
                    "received": {
                        "template": new_template,
                        "mode": new_mode,
                        "links": new_links
                    }
                }
            }), 409

        # Remove from Selected_list
        if page_to_clear in selected_list:
            selected_list.remove(page_to_clear)

        selected["Selected_list"] = selected_list

        # Clear the template data
        selected[page_to_clear] = {
            "template": {},
            "links": {
                "pdf": "",
                "images": "",
                "html": ""
            },
            "mode": ""
        }

        config['templates_selected'] = selected
        write_editor_config(config)

        return jsonify({
            "success": True,
            "message": f'{page_to_clear.capitalize()} page selection cleared.'
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Server error while deleting template.",
            "details": str(e)
        }), 500  



if __name__ == '__main__':
    app.run(debug=True)
