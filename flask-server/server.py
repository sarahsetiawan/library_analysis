from flask import Flask

app = Flask(__name__)

@app.route('/Testing')
def testing():
    return{"Testing": ["testing1","testing2"]}

if __name__ == "__main__":
    app.run(debug = True)