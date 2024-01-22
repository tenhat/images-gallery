import { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // toast styling
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Search from './components/Search';
import ImageCard from './components/ImageCard';
import { Col, Container, Row } from 'react-bootstrap';
import Welcome from './components/Welcome';
import Spinner from './components/Spinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5050';

const App = () => {
  const [word, setWord] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getSavedImages = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/images`);
      setIsLoading(false);
      toast.success('saved images loaded');
      setImages(res.data || []);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSavedImages();
  }, []);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/new-image?query=${word}`);
      setIsLoading(false);
      setImages([{ ...res.data, title: word }, ...images]);
      toast.info(`found image for ${word}`);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
      setIsLoading(false);
    }
    setWord('');
  };

  const handleDeleteImage = async (id) => {
    try {
      setIsLoading(true);
      const res = await axios.delete(`${API_URL}/images/${id}`);
      if (res.data?.deleted_count) {
        setImages(images.filter((image) => image.id !== id));
      }
      toast.warn('image deleted');
      setIsLoading(false);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  const hancleSaveImage = async (id) => {
    const selectedImage = images.find((image) => image.id === id);
    selectedImage.saved = true;
    try {
      setIsLoading(true);
      const res = await axios.post(`${API_URL}/images`, selectedImage);
      setIsLoading(false);
      if (res.data?.inserted_id) {
        setImages(
          images.map((image) =>
            image.id === id ? { ...image, saved: true } : image,
          ),
        );
        toast.success('image saved');
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <Header title="Images Gallery" />
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <Search
            word={word}
            setWord={setWord}
            handleSubmit={handleSearchSubmit}
          />
          <Container className="mt-4">
            {images.length ? (
              <Row xs={1} md={2} lg={3}>
                {images.map((image, i) => (
                  <Col key={i} className="pb-3">
                    <ImageCard
                      image={image}
                      deleteImage={handleDeleteImage}
                      saveImage={hancleSaveImage}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Welcome />
            )}
          </Container>
        </>
      )}
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default App;
