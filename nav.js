document.getElementById("menu-toggle").addEventListener("click", function () {
    this.classList.toggle("open");
    document.getElementById("menu").classList.toggle("nav-active");
});

// Close menu when a link is clicked (for mobile)
document.querySelectorAll(".nav-menu a").forEach(link => {
    link.addEventListener("click", () => {
        document.getElementById("menu").classList.remove("nav-active");
        document.getElementById("menu-toggle").classList.remove("open");
    });
});
