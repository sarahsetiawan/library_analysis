import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Container, Row, Col } from 'react-bootstrap';

// Register the components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DataPage() {
  const [data, setData] = useState({ genres: [], num_authors: [], avg_ratings: [] });
  const [wordCloud, setWordCloud] = useState('');

  useEffect(() => {
    fetchGenreData();
    fetchWordCloud(); // Fetch the word cloud image when the component mounts
  }, []);

  const fetchGenreData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/genre_analysis');
      setData(response.data);
    } catch (error) {
      console.error("Error fetching genre data:", error);
    }
  };

  const fetchWordCloud = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/wordcloud');
      setWordCloud(response.data.wordcloud);
    } catch (error) {
      console.error("Error fetching word cloud:", error);
    }
  };

  // Data for authors histogram
  const authorsChartData = {
    labels: data.genres,
    datasets: [
      {
        label: 'Number of Authors',
        data: data.num_authors,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  // Data for average ratings histogram
  const ratingsChartData = {
    labels: data.genres,
    datasets: [
      {
        label: 'Average Rating',
        data: data.avg_ratings,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  return (
    <Container>
      <h1 align = "center" >Data Analysis</h1>

      <Row className="mb-4">
        <Col>
          <h2>Number of Authors per Genre</h2>
          <Bar
            data={authorsChartData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <h2>Average Rating per Genre</h2>
          <Bar
            data={ratingsChartData}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </Col>
      </Row>

      <Row>
        <Col>
          <h2>Word Cloud of Authors</h2>
          {wordCloud ? (
            <img src={wordCloud} alt="Word Cloud" style={{ maxWidth: '100%', height: 'auto' }} />
          ) : (
            <p>Loading word cloud...</p>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default DataPage;
