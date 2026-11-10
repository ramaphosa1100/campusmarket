
// CAMPUSMARKET PAGE PROTECTION

console.log("Protect.js is loading...");

async function protectSellingPage() {

    console.log("Checking student login...");

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Session error:", error.message);
        return;
    }

    console.log("Current session:", data.session);

    if (!data.session) {

        alert("Please log in before selling products.");

        window.location.href = "login.html";

    } else {

        console.log("Student is logged in. Access granted.");

    }
}

protectSellingPage();
