
 // ======================================
 // CAMPUSMARKET SEARCH FUNCTIONALITY
 // ======================================

// GET THE SEARCH ELEMENTS
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

// GET ALL FEATURED PRODUCT CARDS
const productCards = document.querySelectorAll(".product-card");

// GET THE PRODUCT CONTAINER
const productContainer = document.querySelector(".products-section .row");

// CREATE A MESSAGE FOR WHEN NO PRODUCT IS FOUND
if (productContainer && searchInput && searchButton) {

    const noResultsMessage = document.createElement("p");

    noResultsMessage.textContent = "Sorry, no matching products found.";
    noResultsMessage.style.display = "none";
    noResultsMessage.style.textAlign = "center";
    noResultsMessage.style.marginTop = "20px";

    productContainer.insertAdjacentElement("beforebegin", noResultsMessage);

    // SEARCH FUNCTION
    function searchProducts() {

        const searchValue = searchInput.value.toLowerCase().trim();

        let productsFound = 0;

        productCards.forEach(function(card) {

            const productName =
                card.querySelector("h5").textContent.toLowerCase();

            const productCategory =
                card.querySelector(".product-category").textContent.toLowerCase();

            if (
                productName.includes(searchValue) ||
                productCategory.includes(searchValue)
            ) {
                card.parentElement.style.display = "";
                productsFound++;
            } else {
                card.parentElement.style.display = "none";
            }
        });

        noResultsMessage.style.display =
            productsFound === 0 ? "block" : "none";
    }

    // SEARCH WHEN BUTTON IS CLICKED
    searchButton.addEventListener("click", searchProducts);

    // SEARCH WHEN ENTER IS PRESSED
    searchInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            searchProducts();
        }
    });
}


// ======================================
// SUPABASE DATABASE CONNECTION TEST
// ======================================

async function testDatabaseConnection() {

    const { data, error } = await supabaseClient
        .from("products")
        .select("id")
        .limit(1);

    if (error) {
        console.error("Database connection failed:", error.message);
    } else {
        console.log("Database connection successful!");
        console.log("Products retrieved:", data);
    }
}


// ======================================
// CAMPUSMARKET NAVBAR LOGIN / LOGOUT
// ======================================

const navLoginButton = document.getElementById("navLoginButton");
const navLogoutButton = document.getElementById("navLogoutButton");

// SHOW THE CORRECT BUTTON
function updateNavbarButtons(session) {

    const isLoggedIn = !!session;

    if (navLoginButton) {
        navLoginButton.style.display =
            isLoggedIn ? "none" : "inline-block";
    }

    if (navLogoutButton) {
        navLogoutButton.style.display =
            isLoggedIn ? "inline-block" : "none";
    }
}

// CHECK THE CURRENT LOGIN SESSION
async function checkLoginSession() {

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Session check failed:", error.message);
        return;
    }

    updateNavbarButtons(data.session);
}

// LISTEN FOR LOGIN AND LOGOUT CHANGES
supabaseClient.auth.onAuthStateChange(function(event, session) {

    updateNavbarButtons(session);

});

// CHECK SESSION WHEN HOMEPAGE LOADS
checkLoginSession();


// ======================================
// LOGOUT FUNCTION
// ======================================

if (navLogoutButton) {

    navLogoutButton.addEventListener("click", async function() {

        navLogoutButton.disabled = true;
        navLogoutButton.textContent = "Logging out...";

        const { error } = await supabaseClient.auth.signOut();

        if (error) {

            alert("Logout failed: " + error.message);

            navLogoutButton.disabled = false;
            navLogoutButton.textContent = "Logout";

            return;
        }

        window.location.href = "index.html";

    });

}


// ======================================
// RUN DATABASE TEST
// ======================================

testDatabaseConnection();
