import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Categories.module.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch('https://demoapp-50039367885.development.catalystappsail.in/categories/');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            } else {
                console.error('Failed to fetch categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleCategoryClick = (categoryId) => {
        navigate(`/products?category=${categoryId}`);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Explore Categories</h1>
            <div className={styles.grid}>
                {categories.map((category) => (
                    <div 
                        key={category.id} 
                        className={styles.card} 
                        onClick={() => handleCategoryClick(category.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <img 
                            src={`https://demoapp-50039367885.development.catalystappsail.in${category.image_url}`} 
                            alt={category.name} 
                            className={styles.image} 
                        />
                        <div className={styles.cardContent}>
                            <h3 className={styles.categoryName}>{category.name}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Categories;