import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LibraryPage from './LibraryPage';
import DataPage from './DataPage';
import TopRatedBooksPage from './TopRatedBooksPage';
import "bootswatch/dist/sketchy/bootstrap.min.css";
import { Navbar, Nav, Container } from 'react-bootstrap';

function App() {
  const [view, setView] = useState("library");
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
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
      setView("topbooks");
    } catch (error) {
      console.error("Error fetching top books:", error);
    }
  };

  const handleNavigation = (view) => {
    setView(view);
  };

  const renderSwitch = (view) => {
    switch (view) {
      case "library":
        return (
          <LibraryPage
            books={filteredBooks}
            fetchBooks={fetchBooks}
          />
        );
      case "data":
        return <DataPage genreData={genreData} />;
      case "topbooks":
        return (
          <TopRatedBooksPage
            genre={selectedGenre}
            topBooks={topBooks}
            goBack={() => setView("data")}
          />
        );
      default:
        return <LibraryPage />;
    }
  };

  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Book Library</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => handleNavigation("library")}>Library</Nav.Link>
              <Nav.Link onClick={() => handleNavigation("data")}>Data</Nav.Link>
              <Nav.Link onClick={() => handleNavigation("topbooks")}>Top Books</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        {renderSwitch(view)}
      </Container>
    </div>
  );
}

export default App;
