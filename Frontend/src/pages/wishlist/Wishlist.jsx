import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
    fetchWishlist,
    removeWishlistItem,
} from "../../features/wishlist/wishlistSlicer";

import {
    addToCart,
    fetchCart,
} from "../../features/cart/cartSlicer";

import "./Wishlist.css";


const Wishlist = () => {
    const dispatch = useDispatch();

    const { currentUser } = useSelector(
        (state) => state.users
    );

    const {
        items,
        isLoading,
        error,
    } = useSelector((state) => state.wishlist);


    // ==========================================
    // LOAD WISHLIST
    // ==========================================

    useEffect(() => {
        if (currentUser) {
            dispatch(fetchWishlist());
        }
    }, [dispatch, currentUser]);


    // ==========================================
    // REMOVE
    // ==========================================

    const handleRemove = async (item) => {
        try {
            await dispatch(
                removeWishlistItem(item._id)
            ).unwrap();
        } catch (error) {
            alert(error);
        }
    };


    // ==========================================
    // ADD TO CART
    // ==========================================

    const handleAddToCart = async (item) => {
        try {
            await dispatch(
                addToCart({
                    productId: item.product._id,
                    quantity: 1,
                })
            ).unwrap();

            dispatch(fetchCart());

            alert("Added to cart!");
        } catch (error) {
            alert(error);
        }
    };


    return (
        <section className="ge-page-section">

            <div className="ge-container">

                <div className="ge-page-heading">

                    <h1>My Wishlist</h1>

                    <p>
                        {items.length} items
                    </p>

                </div>


                {!currentUser && (
                    <p>
                        Please{" "}
                        <Link
                            to="/login"
                            className="ge-link-gold"
                        >
                            sign in
                        </Link>{" "}
                        to view your wishlist.
                    </p>
                )}


                {currentUser && isLoading && (
                    <p>
                        Loading your wishlist...
                    </p>
                )}


                {currentUser && error && (
                    <p className="ge-wishlist-error">
                        {error}
                    </p>
                )}


                {currentUser &&
                    !isLoading &&
                    !error &&
                    items.length === 0 && (
                        <div className="ge-empty-state">

                            <i className="bi bi-heart"></i>

                            <h2>
                                Your wishlist is empty
                            </h2>

                            <p>
                                Save your favorite beauty
                                products here.
                            </p>

                            <Link
                                to="/shop"
                                className="ge-btn-gold"
                            >
                                Explore Products
                            </Link>

                        </div>
                    )}


                {currentUser &&
                    !isLoading &&
                    !error &&
                    items.length > 0 && (

                        <div className="ge-wishlist-grid">

                            {items.map((item) => (

                                <div
                                    className="ge-wishlist-item"
                                    key={item._id}
                                >

                                    <div className="ge-wishlist-item-media">

                                        <Link
                                            to={`/product/${item.product._id}`}
                                        >
                                            <img
                                                src={
                                                    item.product.image
                                                }
                                                alt={
                                                    item.product.name
                                                }
                                            />
                                        </Link>


                                        <button
                                            type="button"
                                            className="ge-wishlist-remove"
                                            aria-label="Remove from wishlist"
                                            onClick={() =>
                                                handleRemove(item)
                                            }
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </button>

                                    </div>


                                    <div className="ge-wishlist-item-info">

                                        <h3>
                                            {item.product.name}
                                        </h3>


                                        <div className="ge-wishlist-item-price">

                                            <span className="ge-price-new">
                                                ₹{" "}
                                                {
                                                    item.product.price
                                                }
                                            </span>

                                        </div>


                                        <button
                                            type="button"
                                            className="ge-btn-gold ge-wishlist-add-btn"
                                            onClick={() =>
                                                handleAddToCart(
                                                    item
                                                )
                                            }
                                        >
                                            Add to Cart
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>
                    )}


                <Link
                    to="/"
                    className="ge-back-link"
                >
                    Continue Shopping
                </Link>

            </div>

        </section>
    );
};


export default Wishlist;