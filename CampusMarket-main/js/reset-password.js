
// ======================================
// CAMPUSMARKET - PASSWORD RESET
// ======================================

const resetForm = document.getElementById("resetPasswordForm");
const resetMessage = document.getElementById("resetMessage");

function showResetMessage(message, type) {
    resetMessage.textContent = message;
    resetMessage.className = "mt-3 alert alert-" + type;
}


// CHECK WHETHER A RECOVERY SESSION EXISTS

async function checkRecoverySession() {
    try {
        const { data, error } =
            await supabaseClient.auth.getSession();

        if (error) throw error;

        if (!data.session) {
            resetForm.style.display = "none";

            showResetMessage(
                "Your password recovery session is missing or has expired. Please request a new recovery link.",
                "warning"
            );
        }

    } catch (error) {
        console.error(error);

        resetForm.style.display = "none";

        showResetMessage(
            "Unable to verify your recovery link. Please request another one.",
            "danger"
        );
    }
}

checkRecoverySession();


// SAVE THE NEW PASSWORD

resetForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const newPassword =
        document.getElementById("newPassword").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const submitButton = resetForm.querySelector(
        'button[type="submit"]'
    );

    if (newPassword.length < 6) {
        showResetMessage(
            "Your password must contain at least 6 characters.",
            "warning"
        );
        return;
    }

    if (newPassword !== confirmPassword) {
        showResetMessage(
            "The passwords do not match. Please try again.",
            "danger"
        );
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Updating Password...";

    try {
        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError) throw sessionError;

        if (!sessionData.session) {
            throw new Error(
                "Your recovery session has expired. Please request a new password reset link."
            );
        }

        const { error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;

        showResetMessage(
            "Your password has been updated successfully. You can now log in with your new password.",
            "success"
        );

        resetForm.reset();
        resetForm.style.display = "none";

        setTimeout(function() {
            window.location.href = "login.html";
        }, 2500);

    } catch (error) {
        console.error("Password reset error:", error);

        showResetMessage(
            error.message || "Unable to update your password.",
            "danger"
        );

    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Update Password";
    }
});
