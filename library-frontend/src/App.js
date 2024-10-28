import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [books, setBooks] = useState([]);
  const [view, setView] = useState("home"); // Tracks the current page view
  const [searchQuery, setSearchQuery] = useState(""); // For filtering books locally
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [newBookQuery, setNewBookQuery] = useState(""); // For fetching new books

  // Fetch books initially and set them to both books and filteredBooks
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/books');
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  // Handle search input for filtering books locally
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

  // Handle adding new books by querying the backend fetch_books endpoint
  const handleAddNewBooks = async () => {
    if (newBookQuery.trim()) {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/fetch_books/${newBookQuery}`);
        if (response.status === 200) {
          console.log("New books fetched and added to the database.");
          setNewBookQuery(""); // Clear the input after successful fetch
          fetchBooks(); // Refresh the book list to include newly fetched books
        }
      } catch (error) {
        console.error("Error fetching new books:", error);
      }
    }
  };

    // Navigation handler to switch views and clear the search bar when navigating to Home
   const handleNavigation = (view) => {
    setView(view);
    if (view === "home") {
      setSearchQuery(""); // Clear search input
      setFilteredBooks(books); // Reset filtered books to show the entire list
    }
  };
  
  return (
    <div>
      <nav style={{ marginBottom: "20px" }}>
        <button onClick={() => handleNavigation("home")}>Home</button>
        <button onClick={() => handleNavigation("plots")}>Plots</button>
        
        <input
          type="text"
          placeholder="Search by title or author"
          value={searchQuery}
          onChange={handleSearch}
          style={{ marginLeft: "20px", padding: "5px" }}
        />
        <button style={{ padding: "5px 10px" }}>
          Search
        </button>

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
          <p>Plots and charts will be displayed here.</p>
          {/* Placeholder content for the plots page */}
        </div>
      )}
    </div>
  );
}

export default App;
