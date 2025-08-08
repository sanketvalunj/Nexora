// Show About modal
document.querySelector("a[href='#about']").addEventListener("click", function(e) {
  e.preventDefault();
  document.getElementById("about-modal").style.display = "block";
});

// Show Contact modal
document.getElementById("contact-link").addEventListener("click", function(e) {
  e.preventDefault();
  document.getElementById("contact-modal").style.display = "block";
});

// Close modal function (reusable)
function closeModal(id) {
  document.getElementById(id).style.display = "none";
}
function selectLanguage(lang) {
  alert("You selected: " + lang);
  // You can redirect or store language using localStorage here
}
document.querySelectorAll(".level-card").forEach(card => {
  card.addEventListener("click", () => {
    const level = card.getAttribute("data-level");
    alert(`You selected: ${level}`);
    // Redirect to a new page if needed
    // window.location.href = `lessons.html?level=${level}`;
  });
});
function goToFamiliarity() {
  window.location.href = "familiarity.html";
}
// familiarity.js
document.addEventListener('DOMContentLoaded', () => {
  const levelCards = document.querySelectorAll('.level-card');

  levelCards.forEach(card => {
    card.addEventListener('click', () => {
      // Remove existing selections
      levelCards.forEach(c => c.classList.remove('selected'));

      // Add selected class
      card.classList.add('selected');

      // Get the selected level
      const selectedLevel = card.getAttribute('data-level');

      // Store in localStorage (or use fetch to send to server)
      localStorage.setItem('languageFamiliarity', selectedLevel);



      // Optional: Redirect or show confirmation
      setTimeout(() => {
        alert(`You selected: ${selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)} level`);
        // location.href = 'next-page.html'; // Uncomment to redirect
      }, 300);
    });
  });
});
function goToBeginner() {
  window.location.href = "contents.html";
}
function goToAdvanced(){
    
    window.location.href = "contents2.html";
}
function goToIntermediate(){
    
    window.location.href = "contents3.html";
}
