import React, { useState, useEffect } from "react";
import axios from "axios";
import { ListGroup, Table, Container } from "react-bootstrap";

function TopRatedBooksPage() {
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [topBooks, setTopBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  // Fetch all books
  const fetchBooks = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/books");
      const booksData = response.data;
      setBooks(booksData);
      extractGenres(booksData);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  // Extract genres with at least X books with ratings
  const extractGenres = (booksData) => {
    const genreMap = {};
    booksData.forEach((book) => {
      if (book.average_rating) {
        const genre = book.genre;
        if (!genreMap[genre]) {
          genreMap[genre] = [];
        }
        genreMap[genre].push(book);
      }
    });

    // Filter genres with at least 2 books
    const filteredGenres = Object.entries(genreMap)
      .filter(([, books]) => books.length >= 2)
      .map(([genre]) => genre);

    setGenres(filteredGenres);
  };

  // Get top books by rating for the selected genre
  const handleGenreClick = (genre) => {
    const filteredBooks = books
      .filter((book) => book.genre === genre && book.average_rating)
      .sort((a, b) => b.average_rating - a.average_rating)
      .slice(0, 50); // Top 50 books

    setSelectedGenre(genre);
    setTopBooks(filteredBooks);
  };

  return (
    <Container>
      <h1 align = "Center">Top Rated Books</h1>

      <h2>Select a Genre:</h2>
      <ListGroup>
        {genres.map((genre) => (
          <ListGroup.Item
            key={genre}
            onClick={() => handleGenreClick(genre)}
            style={{ cursor: "pointer" }}
          >
            {genre}
          </ListGroup.Item>
        ))}
      </ListGroup>

      {selectedGenre && (
        <div>
          <h2>Top 50 Books in {selectedGenre}</h2>
          {topBooks.length > 0 ? (
            <Table striped bordered hover>
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
                {topBooks.map((book) => (
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
            </Table>
          ) : (
            <p>No books available for this genre.</p>
          )}
        </div>
      )}
    </Container>
  );
}

export default TopRatedBooksPage;
