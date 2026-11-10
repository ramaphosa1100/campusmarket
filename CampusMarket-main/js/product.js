// ======================================
// CAMPUSMARKET - PRODUCT DETAILS
// SUPABASE DATABASE INTEGRATION
// ======================================

console.log("Product.js is loading...");

// GET PRODUCT ID FROM THE URL
const urlParameters = new URLSearchParams(window.location.search);
const productId = urlParameters.get("id");

// LOAD PRODUCT FROM SUPABASE
async function loadProductDetails() {

    try {

        if (!productId) {
            throw new Error("No product ID was provided.");
        }

        console.log("Loading product with ID:", productId);

        // GET PRODUCT FROM DATABASE
        const { data: product, error } = await supabaseClient
            .from("products")
            .select("*")
            .eq("id", productId)
            .single();

        if (error) {
            throw error;
        }

        if (!product) {
            throw new Error("Product not found.");
        }

        console.log("Product retrieved successfully:", product);

        // DISPLAY PRODUCT INFORMATION
        document.getElementById("productImage").src = product.image_url;

        document.getElementById("productImage").alt = product.title;

        document.getElementById("productCategory").textContent =
            product.category.toUpperCase();

        document.getElementById("productTitle").textContent =
            product.title;

        document.getElementById("productPrice").textContent =
            product.is_free
                ? "FREE / DONATE"
                : "GH₵ " + Number(product.price).toFixed(2);

        document.getElementById("productDescription").textContent =
            product.description || "No description provided.";

        document.getElementById("productCondition").textContent =
            product.condition || "Used";

        document.getElementById("sellerName").textContent =
            product.seller_name || "Campus Student";

        document.getElementById("sellerLocation").textContent =
            product.seller_location || "Location not provided";


        // WHATSAPP CONTACT
        const whatsappButton =
            document.getElementById("whatsappButton");

        if (product.seller_phone) {

            let phone = product.seller_phone.replace(/\D/g, "");

            // Convert a Ghana local number to international format
            if (phone.startsWith("0")) {
                phone = "233" + phone.substring(1);
            }

            const message =
                `Hello, I saw your ${product.title} on CampusMarket. Is it still available?`;

            whatsappButton.href =
                `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

            whatsappButton.style.pointerEvents = "auto";
            whatsappButton.style.opacity = "1";

        } else {

            whatsappButton.textContent =
                "Seller contact not yet available";

            whatsappButton.removeAttribute("href");

            whatsappButton.style.pointerEvents = "none";
            whatsappButton.style.opacity = "0.6";
        }

    } catch (error) {

        console.error("Product loading error:", error);

        document.querySelector(".product-details-section").innerHTML = `
            <div class="container text-center py-5">
                <h2>Product not found</h2>
                <p>This product may have been removed or is unavailable.</p>
                <a href="shop.html" class="btn btn-success">
                    Return to Shop
                </a>
            </div>
        `;
    }
}

// START LOADING PRODUCT
loadProductDetails();