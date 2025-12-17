
(function () {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const nameEl = document.getElementById("name");
    const emailEl = document.getElementById("email");
    const msgEl = document.getElementById("message");
    const popup = document.getElementById("thankyou-popup");
    const popupMsg = document.getElementById("popup-message");
    const popupClose = document.getElementById("close-popup");
    const sendBtn = form.querySelector('button[type="submit"]');

    const SERVICE_ID = "service_7b9pvt2";
    const TEMPLATE_ID = "template_1udgx0v";

    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!nameEl.value.trim() || !emailEl.value.trim() || !msgEl.value.trim()) {
        showPopup("Please fill out all fields.", false);
        return;
      }

      if (!isEmail(emailEl.value.trim())) {
        showPopup("Please enter a valid email address.", false);
        return;
      }

      sendBtn.disabled = true;
      sendBtn.dataset.original = sendBtn.innerHTML;
      sendBtn.innerHTML = `<i class="fa fa-spinner fa-spin"></i> Sending...`;

      const templateParams = {
        from_name: nameEl.value.trim(),
        from_email: emailEl.value.trim(),
        message: msgEl.value.trim(),
      };

      try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
        form.reset();
        showPopup("✅ Thank you for your message.<br>I’ll get back to you shortly.", true);
      } catch (err) {
        console.error("EmailJS error:", err);
        showPopup("Something went wrong while sending. Please try again later.", false);
      } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = sendBtn.dataset.original || "Send";
      }
    });

    if (popupClose) {
        popupClose.addEventListener("click", () => {
          popup.classList.remove("show");
        });
    }

    function showPopup(message, success = true) {
      if (!popupMsg || !popup) return;
      popupMsg.innerHTML = message;
      popupMsg.classList.toggle("success", success);
      popupMsg.classList.toggle("error", !success);
      popup.classList.add("show");
    }
})();
