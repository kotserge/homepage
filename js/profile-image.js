const images = [
    ["/assets/images/me.webp", "Profile Picture"],
    ["/assets/images/8-bit-serge.webp", "8-bit Serge"],
    ["/assets/images/futurama-simulation.webp", "Futurama Simulation"],
];

let currentImage = 0;
const profileImage = document.getElementById("profileImage");

profileImage.addEventListener("click", () => {
    currentImage = (currentImage + 1) % images.length;
    profileImage.src = images[currentImage][0];
    profileImage.alt = images[currentImage][1];
});
