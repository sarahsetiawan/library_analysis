import sqlite3
import pandas as pd
import matplotlib.pyplot as plt

DATABASE = 'books.db'

# Load data from the database
def load_data():
    conn = sqlite3.connect(DATABASE)
    df = pd.read_sql_query("SELECT * FROM BOOK", conn)
    conn.close()
    return df

# Function to create and save plots
def plot_genre_count():
    df = load_data()
    df_cleaned = df.dropna(subset=['genre'])  # Cleaned for missing genre
    plt.figure(figsize=(10, 6))
    df_cleaned['genre'].value_counts().plot(kind='bar', color='skyblue')
    plt.title("Number of Books per Genre")
    plt.xlabel("Genre")
    plt.ylabel("Number of Books")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('static/genre_count.png')
    plt.close()

def plot_genre_author_count():
    df = load_data()
    df_cleaned = df.dropna(subset=['genre', 'authors'])
    authors_per_genre = df_cleaned.groupby('genre')['authors'].nunique()
    plt.figure(figsize=(10, 6))
    authors_per_genre.plot(kind='bar', color='salmon')
    plt.title("Number of Authors per Genre")
    plt.xlabel("Genre")
    plt.ylabel("Number of Authors")
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig('static/genre_author_count.png')
    plt.close()

def plot_rating_vs_price():
    df = load_data()
    df_cleaned = df.dropna(subset=['average_rating', 'price'])
    plt.figure(figsize=(10, 6))
    plt.scatter(df_cleaned['average_rating'], df_cleaned['price'], alpha=0.6, color='purple')
    plt.title("Book Ratings vs Price")
    plt.xlabel("Average Rating")
    plt.ylabel("Price ($)")
    plt.tight_layout()
    plt.savefig('static/ratings_vs_price.png')
    plt.close()

# Update all plots when data changes
def update_all_plots():
    plot_genre_count()
    plot_genre_author_count()
    plot_rating_vs_price()
