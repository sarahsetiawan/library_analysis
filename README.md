# library_analysis
# Google Books Analysis and Visualization

## Overview

This project aims to analyze and visualize data from Google Books, allowing users to manage and explore book information effectively. Users can search for, add, update, and delete a book. They can also view analytics such as the amount of authors versus genre and average rating versus genre.

## Git Repo URL: [https://github.com/sarahsetiawan/library_analysis](https://github.com/sarahsetiawan/library_analysis)

## Features

- **List Books by Author**: Retrieve and display books written by a specified author.
- **Add Book**: Input new book into the database.
- **Update Book Information**: Modify existing book details.
- **Delete Book Information**: Remove books from the database.
- **Word Cloud**: Visualize most frequent author names.
- **Histogram Authors vs. Genre**: A histogram comparing the amount of authors versus the genre.
- **Histogram Rating vs. Genre**: A histogram comparing the average rating versus the genre.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Python Flask
- **Database**: SQLite
- **API**: Google Books API (free)

## Zip Contents 
- **data.py**: connects to database and recieves data from API
- **App.js**: routes to all the pages
- **DataPage.js**: creates histograms and displays wordcloud 
- **LibraryPage.js**: visualizes the database of books as a library

## How to run code
### 1. Prerequisites
    Node.js (version 14 or later recommended)
    npm (version 6 or later) or yarn
    Python (version 3.8 or later for backend development)
    Flask for backend setup (if applicable)
    SQLite (included in Python 3.8+)
### 2. Clone the repository
    ```bash
    git clone https://github.com/sarahsetiawan/library_analysis.git
    cd library-analysis
    ```
### 3. Set up the Backend
    ```bash
    cd backend
    python3 -m venv .venv
    source .venv/bin/activate  # For Windows, use `.venv\Scripts\activate`
    pip install -r requirements.txt
    flask run
    python data.py
    ```
### 4. Set up the Frontend
    ```bash
    cd frontend
    npm install
    npm start
    ```

