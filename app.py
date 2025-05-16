from flask import Flask, render_template, jsonify, request  
import filterTypes
import filter_hierarchy
import getProductData
import getDataBase
from herirachy_manager import HierarchyManager  # Import the HierarchyManager class 
import json
from flask import Response
app = Flask(__name__)

filterd_products_Dict = getProductData.GetProductsData()
hierarchy_manager = HierarchyManager()  # Create an instance of HierarchyManager

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
        
        optionList = filterd_products_Dict.getAllSettingsOptions()
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
            # Remove hyphens from the key
            new_key = key.replace('-', ' ')
            
            # Remove hyphens from each item in the value list (if it's a string)
            new_value = []
            for item in value:
                if isinstance(item, str):
                    new_item = item.replace('-', ' ')
                    new_value.append(new_item)
                else:
                    new_value.append(item)  # Keep non-string items as-is
            
            new_data[new_key] = new_value
             
        updatedDictFilter = hierarchy_manager.update_hierarchy(new_data)
        
        return jsonify(updatedDictFilter)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
