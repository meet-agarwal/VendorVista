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
        



    
    
# @app.route('/save-template', methods=['POST'])
# def save_template():
#     try:
#         data = request.get_json()
#         selected_data = data.get('selectedData')
#         imageDict = data.get('imageDict')
#         if not selected_data:
#             return jsonify({'error': 'No selectedData provided'}), 400
#
#         # Prepare template processor
#         # processor = TemplateProcessor(template_name='broucher.html')
#         # processor.load_data(selected_data)
#         first_path = r"C:\Users\dell\Documents\first.html"
#         last_path = r"C:\Users\dell\Documents\last.html"
#         gen = BrochureGenerator('broucher.html')
#
#         html_content = gen.generate(selected_data, imageDict,
#                              first_path, last_path)
#
#         # Save HTML
#         temp_dir = os.path.join(tempfile.gettempdir(), 'vendor_vista_brochures')
#         os.makedirs(temp_dir, exist_ok=True)
#         timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
#         base_filename = f'brochure_{timestamp}'
#         html_filename = f'{base_filename}.html'
#         html_filepath = os.path.join(temp_dir, html_filename)
#         with open(html_filepath, 'w', encoding='utf-8') as f:
#             f.write(html_content)
#
#         # STEP 2: Create a temporary path to save the generated PDF
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as pdf_temp:
#             pdf_filepath = pdf_temp.name
#
#
#         savePDF(html_filepath, pdf_filepath)
#
#         # STEP 4: Read the generated PDF as bytes and return it in the response
#         with open(pdf_filepath, 'rb') as f:
#             pdf_bytes = f.read()
#
#         # Step 5: Clean up temp files
#         os.remove(pdf_filepath)
#
#         response = make_response(pdf_bytes)
#         response.headers.set('Content-Type', 'application/pdf')
#         response.headers.set('Content-Disposition', 'inline; filename=brochure.pdf')
#         return response
#
#     except Exception as e:
#         app.logger.exception("save_template error")
#         return jsonify({'error': str(e)}), 500


