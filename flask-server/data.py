from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import requests

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

            # Break if no more books are found
            if len(data.get('items', [])) < max_results:
                break
            
            # Move to the next batch
            start_index += max_results

        except requests.exceptions.RequestException as e:
            print(f"Error fetching data from Google Books API: {e}")
            break

    return books[:total_books]

@app.route('/fetch_books', defaults={'query': 'books'}, methods=['GET'])
@app.route('/fetch_books/<query>', methods=['GET'])
def fetch_books(query):
    # Fetch a larger batch of books, e.g., 100 books in total
    books_data = get_books_from_api(query, max_results=5, total_books=5)
    
    if books_data:
        conn = get_db()
        cursor = conn.cursor()

        for item in books_data:
            book_info = item['volumeInfo']
            # Extract other fields such as 'averageRating' and 'price' if available
            isbn = item.get('id')
            title = book_info.get('title', 'Unknown Title')
            authors = ', '.join(book_info.get('authors', []))
            published_date = book_info.get('publishedDate', 'Unknown Date')
            description = book_info.get('description', 'No description available')
            average_rating = book_info.get('averageRating', None)
            categories = ', '.join(book_info.get('categories', []))

            # Prices may be under 'saleInfo' -> 'retailPrice' -> 'amount', if available
            price = item.get('saleInfo', {}).get('retailPrice', {}).get('amount', None)

            # Insert into the database
            cursor.execute('''
                INSERT OR IGNORE INTO BOOK (isbn, title, authors, average_rating, genre, published_date, description, price)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                item.get('id'),
                book_info.get('title'),
                ', '.join(book_info.get('authors', [])),
                book_info.get('averageRating'),
                ', '.join(book_info.get('categories', [])),  # Assuming 'categories' represents genre
                book_info.get('publishedDate'),
                book_info.get('description'),
                book_info.get('listPrice', {}).get('amount')  # Assuming price is under 'listPrice' -> 'amount'
            ))


        conn.commit()
        conn.close()
        
        return jsonify({"message": "Books fetched and stored successfully."}), 200

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

if __name__ == '__main__':
    create_table()  # Create database tables
    app.run(debug=True)
