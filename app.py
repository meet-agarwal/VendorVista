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
    filters = gf.getFilternames()
    db = getDataBase.GetDataBase(filters)
    db.getDataBaseDict()
    database = db.getDataBaseFilterValue()
    return jsonify(database)

if __name__ == '__main__':
    app.run(debug=True)