@app.route('/save-template', methods=['POST'])
def save_template():
    try:
        data = request.get_json()
        selected_data = data.get('selectedData')
        imageDict = data.get('imageDict')
        if not selected_data:
            return jsonify({'error': 'No selectedData provided'}), 400

        # Load editor configuration and selected templates
        config = read_editor_config()
        selected = config.get('templates_selected', {})

        # Read HTML link paths for first, last, and product pages
        first_link = selected.get('first', {}).get('links', {}).get('html', '')
        last_link = selected.get('last', {}).get('links', {}).get('html', '')
        product_link = selected.get('product', {}).get('links', {}).get('html', '')

        if not first_link or not last_link:
            return jsonify({'error': 'First or last template not selected'}), 400

        # Convert relative URL paths to absolute file system paths
        first_path = os.path.join(app.root_path, first_link.lstrip('/'))
        last_path = os.path.join(app.root_path, last_link.lstrip('/'))
        product_path = os.path.join(app.root_path, product_link.lstrip('/'))

        # Initialize brochure generator
        gen = BrochureGenerator(product_path)
        # Generate HTML using selected paths
        html_content = gen.generate(selected_data, imageDict,
                                    first_path, last_path)

        # Save HTML to a temp file
        temp_dir = os.path.join(tempfile.gettempdir(), 'vendor_vista_brochures')
        os.makedirs(temp_dir, exist_ok=True)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        base_filename = f'brochure_{timestamp}'
        html_filename = f'{base_filename}.html'
        html_filepath = os.path.join(temp_dir, html_filename)
        with open(html_filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)

        # Create PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as pdf_temp:
            pdf_filepath = pdf_temp.name
        savePDF(html_filepath, pdf_filepath)

        # Read PDF bytes and return response
        with open(pdf_filepath, 'rb') as f:
            pdf_bytes = f.read()
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
            # Debug: Log request
            app.logger.info("GET request for templates-selected received")
            
            config = read_editor_config()
            templates_selected = config.get('templates_selected', {})
            
            # Validate data structure
            if not isinstance(templates_selected, dict):
                app.logger.error("Invalid templates_selected data structure")
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid configuration format',
                    'debug': {
                        'issue': 'templates_selected is not a dictionary',
                        'received_type': type(templates_selected).__name__
                    }
                }), 500

            # Get the selected keys list
            selected_keys = templates_selected.get('Selected_list', [])
            
            # Validate selected_keys
            if not isinstance(selected_keys, list):
                app.logger.error("Invalid Selected_list format")
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid Selected_list format',
                    'debug': {
                        'expected_type': 'list',
                        'received_type': type(selected_keys).__name__
                    }
                }), 500

            # Filter templates_selected based on selected_keys
            filtered_data = {
                key: templates_selected.get(key, {}) 
                for key in selected_keys
                if key in ['first', 'product', 'last']  # Only allow valid page types
            }

            # Debug: Log successful response
            app.logger.info("Successfully processed GET request for templates-selected")
            
            return jsonify({
                'status': 'success',
                'templates_selected': filtered_data,
                'metadata': {
                    'count': len(filtered_data),
                    'pages_available': selected_keys
                }
            })

        except Exception as e:
            app.logger.exception("Critical error in get_templates_selected")
            return jsonify({
                'status': 'error',
                'message': 'Internal server error',
                'error_details': str(e),
                'debug_info': {
                    'endpoint': '/api/templates-selected',
                    'method': 'GET'
                }
            }), 500
            
    elif request.method == 'POST':
        try:
            app.logger.info("POST request to templates-selected received")
            
            new_data = request.get_json()
            if not new_data:
                app.logger.error("No data provided in POST request")
                return jsonify({
                    'status': 'error',
                    'message': 'No data provided',
                    'debug': {
                        'request_content_type': request.content_type,
                        'request_size': request.content_length
                    }
                }), 400

            config = read_editor_config()
            current_selection = config.get('templates_selected', {})
            selected_list = current_selection.get('Selected_list', [])

            # Validate new_data structure
            if not isinstance(new_data, dict):
                app.logger.error("Invalid POST data format")
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid data format',
                    'debug': {
                        'expected': 'dictionary with page keys',
                        'received_type': type(new_data).__name__
                    }
                }), 400

            response_info = {
                'updated_pages': [],
                'skipped_pages': [],
                'errors': []
            }

            for page_key, new_value in new_data.items():
                # Validate page key
                if page_key not in ['first', 'product', 'last']:
                    response_info['errors'].append({
                        'page': page_key,
                        'error': 'Invalid page type',
                        'allowed_values': ['first', 'product', 'last']
                    })
                    continue

                # Validate new_value structure
                required_keys = ['template', 'links', 'mode']
                if not all(key in new_value for key in required_keys):
                    missing = [k for k in required_keys if k not in new_value]
                    response_info['errors'].append({
                        'page': page_key,
                        'error': 'Missing required fields',
                        'missing_fields': missing
                    })
                    continue

                existing_template = current_selection.get(page_key, {}).get('template', {})

                # Check for existing template
                if existing_template and existing_template.get('id'):
                    response_info['skipped_pages'].append({
                        'page': page_key,
                        'reason': 'Template already exists',
                        'existing_template': existing_template.get('id')
                    })
                    continue

                # Save the new template
                current_selection[page_key] = new_value

                # Update selected list if not already present
                if page_key not in selected_list:
                    selected_list.append(page_key)

                response_info['updated_pages'].append(page_key)

            # Update the config with changes
            current_selection['Selected_list'] = selected_list
            config['templates_selected'] = current_selection
            write_editor_config(config)

            app.logger.info("Template selection updated successfully")
            
            return jsonify({
                'status': 'success',
                'message': 'Template selection updated',
                'details': response_info,
                'metadata': {
                    'total_pages_processed': len(new_data),
                    'templates_now_selected': selected_list
                }
            })

        except json.JSONDecodeError as e:
            app.logger.error(f"JSON decode error: {str(e)}")
            return jsonify({
                'status': 'error',
                'message': 'Invalid JSON data',
                'error_details': str(e),
                'debug': {
                    'content_type': request.content_type,
                    'sample_data': request.data[:100] if request.data else None
                }
            }), 400
            
        except Exception as e:
            app.logger.exception("Critical error saving template selection")
            return jsonify({
                'status': 'error',
                'message': 'Internal server error',
                'error_details': str(e),
                'debug_info': {
                    'endpoint': '/api/templates-selected',
                    'method': 'POST',
                    'system_time': datetime.now().isoformat()
                }
            }), 500


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

