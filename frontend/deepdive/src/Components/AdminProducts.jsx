import { useState, useEffect } from 'react';
import styles from '../css/AdminProducts.module.css';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filterCategory, setFilterCategory] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState('');
    const [actualPrice, setActualPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [image, setImage] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [filterCategory]);

    const fetchCategories = async () => {
        try {
            const response = await fetch('https://demoapp-50039367885.development.catalystappsail.in/categories/');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        let url = 'https://demoapp-50039367885.development.catalystappsail.in/products/';
        if (filterCategory) {
            url += `?category_id=${filterCategory}`;
        }
        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setName(product.name);
        setDescription(product.description || '');
        setQuantity(product.quantity);
        setActualPrice(product.actual_price);
        setOfferPrice(product.offer_price);
        setCategoryId(product.category_id);
        setImage(null);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingProduct(null);
        setName('');
        setDescription('');
        setQuantity('');
        setActualPrice('');
        setOfferPrice('');
        setCategoryId('');
        setImage(null);
    };

    const handleSubmit = async () => {
        if (!name || !quantity || !actualPrice || !offerPrice || !categoryId) {
            alert('Please fill in all required fields');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('quantity', quantity);
        formData.append('actual_price', actualPrice);
        formData.append('offer_price', offerPrice);
        formData.append('category_id', categoryId);
        if (image) formData.append('image', image);

        const url = editingProduct 
            ? `https://demoapp-50039367885.development.catalystappsail.in/products/${editingProduct.id}`
            : 'https://demoapp-50039367885.development.catalystappsail.in/products/';
        
        const method = editingProduct ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                body: formData,
            });

            if (response.ok) {
                alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
                setIsModalOpen(false);
                resetForm();
                fetchProducts();
            } else {
                const errorData = await response.json();
                alert(`Failed to save product: ${errorData.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert(`Error saving product: ${error.message}`);
        }
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                const response = await fetch(`https://demoapp-50039367885.development.catalystappsail.in/products/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    alert('Product deleted successfully!');
                    fetchProducts();
                } else {
                    const errorData = await response.json();
                    alert(`Failed to delete product: ${errorData.detail || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                alert(`Error deleting product: ${error.message}`);
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Product Management</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <select 
                        value={filterCategory} 
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <button className={styles.addButton} onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}>
                        + Add Product
                    </button>
                </div>
            </div>

            <div className={styles.productGrid}>
                {products.map((product) => {
                    const cat = categories.find(c => c.id === product.category_id);
                    return (
                        <div key={product.id} className={styles.productCard}>
                            <div className={styles.cardImageWrapper}>
                                {product.image_url ? (
                                    <img 
                                        src={`https://demoapp-50039367885.development.catalystappsail.in${product.image_url}`} 
                                        alt={product.name} 
                                        className={styles.cardImage} 
                                    />
                                ) : (
                                    <div className={styles.noImage}>No Image</div>
                                )}
                            </div>
                            <div className={styles.cardContent}>
                                <h3 className={styles.cardTitle}>{product.name}</h3>
                                <div className={styles.cardMeta}>
                                    <p><strong>ID:</strong> {product.id}</p>
                                    <p><strong>Category:</strong> {cat ? cat.name : product.category_id}</p>
                                    <p><strong>Quantity:</strong> {product.quantity}</p>
                                    <p className={styles.cardDescription}>{product.description}</p>
                                </div>
                                <div className={styles.cardPrices}>
                                    <span className={styles.actualPrice}>₹{product.actual_price}</span>
                                    <span className={styles.offerPrice}>₹{product.offer_price}</span>
                                </div>
                                <div className={styles.cardActions}>
                                    <button className={styles.editButton} onClick={() => handleEditClick(product)}>Edit</button>
                                    <button className={styles.deleteButton} onClick={() => handleDeleteClick(product.id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Product Name</th>
                            <th>Image</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Actual Price</th>
                            <th>Offer Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                             // Find category name
                             const cat = categories.find(c => c.id === product.category_id);
                             return (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>{product.name}</td>
                                    <td>
                                        {product.image_url && (
                                            <img 
                                                src={`https://demoapp-50039367885.development.catalystappsail.in${product.image_url}`} 
                                                alt={product.name} 
                                                className={styles.categoryImage} 
                                            />
                                        )}
                                    </td>
                                    <td>{cat ? cat.name : product.category_id}</td>
                                    <td>{product.description}</td>
                                    <td>{product.quantity}</td>
                                    <td>₹{product.actual_price}</td>
                                    <td>₹{product.offer_price}</td>
                                    <td>
                                        <button className={styles.editButton} onClick={() => handleEditClick(product)}>Edit</button>
                                        <button className={styles.deleteButton} onClick={() => handleDeleteClick(product.id)}>Delete</button>
                                    </td>
                                </tr>
                             );
                        })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <form>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Category</label>
                                    <select 
                                        value={categoryId} 
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Product Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className={styles.fileInput}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Quantity</label>
                                    <input
                                        type="number"
                                        placeholder="Enter quantity"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Actual Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Enter actual price"
                                        value={actualPrice}
                                        onChange={(e) => setActualPrice(e.target.value)}
                                        required
                                        className={styles.shortInput}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Offer Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Enter offer price"
                                        value={offerPrice}
                                        onChange={(e) => setOfferPrice(e.target.value)}
                                        required
                                    />
                                </div>
                            
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label>Description</label>
                                <textarea
                                    placeholder="Product details..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="3"
                                />
                            </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>
                                    Cancel
                                </button>
                                <button type="button" onClick={handleSubmit} className={styles.confirmButton}>
                                    {editingProduct ? 'Save Changes' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
