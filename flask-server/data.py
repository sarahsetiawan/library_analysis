from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import requests

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

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

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/genre_analysis', methods=['GET'])
def genre_analysis():
    conn = get_db_connection()
    query = """
        SELECT genre, COUNT(DISTINCT authors) AS num_authors, AVG(average_rating) AS avg_rating
        FROM BOOK
        WHERE average_rating IS NOT NULL
        GROUP BY genre
        HAVING COUNT(*) > 0
    """
    data = conn.execute(query).fetchall()
    conn.close()
    
    result = {"genres": [], "num_authors": [], "avg_ratings": []}
    for row in data:
        result["genres"].append(row["genre"])
        result["num_authors"].append(row["num_authors"])
        result["avg_ratings"].append(row["avg_rating"])

    return jsonify(result)

@app.route('/top_books/<genre>', methods=['GET'])
def top_books_by_genre(genre):
    conn = get_db_connection()
    query = """
        SELECT title, authors, average_rating
        FROM BOOK
        WHERE genre = ? AND average_rating IS NOT NULL
        ORDER BY average_rating DESC
        LIMIT 10
    """
    books = conn.execute(query, (genre,)).fetchall()
    conn.close()
    
    result = [{"title": book["title"], "authors": book["authors"], "average_rating": book["average_rating"]} for book in books]
    return jsonify(result)

if __name__ == '__main__':
    create_table()
    app.run(debug=True)