@app.route('/api/getGrapeEditortemplateData', methods=['POST'])
def getGrapeEditortemplateData():
    try:
        data = request.get_json()
        if not data or 'templateID' not in data:
            return jsonify({'status': 'error', 'message': 'Missing "templateID".'}), 400

        template_id = data['templateID']
        id_parts = template_id.split('_')  # e.g., ['default', 'product', '1']
        if len(id_parts) < 3:
            return jsonify({'status': 'error', 'message': 'Invalid templateID format.'}), 400

        source = id_parts[0]     # 'default' or 'edited'
        page = id_parts[1]       # 'first', 'product', or 'last'

        if page not in ['first', 'product', 'last']:
            return jsonify({'status': 'error', 'message': f'Invalid page type: {page}'}), 400

        config = read_editor_config()

        # 1. Look in templates_default or templates_edited
        key_name = f'templates_{source}'
        template_list = config.get(key_name, {}).get(page, [])

        matched_template = next((t for t in template_list if t.get('id') == template_id), None)

        if matched_template:
            # Build HTML link based on known structure
            html_link = f"/static/assets/templates/{source.capitalize()}_Templates/{page.capitalize()}_page/{matched_template['html']}"
            return jsonify({
                'status': 'success',
                'source': source,
                'page': page,
                'templateID': template_id,
                'html_link': html_link,
                'mode': source,
                'template_meta': matched_template
            })

        # 2. If not found, fallback to templates_selected
        selected_data = config.get('templates_selected', {}).get(page, {})
        if selected_data.get('template', {}).get('id') == template_id:
            return jsonify({
                'status': 'success',
                'source': 'selected',
                'page': page,
                'templateID': template_id,
                'html_link': selected_data.get('links', {}).get('html', ''),
                'mode': selected_data.get('mode', ''),
                'template_meta': selected_data.get('template', {})
            })

        # Not found anywhere
        return jsonify({'status': 'error', 'message': f'Template with ID "{template_id}" not found.'}), 404

    except Exception as e:
        app.logger.exception("Error in getGrapeEditortemplateData")
        return jsonify({'status': 'error', 'message': 'Internal server error', 'error': str(e)}), 500


import os
import tempfile
import subprocess
from datetime import datetime
from PIL import Image
import fitz  # PyMuPDF for PDF to image conversion


