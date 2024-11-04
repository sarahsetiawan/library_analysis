import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [books, setBooks] = useState([]);
  const [view, setView] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [newBookQuery, setNewBookQuery] = useState("");
  const [genreData, setGenreData] = useState(null);
  const [topBooks, setTopBooks] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  useEffect(() => {
    fetchBooks();
    fetchGenreData();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/books`);
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const handleAddNewBooks = async () => {
    if (newBookQuery.trim()) {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/fetch_books/${newBookQuery}`);
        if (response.status === 200) {
          console.log("New books fetched and added to the database.");
          setNewBookQuery("");
          fetchBooks();  // Refresh book list after adding
        }
      } catch (error) {
        console.error("Error fetching new books:", error);
      }
    }
  };
  const fetchGenreData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/genre_analysis`);
      setGenreData(response.data);
    } catch (error) {
      console.error("Error fetching genre data:", error);
    }
  };

  const fetchTopBooksByGenre = async (genre) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/top_books/${genre}`);
      setTopBooks(response.data);
      setSelectedGenre(genre);
      setView("topBooks");
    } catch (error) {
      console.error("Error fetching top books:", error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredBooks(
      books.filter(
        (book) =>
          book.title.toLowerCase().includes(query) ||
          book.authors.toLowerCase().includes(query)
      )
    );
  };

  const handleNavigation = (view) => {
    setView(view);
    if (view === "home") {
      setSearchQuery("");
      setFilteredBooks(books);
    }
  };

  return (
    <div>
      <nav style={{ marginBottom: "20px" }}>
        <button onClick={() => handleNavigation("home")}>Home</button>
        <button onClick={() => handleNavigation("plots")}>Plots</button>
        <button onClick={() => handleNavigation("genres")}>Genres</button>

        <input
          type="text"
          placeholder="Search by title or author"
          value={searchQuery}
          onChange={handleSearch}
          style={{ marginLeft: "20px", padding: "5px" }}
        />
        <button style={{ padding: "5px 10px" }}>Search</button>

        <input
          type="text"
          placeholder="Add books by title/author"
          value={newBookQuery}
          onChange={(e) => setNewBookQuery(e.target.value)}
          style={{ marginLeft: "20px", padding: "5px" }}
        />
        <button onClick={handleAddNewBooks} style={{ padding: "5px 10px" }}>
          Add Books
        </button>
      </nav>

      {view === "home" && (
        <div>
          <h1>Library Book Collection</h1>
          {filteredBooks.length > 0 ? (
            <table border="1" cellPadding="10" cellSpacing="0">
              <thead>
                <tr>
                  <th>ISBN</th>
                  <th>Title</th>
                  <th>Authors</th>
                  <th>Published Date</th>
                  <th>Genre</th>
                  <th>Description</th>
                  <th>Avg Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map((book) => (
                  <tr key={book.isbn}>
                    <td>{book.isbn}</td>
                    <td>{book.title}</td>
                    <td>{book.authors}</td>
                    <td>{book.published_date}</td>
                    <td>{book.genre}</td>
                    <td>{book.description}</td>
                    <td>{book.average_rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No books available.</p>
          )}
        </div>
      )}

      {view === "plots" && (
        <div>
          <h1>Plots Page</h1>
          {genreData ? (
            <div>
              <h2>Genre Analysis</h2>
              {/* Placeholder for plots */}
              <p>Charts will be displayed here.</p>
            </div>
          ) : (
            <p>Loading genre data...</p>
          )}
        </div>
      )}

      {view === "genres" && (
        <div>
          <h1>Genres</h1>
          {genreData ? (
            <ul>
              {genreData.genres.map((genre, index) => (
                <li key={index}>
                  <button onClick={() => fetchTopBooksByGenre(genre)}>{genre}</button>
                </li>
              ))}
            </ul>
          ) : (
            <p>Loading genres...</p>
          )}
        </div>
      )}

      {view === "topBooks" && selectedGenre && (
        <div>
          <h1>Top Rated Books in {selectedGenre}</h1>
          {topBooks.length > 0 ? (
            <table border="1" cellPadding="10" cellSpacing="0">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Authors</th>
                  <th>Avg Rating</th>
                </tr>
              </thead>
              <tbody>
                {topBooks.map((book, index) => (
                  <tr key={index}>
                    <td>{book.title}</td>
                    <td>{book.authors}</td>
                    <td>{book.average_rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No top books available for this genre.</p>
          )}
          <button onClick={() => setView("genres")}>Back to Genres</button>
        </div>
      )}
    </div>
  );
}

export default App;