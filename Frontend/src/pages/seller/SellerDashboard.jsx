import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  fetchBrands,
  createCategory,
  updateCategory,
  deleteCategory,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../features/catalog/catalogSlicer";
import {
  fetchMyProducts,
  fetchSellerDashboard,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../features/sellerProducts/sellerProductSlicer";
import "./SellerDashboard.css";

const INITIAL_FORM = {
  name: "",
  price: "",
  stock: "",
  description: "",
  category: "",
  brand: "",
  image: "",
};

// a simple "add / edit / delete" list, reused for both Categories and Brands
// since they work exactly the same way (just a name field)
const CatalogManager = ({ title, items, onCreate, onUpdate, onDelete }) => {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    onCreate(name);
    setName("");
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    setEditName(item.name);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    onUpdate({ id: editingId, name: editName });
    setEditingId(null);
  };

  const handleDeleteClick = (id) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${title.toLowerCase()}? This cannot be undone.`
    );

    if (confirmed) {
      onDelete(id);
    }
  };

  return (
    <div>
      <form className="ge-seller-catalog-form" onSubmit={handleAdd}>
        <input
          className="ge-form-control"
          placeholder={`New ${title.toLowerCase()} name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit" className="ge-btn-gold">
          Add {title}
        </button>
      </form>

      {items.length === 0 ? (
        <p>No {title.toLowerCase()}s added yet.</p>
      ) : (
        <div className="ge-seller-table-wrap">
          <table className="ge-seller-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  {editingId === item._id ? (
                    <>
                      <td>
                        <input
                          className="ge-form-control"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      </td>
                      <td className="ge-seller-actions">
                        <button
                          type="button"
                          className="ge-btn-gold"
                          onClick={handleSaveEdit}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="ge-btn-outline"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{item.name}</td>
                      <td className="ge-seller-actions">
                        <button type="button" onClick={() => handleEditClick(item)}>
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="ge-seller-delete"
                          onClick={() => handleDeleteClick(item._id)}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const { categories, brands } = useSelector((state) => state.catalog);
  const { items, summary, isLoading, error, message } = useSelector(
    (state) => state.sellerProducts
  );

  const [activeTab, setActiveTab] = useState("products");
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyProducts());
    dispatch(fetchSellerDashboard());
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    try {
      await dispatch(
        createProduct({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        })
      ).unwrap();

      setForm(INITIAL_FORM);
    } catch {
      // error message is already saved in redux state, nothing else to do
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      category: product.category?._id || product.category,
      brand: product.brand?._id || product.brand,
      image: product.image,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(
        updateProduct({
          id: editingId,
          updates: {
            ...form,
            price: Number(form.price),
            stock: Number(form.stock),
          },
        })
      ).unwrap();

      setEditingId(null);
      setForm(INITIAL_FORM);
    } catch {
      // error message is already saved in redux state, nothing else to do
    }
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This cannot be undone."
    );

    if (confirmed) {
      dispatch(deleteProduct(id));
    }
  };

  return (
    <div className="ge-seller-page">
      <div className="ge-seller-header">
        <h1>Seller Dashboard</h1>
        <p>List and manage the products you sell on GlowEssence.</p>
      </div>

      <div className="ge-seller-stats">
        <div className="ge-seller-stat-card">
          <span>My Products</span>
          <h3>{items.length}</h3>
        </div>
        <div className="ge-seller-stat-card">
          <span>Items Sold</span>
          <h3>{summary?.totalItemsSold ?? 0}</h3>
        </div>
        <div className="ge-seller-stat-card">
          <span>My Revenue</span>
          <h3>₹ {summary?.totalRevenue ?? 0}</h3>
        </div>
      </div>

      <div className="ge-seller-tabs">
        <button
          type="button"
          className={activeTab === "products" ? "active" : ""}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          type="button"
          className={activeTab === "categories" ? "active" : ""}
          onClick={() => setActiveTab("categories")}
        >
          Manage Categories
        </button>
        <button
          type="button"
          className={activeTab === "brands" ? "active" : ""}
          onClick={() => setActiveTab("brands")}
        >
          Manage Brands
        </button>
      </div>

      {error && <p className="ge-seller-alert ge-seller-alert-error">{error}</p>}
      {message && (
        <p className="ge-seller-alert ge-seller-alert-success">{message}</p>
      )}

      {activeTab === "products" && (
        <>
          <h2 className="ge-seller-subheading">
            {editingId ? "Edit Product" : "Add Product"}
          </h2>

          <form
            className="ge-seller-form"
            onSubmit={editingId ? handleSaveEdit : handleAddProduct}
          >
            <div className="ge-seller-form-grid">
              <div className="ge-form-group">
                <label className="ge-label">Product Name</label>
                <input
                  className="ge-form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="ge-form-group">
                <label className="ge-label">Price (₹)</label>
                <input
                  className="ge-form-control"
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="ge-form-group">
                <label className="ge-label">Stock</label>
                <input
                  className="ge-form-control"
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="ge-form-group">
                <label className="ge-label">Category</label>
                <select
                  className="ge-form-control"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option value={category._id} key={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ge-form-group">
                <label className="ge-label">Brand</label>
                <select
                  className="ge-form-control"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option value={brand._id} key={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ge-form-group">
                <label className="ge-label">Image URL</label>
                <input
                  className="ge-form-control"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="ge-form-group full">
                <label className="ge-label">Description</label>
                <textarea
                  className="ge-form-control"
                  name="description"
                  rows="3"
                  value={form.description}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
            </div>

            <div className="ge-seller-form-actions">
              <button type="submit" className="ge-btn-gold" disabled={isLoading}>
                {editingId ? "Save Changes" : "Add Product"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="ge-btn-outline"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <h2 className="ge-seller-subheading">My Products</h2>

          {items.length === 0 ? (
            <p>You haven't added any products yet.</p>
          ) : (
            <div className="ge-seller-table-wrap">
              <table className="ge-seller-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="ge-seller-thumb"
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>₹ {product.price}</td>
                      <td>{product.stock}</td>
                      <td className="ge-seller-actions">
                        <button type="button" onClick={() => handleEditClick(product)}>
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="ge-seller-delete"
                          onClick={() => handleDelete(product._id)}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "categories" && (
        <CatalogManager
          title="Category"
          items={categories}
          onCreate={(name) => dispatch(createCategory(name))}
          onUpdate={(payload) => dispatch(updateCategory(payload))}
          onDelete={(id) => dispatch(deleteCategory(id))}
        />
      )}

      {activeTab === "brands" && (
        <CatalogManager
          title="Brand"
          items={brands}
          onCreate={(name) => dispatch(createBrand(name))}
          onUpdate={(payload) => dispatch(updateBrand(payload))}
          onDelete={(id) => dispatch(deleteBrand(id))}
        />
      )}
    </div>
  );
};

export default SellerDashboard;
