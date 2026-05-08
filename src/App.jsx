import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductModal from './components/ProductModal';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Error al cargar productos');
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handlers
  const handleAddClick = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error al eliminar producto');
        setProducts(products.filter(p => (p._id || p.id) !== id));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        // Update
        const id = editingProduct._id || editingProduct.id;
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error('Error al actualizar producto');
        const updatedProduct = await response.json();
        
        // Asumiendo que la API devuelve el producto actualizado, si no recargamos todo
        if (updatedProduct && (updatedProduct._id || updatedProduct.id)) {
            setProducts(products.map(p => (p._id || p.id) === id ? updatedProduct : p));
        } else {
            fetchProducts();
        }
      } else {
        // Create
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if (!response.ok) throw new Error('Error al crear producto');
        const newProduct = await response.json();
        
        // Asumiendo que la API devuelve el producto creado, si no recargamos todo
        if (newProduct && (newProduct._id || newProduct.id)) {
            setProducts([...products, newProduct]);
        } else {
            fetchProducts();
        }
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-container">
      <Header onAddClick={handleAddClick} />
      
      <main>
        {error && <div className="empty-state" style={{color: 'var(--danger-color)', borderColor: 'var(--danger-color)'}}>{error}</div>}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Cargando inventario...</p>
          </div>
        ) : (
          !error && <ProductList 
            products={products} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteClick} 
          />
        )}
      </main>

      <ProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveProduct}
        product={editingProduct}
      />
    </div>
  );
}

export default App;
