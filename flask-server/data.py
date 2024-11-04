from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import requests
from plots import update_all_plots  # Import plot update function

app = Flask(__name__)
CORS(app)

DATABASE = 'books.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row  
    return conn

def create_table():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS BOOK (
            isbn TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            authors TEXT NOT NULL,
            average_rating REAL,
            genre TEXT,
            published_date TEXT,
            description TEXT,
            price REAL
        )
    ''')
    conn.commit()
    conn.close()

def get_books_from_api(query, max_results=40, total_books=1000):
    api_key = 'AIzaSyA3AIw4tAalM0pk9pARWBkqsWm0BBxT3R8'  # Replace with your actual API key
    books = []
    start_index = 0

    while len(books) < total_books:
        url = f'https://www.googleapis.com/books/v1/volumes?q={query}&startIndex={start_index}&maxResults={max_results}&key={api_key}'
        try:
            response = requests.get(url)
            response.raise_for_status()
            data = response.json()
            books.extend(data.get('items', []))

            if len(data.get('items', [])) < max_results:
                break
            
            start_index += max_results

        except requests.exceptions.RequestException as e:
            print(f"Error fetching data from Google Books API: {e}")
            break

    return books[:total_books]

@app.route('/fetch_books', defaults={'query': 'books'}, methods=['GET'])
@app.route('/fetch_books/<query>', methods=['GET'])
def fetch_books(query):
    books_data = get_books_from_api(query, max_results=5, total_books=5)
    
    if books_data:
        conn = get_db()
        cursor = conn.cursor()

        for item in books_data:
            book_info = item['volumeInfo']
            isbn = item.get('id')
            title = book_info.get('title', 'Unknown Title')
            authors = ', '.join(book_info.get('authors', []))
            published_date = book_info.get('publishedDate', 'Unknown Date')
            description = book_info.get('description', 'No description available')
            average_rating = book_info.get('averageRating', None)
            categories = ', '.join(book_info.get('categories', []))
            price = item.get('saleInfo', {}).get('retailPrice', {}).get('amount', None)

            cursor.execute('''
                INSERT OR IGNORE INTO BOOK (isbn, title, authors, average_rating, genre, published_date, description, price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                isbn, title, authors, average_rating, categories, published_date, description, price
            ))

        conn.commit()
        conn.close()
        
        update_all_plots()  # Call to update plots after books are added

        return jsonify({"message": "Books fetched, stored, and plots updated successfully."}), 200

    return jsonify({"error": "Failed to fetch books."}), 500

@app.route('/books', methods=['GET'])
def get_books():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM BOOK')
    books = cursor.fetchall()
    books_list = [dict(row) for row in books]
    conn.close()
    return jsonify(books_list)

@app.route('/plots/<filename>')
def get_plot(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    create_table()
    app.run(debug=True)
