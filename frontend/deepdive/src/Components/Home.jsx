import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../css/Home.module.css';
import heroBg from '../assets/homebg5.png';

const API_BASE = 'https://demoapp-50039367885.development.catalystappsail.in';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_BASE}/products/`);
            if (response.ok) {
                const data = await response.json();
                setProducts(data.slice(0, 6));
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE}/categories/`);
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const categoryIcons = ['✨', '🚀', '🌸', '💥', '🧒', '🎁'];

    const safetyTips = [
        {
            icon: '👨‍👩‍👧‍👦',
            title: 'Adult Supervision',
            description: 'Children should always burst crackers under adult supervision. Never leave kids alone with fireworks.'
        },
        {
            icon: '💧',
            title: 'Keep Water Nearby',
            description: 'Always keep a bucket of water or sand nearby to douse used fireworks and handle emergencies.'
        },
        {
            icon: '👕',
            title: 'Wear Cotton Clothes',
            description: 'Avoid synthetic clothing while bursting crackers. Cotton clothes are safer around fire and sparks.'
        },
        {
            icon: '📏',
            title: 'Maintain Safe Distance',
            description: 'Light fireworks at arm\'s length and move away quickly. Never lean over a firework while lighting it.'
        }
    ];


    return (
        <div className={styles.page}>
            {/* ===== 1. HERO BANNER ===== */}
            <section className={styles.hero}>
                <div className={styles.heroBg} style={{ backgroundImage: `url(${heroBg})` }} />
                <div className={styles.heroOverlay} />
            </section>

            {/* ===== 2. FEATURED CRACKERS ===== */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>🎆 Featured Crackers</h2>
                    <p className={styles.sectionSubtitle}>Our most popular picks for your celebration</p>
                    <div className={styles.sectionDivider} />
                </div>
                <div className={styles.productsGrid}>
                    {products.map((product) => (
                        <div key={product.id} className={styles.productCard}>
                            <div className={styles.productImageWrapper}>
                                <img
                                    src={`${API_BASE}${product.image_url}`}
                                    alt={product.name}
                                    loading="lazy"
                                    className={styles.productImage}
                                />
                                {product.actual_price && product.offer_price && (
                                    <div className={styles.discountBadge}>
                                        {Math.round(((product.actual_price - product.offer_price) / product.actual_price) * 100)}% OFF
                                    </div>
                                )}
                            </div>
                            <div className={styles.productInfo}>
                                <h3 className={styles.productName}>{product.name}</h3>
                                <div className={styles.productPrices}>
                                    {product.actual_price && (
                                        <span className={styles.actualPrice}>₹{product.actual_price}</span>
                                    )}
                                    <span className={styles.offerPrice}>₹{product.offer_price}</span>
                                </div>
                                <button onClick={() => navigate('/products', { state: { addToCart: product.id } })} className={styles.addToCartBtn}>
                                    🛒 Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.viewAllWrapper}>
                    <button onClick={() => navigate('/products')} className={styles.viewAllBtn}>
                        View All Products →
                    </button>
                </div>
            </section>

            {/* ===== 3. SHOP BY CATEGORY ===== */}
            <section className={styles.sectionAlt}>
                <div className={styles.sectionAltInner}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>🎇 Shop by Category</h2>
                        <p className={styles.sectionSubtitle}>Find the perfect crackers for every occasion</p>
                        <div className={styles.sectionDivider} />
                    </div>
                    <div className={styles.categoryGrid}>
                        {categories.map((category, index) => (
                            <div
                                key={category.id}
                                onClick={() => navigate(`/products?category=${category.id}`)}
                                className={styles.categoryCard}
                            >
                                {category.image_url ? (
                                    <div className={styles.categoryImageWrapper}>
                                        <img
                                            src={`${API_BASE}${category.image_url}`}
                                            alt={category.name}
                                            loading="lazy"
                                            className={styles.categoryImg}
                                        />
                                    </div>
                                ) : (
                                    <div className={styles.categoryIcon}>
                                        {categoryIcons[index % categoryIcons.length]}
                                    </div>
                                )}
                                <h3 className={styles.categoryName}>{category.name}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== 4. FESTIVAL OFFERS ===== */}
            <section className={styles.offerSection}>
                <div className={styles.offerBorder}>
                    <div className={styles.offerCard}>
                        <div className={styles.offerDecor1} />
                        <div className={styles.offerDecor2} />

                        <div className={styles.offerContent}>
                            <div>
                                <div className={styles.offerBadge}>🔥 Limited Time Offer</div>
                                <h2 className={styles.offerTitle}>Up to 40% Off for Diwali!</h2>
                                <p className={styles.offerDesc}>
                                    Celebrate the festival of lights with our exclusive Diwali sale. Premium quality crackers at unbeatable prices. Hurry, limited stock available!
                                </p>
                            </div>
                            <div className={styles.offerRight}>
                                <div className={styles.offerEmoji}>🎆</div>
                                <button onClick={() => navigate('/products')} className={styles.offerButton}>
                                    Grab the Deal →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== 5. WHY CHOOSE US ===== */}
            <section className={styles.sectionAlt}>
                <div className={styles.sectionAltInner}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>⭐ Why Choose Us</h2>
                        <p className={styles.sectionSubtitle}>Trusted by thousands of happy customers across India</p>
                        <div className={styles.sectionDivider} />
                    </div>
                    <div className={styles.whyGrid}>
                        {[
                            { icon: '✅', title: 'Quality Tested', desc: 'Every product undergoes rigorous quality testing to ensure safety and performance standards.' },
                            { icon: '📦', title: 'Safe Packing', desc: 'Multi-layer protective packaging ensures your crackers arrive in perfect condition.' },
                            { icon: '💰', title: 'Best Price', desc: 'Factory-direct pricing with no middlemen. Get the best deals on premium crackers.' },
                            { icon: '🚚', title: 'Fast Delivery', desc: 'Swift and reliable delivery across India. Track your order in real-time.' },
                        ].map((item, i) => (
                            <div key={i} className={styles.whyCard}>
                                <div className={styles.whyIcon}>{item.icon}</div>
                                <h3 className={styles.whyTitle}>{item.title}</h3>
                                <p className={styles.whyDesc}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== 6. SAFETY TIPS ===== */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>🛡️ Safety Tips</h2>
                    <p className={styles.sectionSubtitle}>Celebrate safely — follow these essential guidelines</p>
                    <div className={styles.sectionDivider} />
                </div>
                <div className={styles.safetyGrid}>
                    {safetyTips.map((tip, i) => (
                        <div key={i} className={styles.safetyCard}>
                            <div className={styles.safetyTopBar} />
                            <div className={styles.safetyIcon}>{tip.icon}</div>
                            <h3 className={styles.safetyTitle}>{tip.title}</h3>
                            <p className={styles.safetyDesc}>{tip.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== 7. FOOTER ===== */}
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerGrid}>
                        {/* Company Info */}
                        <div>
                            <h3 className={styles.footerBrand}>🎆 CrackersShop</h3>
                            <p className={styles.footerAbout}>
                                Your trusted destination for premium quality crackers direct from Sivakasi. Celebrating festivals with joy and safety since 2020.
                            </p>
                            <div className={styles.socialLinks}>
                                {['📘', '📸', '🐦', '📺'].map((icon, i) => (
                                    <a key={i} href="#" className={styles.socialIcon}>
                                        {icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className={styles.footerHeading}>Quick Links</h4>
                            <ul className={styles.footerLinksList}>
                                {[
                                    { label: 'Home', path: '/' },
                                    { label: 'Categories', path: '/categories' },
                                    { label: 'Products', path: '/products' },
                                    { label: 'About Us', path: '#' },
                                    { label: 'Contact', path: '#' },
                                ].map((link, i) => (
                                    <li key={i}>
                                        <a
                                            onClick={(e) => { e.preventDefault(); navigate(link.path); }}
                                            href={link.path}
                                            className={styles.footerLink}
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className={styles.footerHeading}>Contact Us</h4>
                            <div className={styles.footerLinksList}>
                                <div className={styles.contactItem}>
                                    <span className={styles.contactIcon}>📍</span>
                                    Sivakasi, Tamil Nadu, India
                                </div>
                                <div className={styles.contactItem}>
                                    <span className={styles.contactIcon}>📞</span>
                                    +91 98765 43210
                                </div>
                                <div className={styles.contactItem}>
                                    <span className={styles.contactIcon}>✉️</span>
                                    info@crackersshop.com
                                </div>
                                <div className={styles.contactItem}>
                                    <span className={styles.contactIcon}>🕐</span>
                                    Mon - Sat: 9:00 AM - 8:00 PM
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <p className={styles.footerCopy}>
                        © 2026 CrackersShop. All rights reserved. Made with ❤️ in Sivakasi, India.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Home;