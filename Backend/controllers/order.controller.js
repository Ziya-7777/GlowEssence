import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import crypto from "crypto";
import razorpay from "../configs/razorpay.js";

// Create Razorpay Order
// Now accepts MULTIPLE products at once (a full cart),
// instead of just one productId + quantity.
// Expected body: { items: [ { productId, quantity }, { productId, quantity }, ... ] }
export const createRazorpayOrder = async (req, res) => {

    try {
        const { items } = req.body;

        // Validation - items must be a non-empty array
        if (!items || !Array.isArray(items) || items.length === 0) {

            return res.status(400).json({

                success: false,

                message: "Items are required."

            });

        }

        // Total price of ALL items combined
        let totalPrice = 0;

        // Loop through every item and add up the price
        for (const item of items) {

            const { productId, quantity } = item;

            if (!productId || !quantity || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Each item needs a valid productId and quantity."
                });
            }

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found."
                });
            }

            totalPrice += product.price * quantity;

        }

        // Razorpay Amount Paisa me leta hai
        const options = {

            amount: totalPrice * 100,

            currency: "INR",

            receipt: `receipt_${Date.now()}`

        };

        // Create Razorpay Order (ek hi order, chahe items kitne bhi ho)
        const razorpayOrder = await razorpay.orders.create(options);

        // Success Response
        return res.status(200).json({

            success: true,

            message: "Razorpay Order Created Successfully.",

            razorpayOrder,

            totalPrice

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// Verify Razorpay Payment
// Same items array is sent again here so we can save the full order
// (with all products) after payment is confirmed.
export const verifyPayment = async (req, res) => {

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, items } = req.body;

        // Validation
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }

        // Duplicate Payment Protection
        // Same Payment ID dobara database me save nahi hogi
        const existingOrder = await Order.findOne({

            paymentId: razorpay_payment_id

        });


        if (existingOrder) {

            return res.status(400).json({

                success: false,

                message: "Payment already verified."

            });

        }

        // Generate Signature
        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        // Verify Signature
        if (generatedSignature !== razorpay_signature) {

            return res.status(400).json({

                success: false,

                message: "Payment Verification Failed."

            });

        }

        // Step 1: check every product exists and has enough stock
        // We do this BEFORE creating the order, so we don't save a half-valid order.
        const orderItems = [];
        let totalPrice = 0;

        for (const item of items) {

            const { productId, quantity } = item;

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found."
                });
            }

            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}.`
                });
            }

            orderItems.push({
                product: productId,
                quantity,
                price: product.price
            });

            totalPrice += product.price * quantity;

        }

        // Step 2: create ONE order that holds all the items
        const order = await Order.create({

            user: req.user.id,

            items: orderItems,

            totalPrice,

            paymentId: razorpay_payment_id,

            razorpayOrderId: razorpay_order_id,

            paymentStatus: "Paid",

            status: "Confirmed"

        });

        // Step 3: reduce stock for every product in the order
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        return res.status(201).json({

            success: true,

            message: "Payment Verified Successfully.",

            order

        });

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// Create a Cash on Delivery Order
// No Razorpay involved - the order is placed right away and marked
// "Pending" payment, to be collected when the order is delivered.
// Expected body: { items: [ { productId, quantity }, ... ] }
export const createCodOrder = async (req, res) => {

    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Items are required."
            });
        }

        // Step 1: check every product exists and has enough stock
        const orderItems = [];
        let totalPrice = 0;

        for (const item of items) {

            const { productId, quantity } = item;

            if (!productId || !quantity || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Each item needs a valid productId and quantity."
                });
            }

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found."
                });
            }

            if (product.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}.`
                });
            }

            orderItems.push({
                product: productId,
                quantity,
                price: product.price
            });

            totalPrice += product.price * quantity;

        }

        // Step 2: create the order right away (no payment gateway needed)
        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            totalPrice,
            paymentMethod: "COD",
            paymentStatus: "Pending",
            status: "Confirmed"
        });

        // Step 3: reduce stock for every product in the order
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        return res.status(201).json({
            success: true,
            message: "Order placed successfully. Pay with cash on delivery.",
            order
        });

    }

    catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Cancel Order + Refund
export const cancelOrder = async (req, res) => {
    try {
        // Get Order Id
        const { orderId } = req.params;

        // Find Order (populate product inside each item so we can restore stock)
        const order = await Order.findById(orderId).populate("items.product");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found."
            });
        }

        // Already Cancelled ?
        if (order.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Order already cancelled."
            });
        }

        // Refund Only If Payment Was Successful
        if (order.paymentStatus === "Paid") {
            // Razorpay Refund API
            await razorpay.payments.refund(
                order.paymentId,
                {
                    amount: order.totalPrice * 100
                }
            );
            order.paymentStatus = "Refunded";
        }

        // Update Order Status
        order.status = "Cancelled";

        // Restore stock for every product in this order
        for (const item of order.items) {
            if (item.product) {
                item.product.stock += item.quantity;
                await item.product.save();
            }
        }

        // Save Changes
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order cancelled and refund processed successfully.",
            order
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
