from flask import Flask, render_template, jsonify
import getFilter
import getDataBase

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(debug=True)