# @app.route('/api/Edited_templates/save', methods=['POST'])
# def Edited_templates_save():
#     try:
#         # Get JSON data from the request
#         data = request.get_json()
#
#         # Validate that data exists
#         if not data:
#             return jsonify({
#                 'status': 'error',
#                 'message': 'No data provided'
#             }), 400
#
#         # Extract data from the frontend request
#         filename = data.get('filename')
#         html_content = data.get('html')
#         css_content = data.get('css')
#         page_type = data.get('page')
#         previous_temp_id = data.get('previousTempID')
#
#         # Validate required fields
#         required_fields = ['filename', 'html', 'css', 'page']
#         missing_fields = [field for field in required_fields if not data.get(field)]
#
#         if missing_fields:
#             return jsonify({
#                 'status': 'error',
#                 'message': f'Missing required fields: {", ".join(missing_fields)}'
#             }), 400
#
#         # Validate page type
#         valid_pages = ['first', 'product', 'last']
#         if page_type not in valid_pages:
#             return jsonify({
#                 'status': 'error',
#                 'message': f'Invalid page type. Must be one of: {", ".join(valid_pages)}'
#             }), 400
#
#         # Log the received data for debugging
#         app.logger.info(f"Saving edited template: {filename}")
#         app.logger.info(f"Page type: {page_type}")
#         app.logger.info(f"Previous template ID: {previous_temp_id}")
#
#         # Step 1: Combine HTML and CSS
#         combined_html = combine_html_css(html_content, css_content)
#
#         # Step 2: Read configuration and get file paths
#         config = read_editor_config()
#         links = config.get('links', {})
#
#         # Get the directory paths for edited templates
#         html_dir = links.get('templates', {}).get('edited', {}).get(page_type, '')
#         pdf_dir = links.get('pdf', {}).get('edited', {}).get(page_type, '')
#         image_dir = links.get('images', {}).get('edited', {}).get(page_type, '')
#
#         if not all([html_dir, pdf_dir, image_dir]):
#             return jsonify({
#                 'status': 'error',
#                 'message': 'Invalid configuration: missing directory paths'
#             }), 500
#
#         # Convert relative paths to absolute paths
#         html_dir = os.path.join(app.root_path, html_dir.lstrip('/'))
#         pdf_dir = os.path.join(app.root_path, pdf_dir.lstrip('/'))
#         image_dir = os.path.join(app.root_path, image_dir.lstrip('/'))
#
#         # # Create directories if they don't exist
#         # os.makedirs(html_dir, exist_ok=True)
#         # os.makedirs(pdf_dir, exist_ok=True)
#         # os.makedirs(image_dir, exist_ok=True)
#
#         # Step 3: Save files
#         base_name = os.path.splitext(filename)[0]
#
#         # Save HTML file
#         html_path = os.path.join(html_dir, filename)
#         with open(html_path, 'w', encoding='utf-8') as f:
#             f.write(combined_html)
#
#         # Convert HTML to PDF
#         pdf_filename = f"{base_name}.pdf"
#         pdf_path = os.path.join(pdf_dir, pdf_filename)
#         success = convert_html_to_pdf(html_path, pdf_path)
#
#         if not success:
#             return jsonify({
#                 'status': 'error',
#                 'message': 'Failed to convert HTML to PDF'
#             }), 500
#
#         # Convert PDF to image
#         image_filename = f"{base_name}.png"
#         image_path = os.path.join(image_dir, image_filename)
#         success = convert_pdf_to_image(pdf_path, image_path)
#
#         if not success:
#             return jsonify({
#                 'status': 'error',
#                 'message': 'Failed to convert PDF to image'
#             }), 500
#
#         # Step 4: Update templates_edited configuration
#         success = update_templates_edited_config(
#             config, page_type, previous_temp_id, filename,
#             pdf_filename, image_filename, base_name
#         )
#
#         if not success:
#             return jsonify({
#                 'status': 'error',
#                 'message': 'Failed to update configuration'
#             }), 500
#
#         # Return success response
#         return jsonify({
#             'status': 'success',
#             'message': 'Template saved successfully',
#             'path': html_path,
#             'filename': filename,
#             'page': page_type,
#             'files_created': {
#                 'html': filename,
#                 'pdf': pdf_filename,
#                 'image': image_filename
#             }
#         }), 200
#
#     except Exception as e:
#         app.logger.exception("Error in Edited_templates_save")
#         return jsonify({
#             'status': 'error',
#             'message': 'Internal server error',
#             'error': str(e)
#         }), 500

