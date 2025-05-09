from flask import Flask, render_template, jsonify, request  
import getFilter
import getDataBase
import getProductData
app = Flask(__name__)

getProductsdataDict = getProductData.GetProductsData()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/filters')
def get_filters():
    gf = getFilter.GetFilter()
    gf.getFilterDict()
    filtersData = gf.getFilterData()
    db = getDataBase.GetDataBase(filtersData)
    db.getDataBaseDict()
    masterFilterDataDict = db.masterFilterDataDictMethod()
    parentFiltervalues = db.parentFilterDictMethod()
    return jsonify( masterFilterDataDict, parentFiltervalues)

@app.route('/api/getProducts', methods=['POST'])
def getProducts():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        ProductData = getProductsdataDict.filterProducts(data)
        return jsonify(ProductData)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/settings/options', methods=['GET'])
def getOptionList():
    try:
        
        optionList = getProductsdataDict.getAllSettingsOptions()
        print('optionList' , optionList)
        return jsonify(optionList)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
