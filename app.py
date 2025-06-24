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
        # html_content = processor.get_final_html(first_path, last_path)
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

if __name__ == '__main__':
    app.run(debug=True)
