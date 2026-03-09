import { useState, useEffect } from 'react';
import styles from '../css/AdminCategories.module.css';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryImage, setNewCategoryImage] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

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

    const handleImageChange = (e) => {
        setNewCategoryImage(e.target.files[0]);
    };

    const handleAddCategory = async (e) => {
        console.log("handleAddCategory called");
        try {
            if (e) e.preventDefault();
            console.log("Prevented default");

            if (!newCategoryName.trim()) {
                alert("Please enter a category name");
                return;
            }

            const formData = new FormData();
            formData.append('name', newCategoryName);
            if (newCategoryImage) {
                formData.append('image', newCategoryImage);
            }

            console.log("Sending fetch request...");
            const response = await fetch('https://demoapp-50039367885.development.catalystappsail.in/categories/', {
                method: 'POST',
                body: formData,
            });
            console.log("Fetch response received:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("Success data:", data);
                alert('Category added successfully!');
                setIsModalOpen(false);
                setNewCategoryName('');
                setNewCategoryImage(null);
                fetchCategories(); 
            } else {
                const errorData = await response.json().catch(() => ({ detail: 'Could not parse error JSON' }));
                console.error("Server error:", errorData);
                alert(`Failed to add category: ${errorData.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding category:', error);
            alert(`Error adding category: ${error.message}. Check if backend is running.`);
        }
    };

    const handleEditClick = (category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
        setNewCategoryImage(null);
        setIsModalOpen(true);
    };

    const handleUpdateCategory = async () => {
        if (!newCategoryName.trim()) {
            alert("Please enter a category name");
            return;
        }

        const formData = new FormData();
        formData.append('name', newCategoryName);
        if (newCategoryImage) {
            formData.append('image', newCategoryImage);
        }

        try {
            const response = await fetch(`https://demoapp-50039367885.development.catalystappsail.in/categories/${editingCategory.id}`, {
                method: 'PUT',
                body: formData,
            });

            if (response.ok) {
                alert('Category updated successfully!');
                setIsModalOpen(false);
                setEditingCategory(null);
                setNewCategoryName('');
                setNewCategoryImage(null);
                fetchCategories();
            } else {
                const errorData = await response.json();
                alert(`Failed to update category: ${errorData.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating category:', error);
            alert(`Error updating category: ${error.message}`);
        }
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            try {
                const response = await fetch(`https://demoapp-50039367885.development.catalystappsail.in/categories/${id}`, {
                    method: 'DELETE',
                    body: JSON.stringify({id: id})
                });

                if (response.ok) {
                    alert('Category deleted successfully!');
                    fetchCategories();
                } else {
                    const errorData = await response.json();
                    alert(`Failed to delete category: ${errorData.detail || 'Unknown error'}`);
                }
            } catch (error) {
                console.error('Error deleting category:', error);
                alert(`Error deleting category: ${error.message}`);
            }
        }
    };

    const handleSubmit = () => {
        if (editingCategory) {
            handleUpdateCategory();
        } else {
            handleAddCategory();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Category Management</h1>
                <button className={styles.addButton} onClick={() => {
                    setEditingCategory(null);
                    setNewCategoryName('');
                    setNewCategoryImage(null);
                    setIsModalOpen(true);
                }}>
                    + Add Category
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Preview</th>
                            <th>Category Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>
                                    <img 
                                        src={`https://demoapp-50039367885.development.catalystappsail.in${category.image_url}`} 
                                        alt={category.name} 
                                        className={styles.categoryImage} 
                                    />
                                </td>
                                <td>{category.name}</td>
                                <td>
                                    <button className={styles.editButton} onClick={() => handleEditClick(category)}>Edit</button>
                                    <button className={styles.deleteButton} onClick={() => handleDeleteClick(category.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
                        <form>
                            <div className={styles.formGroup}>
                                <label>Category Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter Category Name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Category Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>
                                    Cancel
                                </button>
                                <button type="button" onClick={handleSubmit} className={styles.confirmButton}>
                                    {editingCategory ? 'Update Category' : 'Add Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategories;
