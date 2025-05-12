from flask import Flask, render_template, jsonify, request  
import filterTypes
import filter_hierarchy
import getProductData
import getDataBase
app = Flask(__name__)

filterd_products_Dict = getProductData.GetProductsData()

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

    return jsonify( master_filter_dict, parent_filter_dict)

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



if __name__ == '__main__':
    app.run(debug=True)
