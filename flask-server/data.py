from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import sqlite3
import requests
import matplotlib.pyplot as plt
from wordcloud import WordCloud
import io
import base64

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
            cover_image TEXT
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
    books_data = get_books_from_api(query, max_results=40, total_books=2500)

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
            image_link = book_info.get('imageLinks', {}).get('thumbnail', None)

            cursor.execute('''
                INSERT OR IGNORE INTO BOOK (isbn, title, authors, average_rating, genre, published_date, description, cover_image)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                isbn, title, authors, average_rating, categories, published_date, description, image_link
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

@app.route('/books', methods=['POST'])
def create_book():
    data = request.get_json()
    isbn = data.get('isbn')
    title = data.get('title')
    authors = data.get('authors')
    published_date = data.get('published_date')
    genre = data.get('genre')
    description = data.get('description')
    average_rating = data.get('average_rating')
    cover_image = data.get('cover_image')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO BOOK (isbn, title, authors, published_date, genre, description, average_rating, cover_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (isbn, title, authors, published_date, genre, description, average_rating, cover_image))
    conn.commit()
    conn.close()

    return jsonify({"message": "Book created successfully."}), 201

@app.route('/books/<isbn>', methods=['PUT'])
def edit_book(isbn):
    data = request.get_json()
    title = data.get('title')
    authors = data.get('authors')
    average_rating = data.get('average_rating')
    genre = data.get('genre')
    published_date = data.get('published_date')
    description = data.get('description')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE BOOK
        SET title = ?, authors = ?, average_rating = ?, genre = ?, published_date = ?, description = ?
        WHERE isbn = ?
    ''', (title, authors, average_rating, genre, published_date, description, isbn))
    conn.commit()
    conn.close()

    return jsonify({"message": "Book updated successfully."}), 200

# Delete book endpoint
@app.route('/books/<isbn>', methods=['DELETE'])
def delete_book(isbn):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM BOOK WHERE isbn = ?', (isbn,))
    conn.commit()
    conn.close()

    return jsonify({"message": "Book deleted successfully."}), 200

@app.route('/wordcloud', methods=['GET'])
def generate_wordcloud():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT authors FROM BOOK WHERE authors IS NOT NULL")
    authors = cursor.fetchall()
    conn.close()
    
    # Join all authors into a single string
    text = " ".join(row["authors"] for row in authors)

    # Generate the word cloud
    wordcloud = WordCloud(width=800, height=400, background_color='white').generate(text)

    # Save to a BytesIO object
    img = io.BytesIO()
    wordcloud.to_image().save(img, format='PNG')
    img.seek(0)

    # Encode image to base64
    img_base64 = base64.b64encode(img.getvalue()).decode()

    return jsonify({"wordcloud": f"data:image/png;base64,{img_base64}"})

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

@app.route('/genre_histograms', methods=['GET'])
def genre_histograms():
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

    genres = []
    num_authors = []
    avg_ratings = []
    
    for row in data:
        genres.append(row["genre"])
        num_authors.append(row["num_authors"])
        avg_ratings.append(row["avg_rating"])
        
    return jsonify({"genres": genres, "num_authors": num_authors, "avg_ratings": avg_ratings})


if __name__ == '__main__':
    create_table()
    app.run(debug=True)