@app.route('/api/Edited_templates/save', methods=['POST'])
def Edited_templates_save():
    try:
        data = request.get_json()

        if not data:
            return jsonify({'status': 'error', 'message': 'No data provided'}), 400

        # Required inputs
        filename = data.get('filename')
        html_content = data.get('html')
        css_content = data.get('css')
        page_type = data.get('page')
        previous_temp_id = data.get('previousTempID')
        mode = 'edited' # default mode if not sent

        required_fields = ['filename', 'html', 'css', 'page']
        missing_fields = [field for field in required_fields if not data.get(field)]

        if missing_fields:
            return jsonify({
                'status': 'error',
                'message': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400

        valid_pages = ['first', 'product', 'last']
        if page_type not in valid_pages:
            return jsonify({
                'status': 'error',
                'message': f'Invalid page type. Must be one of: {", ".join(valid_pages)}'
            }), 400

        # Log
        app.logger.info(f"Saving edited template: {filename} ({page_type})")

        # Combine HTML and CSS
        combined_html = combine_html_css(html_content, css_content)

        # Read config
        config = read_editor_config()
        links = config.get('links', {})

        html_dir = os.path.join(app.root_path, links.get('templates', {}).get('edited', {}).get(page_type, '').lstrip('/'))
        pdf_dir = os.path.join(app.root_path, links.get('pdf', {}).get('edited', {}).get(page_type, '').lstrip('/'))
        image_dir = os.path.join(app.root_path, links.get('images', {}).get('edited', {}).get(page_type, '').lstrip('/'))

        if not all([html_dir, pdf_dir, image_dir]):
            return jsonify({'status': 'error', 'message': 'Missing directory paths in config'}), 500

        # Generate unique base name once
        unique_id = uuid.uuid4().hex[:8]
        base_name = f"{mode}_{page_type}_{filename}_{unique_id}"

        # Final filenames
        html_filename = f"{base_name}.html"
        pdf_filename = f"{base_name}.pdf"
        image_filename = f"{base_name}.png"

        # Save HTML
        html_path = os.path.join(html_dir, html_filename)
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(combined_html)

        # Convert to PDF
        pdf_path = os.path.join(pdf_dir, pdf_filename)
        if not convert_html_to_pdf(html_path, pdf_path):
            return jsonify({'status': 'error', 'message': 'Failed to convert HTML to PDF'}), 500

        # Convert to Image
        image_path = os.path.join(image_dir, image_filename)
        if not convert_pdf_to_image(pdf_path, image_path):
            return jsonify({'status': 'error', 'message': 'Failed to convert PDF to image'}), 500

        # Update config
        if not update_templates_edited_config(
            config, page_type, previous_temp_id,
            html_filename, pdf_filename, image_filename, filename
        ):
            return jsonify({'status': 'error', 'message': 'Failed to update configuration'}), 500

        return jsonify({
            'status': 'success',
            'message': 'Template saved successfully',
            'path': html_path,
            'filename': html_filename,
            'page': page_type,
            'files_created': {
                'html': html_filename,
                'pdf': pdf_filename,
                'image': image_filename
            }
        }), 200

    except Exception as e:
        app.logger.exception("Error in Edited_templates_save")
        return jsonify({
            'status': 'error',
            'message': 'Internal server error',
            'error': str(e)
        }), 500


def combine_html_css(html_content, css_content):
    """Combine HTML and CSS into a single HTML file"""
    # Check if HTML already has a style tag
    if '<style>' in html_content.lower():
        # Find the closing </style> tag and insert CSS before it
        style_end = html_content.lower().find('</style>')
        if style_end != -1:
            combined_html = (
                    html_content[:style_end] +
                    '\n' + css_content + '\n' +
                    html_content[style_end:]
            )
        else:
            # Add style tag with CSS in head
            combined_html = add_css_to_head(html_content, css_content)
    else:
        # Add style tag with CSS in head
        combined_html = add_css_to_head(html_content, css_content)

    return combined_html


def add_css_to_head(html_content, css_content):
    """Add CSS to HTML head section"""
    head_end = html_content.lower().find('</head>')
    if head_end != -1:
        combined_html = (
                html_content[:head_end] +
                f'\n<style>\n{css_content}\n</style>\n' +
                html_content[head_end:]
        )
    else:
        # If no head tag, add it at the beginning
        combined_html = f'''<!DOCTYPE html>
<html>
<head>
<style>
{css_content}
</style>
</head>
<body>
{html_content}
</body>
</html>'''

    return combined_html


def convert_html_to_pdf(html_path, pdf_path):
    """Convert HTML to PDF using headless Chrome"""
    try:
        # Chrome executable path
        chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

        # Construct the command
        cmd = [
            chrome_path,
            '--headless',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            f'--print-to-pdf={pdf_path}',
            f'file:///{html_path.replace(os.sep, "/")}'
        ]

        # Run the command
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode == 0 and os.path.exists(pdf_path):
            app.logger.info(f"PDF generated successfully: {pdf_path}")
            return True
        else:
            app.logger.error(f"Failed to generate PDF. Return code: {result.returncode}")
            app.logger.error(f"Error output: {result.stderr}")
            return False

    except subprocess.TimeoutExpired:
        app.logger.error("PDF conversion timed out")
        return False
    except Exception as e:
        app.logger.error(f"Error converting HTML to PDF: {str(e)}")
        return False


def convert_pdf_to_image(pdf_path, image_path):
    """Convert PDF to image using PyMuPDF"""
    try:
        # Open PDF document
        doc = fitz.open(pdf_path)

        # Get first page
        page = doc[0]

        # Set resolution (DPI)
        mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for better quality

        # Render page to image
        pix = page.get_pixmap(matrix=mat)

        # Save as PNG
        pix.save(image_path)

        # Close document
        doc.close()

        app.logger.info(f"Image generated successfully: {image_path}")
        return True

    except Exception as e:
        app.logger.error(f"Error converting PDF to image: {str(e)}")
        return False


def find_original_template(config, page_type, template_id):
    """Find original template from either templates_default or templates_edited"""
    if not template_id:
        return None

    # Check in templates_default first
    default_templates = config.get('templates_default', {}).get(page_type, [])
    original_template = next((t for t in default_templates if t.get('id') == template_id), None)

    if original_template:
        return original_template

    # Check in templates_edited if not found in default
    edited_templates = config.get('templates_edited', {}).get(page_type, [])
    original_template = next((t for t in edited_templates if t.get('id') == template_id), None)

    if original_template:
        return original_template

    # Check in templates_selected if not found in either
    selected_templates = config.get('templates_selected', {}).get(page_type, {})
    selected_template = selected_templates.get('template', {})
    if selected_template.get('id') == template_id:
        return selected_template

    return None

import uuid

# def update_templates_edited_config(config, page_type, previous_temp_id, html_filename, pdf_filename, image_filename,
#                                    base_name):
#     """Update the templates_edited configuration"""
#     try:
#         # Get existing templates_edited
#         templates_edited = config.get('templates_edited', {})
#
#         # Initialize page list if it doesn't exist
#         if page_type not in templates_edited:
#             templates_edited[page_type] = []
#
#         # Find original template from any source
#         original_template = find_original_template(config, page_type, previous_temp_id)
#
#         # Generate new template ID
#         # existing_ids = [t.get('id', '') for t in templates_edited[page_type]]
#         # new_id_num = len(existing_ids) + 1
#         # new_id = f"edited_{page_type}_{new_id_num}"
#
#         new_id = f"edited_{page_type}_{uuid.uuid4().hex}"
#
#         # Create new template metadata by copying original and updating necessary fields
#         if original_template:
#             # Start with a copy of the original template
#             new_template = original_template.copy()
#
#             # Update with new file information
#             new_template.update({
#                 "id": new_id,
#                 "name": html_filename,
#                 "image": image_filename,
#                 "pdf": pdf_filename,
#                 "created_at": datetime.now().strftime("%d %B %Y, %I:%M%p"),
#                 "original_template_id": previous_temp_id
#             })
#         else:
#             # If no original template found, create a basic one
#             new_template = {
#                 "id": new_id,
#                 "name": html_filename,
#                 "displayName": base_name,
#                 "image": image_filename,
#                 "pdf": pdf_filename,
#                 "created_at": datetime.now().strftime("%d %B %Y, %I:%M%p"),
#                 "original_template_id": previous_temp_id
#             }
#         # Add to templates_edited
#         templates_edited[page_type].append(new_template)
#
#         # Update config
#         config['templates_edited'] = templates_edited
#
#         # Save configuration
#         write_editor_config(config)
#
#         app.logger.info(f"Updated templates_edited configuration for {page_type} page")
#         return True
#
#     except Exception as e:
#         app.logger.error(f"Error updating templates_edited configuration: {str(e)}")
#         return False

def update_templates_edited_config(config, page_type, previous_temp_id, html_filename, pdf_filename, image_filename,
                                   base_name):
    """Update the templates_edited configuration"""
    try:
        # Get existing templates_edited
        templates_edited = config.get('templates_edited', {})

        # Initialize page list if it doesn't exist
        if page_type not in templates_edited:
            templates_edited[page_type] = []

        # Find original template from any source
        original_template = find_original_template(config, page_type, previous_temp_id)

        # Generate new template ID
        new_id = f"edited_{page_type}_{uuid.uuid4().hex}"

        # Create the new template data that we want to store
        new_template_data = {
            "id": new_id,
            "displayName" : base_name,
            "html": html_filename,
            "image": image_filename,
            "pdf": pdf_filename,
            "created_at": datetime.now().strftime("%d %B %Y, %I:%M%p"),
            "original_template_id": previous_temp_id
        }

        # # If no displayName is provided, use the base_name
        # if "displayName" not in new_template_data:
        #     new_template_data["displayName"] = base_name

        if original_template:
            # Compare keys between original and new data
            original_keys = set(original_template.keys())
            new_keys = set(new_template_data.keys())

            # Find matched and unmatched keys
            matched_keys = original_keys.intersection(new_keys)
            unmatched_keys = new_keys.difference(original_keys)

            app.logger.info(f"Matched keys: {matched_keys}")
            app.logger.info(f"Unmatched keys: {unmatched_keys}")

            # Start with a copy of the original template
            new_template = original_template.copy()

            # Update matched keys with new values
            for key in matched_keys:
                if key in new_template_data:
                    new_template[key] = new_template_data[key]

            # Add unmatched keys from new data
            for key in unmatched_keys:
                if key in new_template_data:
                    new_template[key] = new_template_data[key]
        else:
            # If no original template found, use the new data as is
            new_template = new_template_data

        # Add to templates_edited
        templates_edited[page_type].append(new_template)

        # Update config
        config['templates_edited'] = templates_edited

        # Save configuration
        write_editor_config(config)

        app.logger.info(f"Updated templates_edited configuration for {page_type} page")
        return True

    except Exception as e:
        app.logger.error(f"Error updating templates_edited configuration: {str(e)}")
        return False

@app.route('/api/template-row-count', methods=['GET'])
def get_template_row_count():
    """
    Returns the `table` field from templates_selected.product.template
    as `templates_table`.
    """
    try:
        config = read_editor_config()
        templates_selected = config.get('templates_selected', {})

        # Directly grab the “product” → “template” → “table” value
        table_count = (
            templates_selected
            .get('product', {})
            .get('template', {})
            .get('table', 0)
        )

        return jsonify({'templates_table': table_count}), 200

    except Exception:
        app.logger.exception("Error fetching template table count")
        return jsonify({'error': 'Internal server error'}), 500



if __name__ == '__main__':
    app.run(debug=True)
