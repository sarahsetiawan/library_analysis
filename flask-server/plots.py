import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

# Connect to the SQLite database
DATABASE = 'books.db'

def load_data():
    conn = sqlite3.connect(DATABASE)
    query = 'SELECT * FROM BOOK'
    df = pd.read_sql_query(query, conn)
    conn.close()
    return df

# Load data
df = load_data()

# 1. Handle missing values
# Drop rows with null values in 'genre', 'average_rating', and 'price' columns
df_cleaned = df.dropna(subset=['genre', 'average_rating', 'price'])

# 2. Plot 1: Histogram of Genres vs the amount of books in each genre
plt.figure(figsize=(10, 6))
df_cleaned['genre'].value_counts().plot(kind='bar', color='skyblue')
plt.title('Number of Books per Genre')
plt.xlabel('Genre')
plt.ylabel('Number of Books')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('books_per_genre.png')  # Save plot as an image file
plt.show()

# 3. Plot 2: Histogram of Genres vs the number of authors in each genre
# Group by 'genre' and calculate unique author counts
authors_per_genre = df_cleaned.groupby('genre')['authors'].nunique()

plt.figure(figsize=(10, 6))
authors_per_genre.plot(kind='bar', color='salmon')
plt.title('Number of Authors per Genre')
plt.xlabel('Genre')
plt.ylabel('Number of Unique Authors')
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig('authors_per_genre.png')
plt.show()

# 4. Plot 3: Scatterplot of Book Ratings vs Price
plt.figure(figsize=(10, 6))
plt.scatter(df_cleaned['average_rating'], df_cleaned['price'], alpha=0.6, c='purple')
plt.title('Book Ratings vs Price')
plt.xlabel('Average Rating')
plt.ylabel('Price ($)')
plt.tight_layout()
plt.savefig('ratings_vs_price.png')
plt.show()
