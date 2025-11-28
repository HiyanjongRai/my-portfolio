
  const form = document.getElementById("contact-form");
  const popup = document.getElementById("thankyou-popup");
  const popupMessage = document.getElementById("popup-message");
  const closePopup = document.getElementById("close-popup");

  form.addEventListener("submit", function(e) {
    e.preventDefault(); 
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if(name && email && message){
      
      popupMessage.className = "success";
      popupMessage.innerHTML = ` Thank you, <b>${name}</b>!<br>Your message has been received. please wait till i check it `;
    } else {

      popupMessage.className = "warning";
      popupMessage.innerHTML = "⚠️ Please fill all fields!";
    }


    popup.style.display = "flex";

   
    if(popupMessage.className === "success") form.reset();
  });

  closePopup.addEventListener("click", function() {
    popup.style.display = "none";
  });
