import React, { useState, useEffect } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap styles are loaded
import Modal from 'react-bootstrap/Modal'; // Import the Modal component
import Toast from 'react-bootstrap/Toast'; // For user feedback messages

function Library() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newBook, setNewBook] = useState({
    isbn: "",
    title: "",
    authors: "",
    published_date: "",
    genre: "",
    description: "",
    average_rating: null,
    cover_image: "",
  });
  const [editingBook, setEditingBook] = useState(null); // State to track which book is being edited
  const [showAddBook, setShowAddBook] = useState(false); // State to toggle adding a new book
  const [showDetailModal, setShowDetailModal] = useState(false); // State for book details modal
  const [selectedBook, setSelectedBook] = useState(null); // State for the selected book for details
  const [toastMessage, setToastMessage] = useState(""); // State for toast message
  const [showToast, setShowToast] = useState(false); // State for showing the toast

  useEffect(() => {
    fetchBooks();
  }, []);

  // Fetch all books
  const fetchBooks = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/books");
      setBooks(response.data);
      setFilteredBooks(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  // Search books
  const onSearch = (e) => {
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

  // Handle new book input
  const handleNewBookChange = (e) => {
    const { name, value } = e.target;
    setNewBook((prevBook) => ({
      ...prevBook,
      [name]: value,
    }));
  };

  // Handle edit book input
  const handleEditBookChange = (e) => {
    const { name, value } = e.target;
    setEditingBook((prevBook) => ({
      ...prevBook,
      [name]: value,
    }));
  };

  // Add a custom book
  const handleAddCustomBook = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:5000/books", newBook);
      if (response.status === 201) {
        console.log("Custom book added successfully:", response.data);
        fetchBooks(); // Refresh the book list
        setToastMessage("Book added successfully!");
        setShowToast(true);
        setNewBook({ isbn: "", title: "", authors: "", published_date: "", genre: "", description: "", average_rating: null, cover_image: "" });
      }
    } catch (error) {
      console.error("Error adding custom book:", error);
      setToastMessage("Error adding book!");
      setShowToast(true);
    }
  };

  // Handle edit book submission
  const handleEditBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`http://127.0.0.1:5000/books/${editingBook.isbn}`, editingBook);
      if (response.status === 200) {
        console.log("Book updated successfully:", response.data);
        fetchBooks(); // Refresh the book list
        setToastMessage("Book updated successfully!");
        setShowToast(true);
        setEditingBook(null); // Reset editing book
      }
    } catch (error) {
      console.error("Error updating book:", error);
      setToastMessage("Error updating book!");
      setShowToast(true);
    }
  };

  // Delete book
  const handleDeleteBook = async (isbn) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        const response = await axios.delete(`http://127.0.0.1:5000/books/${isbn}`);
        if (response.status === 204) {
          console.log("Book deleted successfully:", response.data);
          fetchBooks(); // Refresh the book list
          setToastMessage("Book deleted successfully!");
          setShowToast(true);
        }
      } catch (error) {
        console.error("Error deleting book:", error);
        setToastMessage("Error deleting book!");
        setShowToast(true);
      }
    }
  };

  // Toggle form visibility
  const toggleAddBookForm = () => {
    setShowAddBook(!showAddBook);
  };

  // Handle viewing book details
  const handleViewDetails = (book) => {
    setSelectedBook(book);
    setShowDetailModal(true);
  };

  return (
    <div className="container">
      <h1 className="my-4">Library Book Collection</h1>

      <div className="mb-3">
        {/* Search bar for existing books */}
        <input
          type="text"
          placeholder="Search by title or author"
          value={searchQuery}
          onChange={onSearch}
          className="form-control"
        />
      </div>

      {/* Button to add a new custom book */}
      <button className="btn btn-primary mb-3" onClick={toggleAddBookForm}>
        {showAddBook ? "Hide Add Book Form" : "Add a book"}
      </button>

      {/* Form to add a new custom book */}
      {showAddBook && (
        <form onSubmit={handleAddCustomBook} className="mb-3">
          <input
            type="text"
            name="isbn"
            placeholder="ISBN"
            value={newBook.isbn}
            onChange={handleNewBookChange}
            required
            className="form-control mb-2"
          />
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={newBook.title}
            onChange={handleNewBookChange}
            required
            className="form-control mb-2"
          />
          <input
            type="text"
            name="authors"
            placeholder="Authors"
            value={newBook.authors}
            onChange={handleNewBookChange}
            required
            className="form-control mb-2"
          />
          <input
            type="date"
            name="published_date"
            value={newBook.published_date}
            onChange={handleNewBookChange}
            required
            className="form-control mb-2"
          />
          <input
            type="text"
            name="genre"
            placeholder="Genre"
            value={newBook.genre}
            onChange={handleNewBookChange}
            className="form-control mb-2"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newBook.description}
            onChange={handleNewBookChange}
            className="form-control mb-2"
          />
          <input
            type="number"
            name="average_rating"
            placeholder="Average Rating"
            value={newBook.average_rating || ""}
            onChange={handleNewBookChange}
            step="0.1"
            className="form-control mb-2"
          />
          <input
            type="text"
            name="cover_image"
            placeholder="Cover Image URL"
            value={newBook.cover_image}
            onChange={handleNewBookChange}
            className="form-control mb-2"
          />
          <button type="submit" className="btn btn-success">
            Add Custom Book
          </button>
        </form>
      )}

      {/* Display filtered books */}
      {filteredBooks.length > 0 ? (
        <div className="row">
          {filteredBooks.map((book) => (
            <div key={book.isbn} className="col-md-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{book.title}</h5>
                  <img src={book.cover_image} alt="Cover" className="img-fluid mb-2" />
                  <p className="card-text"><strong>Authors:</strong> {book.authors}</p>
                  <p className="card-text"><strong>Genre:</strong> {book.genre}</p>
                  <button className="btn btn-info" onClick={() => setEditingBook(book)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDeleteBook(book.isbn)}>
                    Delete
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleViewDetails(book)}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No books found.</p>
      )}

      {/* Edit book modal */}
      <Modal show={!!editingBook} onHide={() => setEditingBook(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleEditBookSubmit}>
            <input
              type="text"
              name="isbn"
              placeholder="ISBN"
              value={editingBook?.isbn || ""}
              readOnly // ISBN is read-only to avoid accidental changes
              className="form-control mb-2"
            />
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={editingBook?.title || ""}
              onChange={handleEditBookChange}
              required
              className="form-control mb-2"
            />
            <input
              type="text"
              name="authors"
              placeholder="Authors"
              value={editingBook?.authors || ""}
              onChange={handleEditBookChange}
              required
              className="form-control mb-2"
            />
            <input
              type="date"
              name="published_date"
              value={editingBook?.published_date || ""}
              onChange={handleEditBookChange}
              required
              className="form-control mb-2"
            />
            <input
              type="text"
              name="genre"
              placeholder="Genre"
              value={editingBook?.genre || ""}
              onChange={handleEditBookChange}
              className="form-control mb-2"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={editingBook?.description || ""}
              onChange={handleEditBookChange}
              className="form-control mb-2"
            />
            <input
              type="number"
              name="average_rating"
              placeholder="Average Rating"
              value={editingBook?.average_rating || ""}
              onChange={handleEditBookChange}
              step="0.1"
              className="form-control mb-2"
            />
            <input
              type="text"
              name="cover_image"
              placeholder="Cover Image URL"
              value={editingBook?.cover_image || ""}
              onChange={handleEditBookChange}
              className="form-control mb-2"
            />
            <button type="submit" className="btn btn-success">Save Changes</button>
          </form>
        </Modal.Body>
      </Modal>

      {/* View book details modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedBook?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <img src={selectedBook?.cover_image} alt="Cover" className="img-fluid mb-2" />
          <p><strong>Authors:</strong> {selectedBook?.authors}</p>
          <p><strong>Published Date:</strong> {selectedBook?.published_date}</p>
          <p><strong>Genre:</strong> {selectedBook?.genre}</p>
          <p><strong>Description:</strong> {selectedBook?.description}</p>
          <p><strong>Average Rating:</strong> {selectedBook?.average_rating}</p>
        </Modal.Body>
      </Modal>

      {/* Toast for feedback messages */}
      <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
        <Toast.Body>{toastMessage}</Toast.Body>
      </Toast>
    </div>
  );
}

export default Library;
