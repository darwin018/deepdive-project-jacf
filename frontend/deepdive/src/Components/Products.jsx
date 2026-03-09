import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import styles from '../css/Products.module.css';
import addtocartIcon from '../assets/addtocart.png';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState({}); // { productId: quantity }
    const [inputQuantities, setInputQuantities] = useState({}); // { productId: quantity }
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setSelectedCategory(parseInt(categoryParam));
        } else {
            setSelectedCategory('All');
        }
    }, [searchParams]);

    const fetchProducts = async () => {
        try {
            const response = await fetch('https://demoapp-50039367885.development.catalystappsail.in/products/');
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

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

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        if (categoryId === 'All') {
            navigate('/products');
        } else {
            navigate(`/products?category=${categoryId}`);
        }
    };

    const handleAddToCart = (productId) => {
        const qty = inputQuantities[productId] || 1;
        setCart(prev => ({ ...prev, [productId]: qty }));
    };

    const handleUpdateQuantity = (productId, change) => {
        if (cart[productId]) {
            // Update cart quantity
            setCart(prev => {
                const currentQty = prev[productId];
                const newQty = currentQty + change;
                
                if (newQty <= 0) {
                    const newCart = { ...prev };
                    delete newCart[productId];
                    return newCart;
                }
                return { ...prev, [productId]: newQty };
            });
        } else {
            // Update input quantity
            setInputQuantities(prev => {
                const currentQty = prev[productId] || 1;
                const newQty = Math.max(1, currentQty + change);
                return { ...prev, [productId]: newQty };
            });
        }
    };

    const handleRemoveFromCart = (productId) => {
        setCart(prev => {
            const newCart = { ...prev };
            delete newCart[productId];
            return newCart;
        });
    };

    const handleCheckoutClick = () => {
        setShowCheckoutModal(true);
    };

    const handleCloseModal = () => {
        setShowCheckoutModal(false);
    };

    const handleFinalCheckout = () => {
        const savings = getTotalSavings();
        const total = getTotalPrice();
        
        setShowCheckoutModal(false);
        navigate('/checkout', { 
            state: { 
                cart, 
                products, 
                totalSavings: savings, 
                grandTotal: total 
            } 
        });
    };

    const getTotalItems = () => {
        return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    };

    const getTotalPrice = () => {
        return Object.entries(cart).reduce((sum, [id, qty]) => {
            const product = products.find(p => p.id === parseInt(id));
            if (!product) return sum;
            return sum + (product.offer_price * qty);
        }, 0);
    };

    const getTotalActualPrice = () => {
        return Object.entries(cart).reduce((sum, [id, qty]) => {
            const product = products.find(p => p.id === parseInt(id));
            if (!product) return sum;
            const actual = product.actual_price ? parseFloat(product.actual_price) : parseFloat(product.offer_price);
            return sum + (actual * qty);
        }, 0);
    };

    const getTotalSavings = () => {
        return Object.entries(cart).reduce((sum, [id, qty]) => {
            const product = products.find(p => p.id === parseInt(id));
            if (!product) return sum;
            const actual = product.actual_price ? parseFloat(product.actual_price) : parseFloat(product.offer_price);
            const offer = parseFloat(product.offer_price);
            return sum + ((actual - offer) * qty);
        }, 0);
    };

    const filteredProducts = selectedCategory === 'All' 
        ? products 
        : products.filter(product => product.category_id === parseInt(selectedCategory));

    return (
        <div className={styles.container}>
            <div className={styles.filterContainer}>
                <select 
                    className={styles.filterSelect}
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                >
                    <option value="All">All Categories</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.productTable}>
                    <thead>
                        <tr>
                            <th className={styles.imageHeader}><i className="fa-regular fa-image"></i></th>
                            <th>Name</th>
                            <th>Actual Price</th>
                            <th>Offer Price</th>
                            <th className={styles.actionHeader}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map((product) => {
                            const inCart = !!cart[product.id];
                            const quantity = inCart ? cart[product.id] : (inputQuantities[product.id] || 1);

                            return (
                                <tr key={product.id} className={styles.productRow}>
                                    <td className={styles.imageCell}>
                                        <div className={styles.productImageWrapper}>
                                            <img 
                                                src={`https://demoapp-50039367885.development.catalystappsail.in${product.image_url}`} 
                                                alt={product.name} 
                                                className={styles.productImage} 
                                            />
                                        </div>
                                    </td>
                                    <td className={styles.nameCell}>
                                        <h3 className={styles.productName}>{product.name}</h3>
                                    </td>
                                    <td className={styles.priceCell}>
                                        <span className={styles.actualPrice}>
                                            {product.actual_price ? `₹${product.actual_price}` : '-'}
                                        </span>
                                    </td>
                                    <td className={styles.priceCell}>
                                        <span className={styles.offerPrice}>₹{product.offer_price}</span>
                                    </td>
                                    <td className={styles.actionCell}>
                                        <div className={styles.quantityControls}>
                                            <button 
                                                className={styles.qtyButton} 
                                                onClick={() => handleUpdateQuantity(product.id, -1)}
                                            >-</button>
                                            <span className={styles.qtyInput}>{quantity}</span>
                                            <button 
                                                className={styles.qtyButton} 
                                                onClick={() => handleUpdateQuantity(product.id, 1)}
                                            >+</button>
                                            
                                            {inCart ? (
                                                <button 
                                                    className={styles.removeCartItem} 
                                                    onClick={() => handleRemoveFromCart(product.id)}
                                                >✕</button>
                                            ) : (
                                                <button 
                                                    className={styles.addToCartButton} 
                                                    onClick={() => handleAddToCart(product.id)}
                                                    title="Add to Cart"
                                                >
                                                    <img src={addtocartIcon} alt="Add to Cart" className={styles.cartIcon} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {getTotalItems() > 0 && (
                <div className={styles.floatingCart}>
                    <div className={styles.cartInfo}>
                        <span className={styles.itemCount}>{getTotalItems()} Items</span>
                        <span className={styles.divider}>|</span>
                        <span className={styles.totalPrice}>₹{getTotalPrice().toFixed(2)}</span>
                    </div>
                    <button className={styles.checkoutButton} onClick={handleCheckoutClick}>
                        View Cart & Checkout
                    </button>
                </div>
            )}

            {showCheckoutModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Checkout</h2>
                            <button className={styles.closeButton} onClick={handleCloseModal}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            <table className={styles.checkoutTable}>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(cart).map(([id, qty]) => {
                                        const product = products.find(p => p.id === parseInt(id));
                                        if (!product) return null;
                                        return (
                                            <tr key={id}>
                                                <td>{product.name}</td>
                                                <td>{qty}</td>
                                                <td>₹{product.offer_price}</td>
                                                <td>₹{(product.offer_price * qty).toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="3" className={styles.totalLabel}>Total Actual Price</td>
                                        <td className={styles.totalActualPrice}>₹{getTotalActualPrice().toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" className={styles.totalLabel}>Total Savings</td>
                                        <td className={styles.savingsAmount}>-₹{getTotalSavings().toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3" className={styles.totalLabel}>Grand Total</td>
                                        <td className={styles.grandTotal}>₹{getTotalPrice().toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.finalCheckoutButton} onClick={handleFinalCheckout}>
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;