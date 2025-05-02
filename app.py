from flask import Flask
import getFilter
import getDataBase


app = Flask(__name__)

@app.route('/')
def home():
    gf = getFilter.GetFilter()         # Create an instance of the class
    gf.getFilterDict()                 # Load the filter data from the Excel file
    filters = gf.getFilternames()  
    db = getDataBase.GetDataBase(filters)
    database = db.getDataBaseFilterValue()
    print(database)
    print(filters) 
    return "Hello, World!"

if __name__ == '__main__':
    app.run(debug=True)
