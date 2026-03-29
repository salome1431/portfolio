// ==========================================
// 1. CUSTOM CURSOR
// ==========================================
const cursor = document.querySelector('.custom-cursor');
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Smooth Cursor Animation
function renderCursor() {
    // Easing factor
    const speed = 0.2;
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;

    cursor.style.transform = `translate(${cursorX - 10}px, ${cursorY - 10}px)`;

    requestAnimationFrame(renderCursor);
}
renderCursor();

// Add hover effect to interactive elements
const interactives = document.querySelectorAll('a, button, .upload-zone, input, textarea');
interactives.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// ==========================================
// 2. PARTICLE BACKGROUND (ANTI-GRAVITY)
// ==========================================
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let w, h;

function initCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
}

window.addEventListener('resize', () => {
    initCanvas();
    createParticles();
});

class Particle {
    constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 2 + 0.5;
        // Anti-gravity: moving upwards mostly
        this.speedY = -(Math.random() * 0.5 + 0.1);
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.alpha = Math.random() * 0.5 + 0.1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around
        if (this.y < 0) this.y = h;
        if (this.x > w) this.x = 0;
        if (this.x < 0) this.x = w;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createParticles() {
    particles = [];
    const particleCount = Math.floor(w * h / 10000); // Responsive amount
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p, index) => {
        p.update();
        p.draw();

        // Connect close particles (constellation effect)
        for (let j = index + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - dist / 100)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(animateParticles);
}

initCanvas();
createParticles();
animateParticles();

// ==========================================
// 3. NAVBAR, MOBILE MENU & SMOOTH SCROLL
// ==========================================
const navbar = document.querySelector('.navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    if (navLinks.classList.contains('active')) {
        icon.classList.replace('fa-bars', 'fa-xmark');
    } else {
        icon.classList.replace('fa-xmark', 'fa-bars');
    }
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.querySelector('i').classList.replace('fa-xmark', 'fa-bars');
    });
});

// ==========================================
// 4. SCROLL REVEAL (INTERSECTION OBSERVER)
// ==========================================
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

revealElements.forEach(el => revealObserver.observe(el));

// ==========================================
// 5. RESUME UPLOAD FUNCTIONALITY
// ==========================================
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('resume-upload');
const fileInfo = document.getElementById('file-info');
const fileNameDisplay = document.getElementById('file-name');
const removeFileBtn = document.getElementById('remove-file');
const viewSimulateBtn = document.getElementById('view-simulate-btn');

// Click to select
dropZone.addEventListener('click', (e) => {
    if (e.target !== removeFileBtn && !removeFileBtn.contains(e.target)) {
        fileInput.click();
    }
});

// Drag and drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
});

dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
});

fileInput.addEventListener('change', function () {
    handleFiles(this.files);
});

function handleFiles(files) {
    if (files.length === 0) return;
    const file = files[0];

    // Check if PDF
    if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file only.');
        return;
    }

    // Check size (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
    }

    // Display file
    fileNameDisplay.textContent = file.name;
    fileInfo.classList.remove('hidden');
    viewSimulateBtn.classList.remove('disabled');
    viewSimulateBtn.removeAttribute('disabled');

    // Optional: Simulate saving file
    console.log('File prepared for upload:', file.name);
}

removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent clicking dropzone
    fileInput.value = '';
    fileInfo.classList.add('hidden');
    viewSimulateBtn.classList.add('disabled');
    viewSimulateBtn.setAttribute('disabled', 'true');
});

viewSimulateBtn.addEventListener('click', () => {
    if (!viewSimulateBtn.classList.contains('disabled')) {
        alert(`This would open the uploaded resume: ${fileNameDisplay.textContent}\nBackend integration is required to fully process the download/view.`);
    }
});

// ==========================================
// 6. CONTACT FORM SUBMISSION
// ==========================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = contactForm.querySelector('button');
        const originalText = btn.innerHTML;

        // Simulate sending state
        btn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
        btn.classList.add('disabled');

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        fetch("https://formsubmit.co/ajax/salomedavid085@gmail.com", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Thank you for your message! Salome will get back to you shortly.\n\n(Important: If this is your very first time submitting this form, FormSubmit will send an activation email to salomedavid085@gmail.com! Please check your inbox and click 'Activate' for future messages to work!)");
                    contactForm.reset();
                    btn.innerHTML = 'Message Sent <i class="fa-solid fa-check"></i>';
                } else {
                    alert("Oops! There was a problem sending your message.");
                    btn.innerHTML = 'Failed <i class="fa-solid fa-xmark"></i>';
                }
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('disabled');
                }, 3000);
            })
            .catch(error => {
                alert("Oops! There was an error sending your message.");
                btn.innerHTML = 'Failed <i class="fa-solid fa-xmark"></i>';
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('disabled');
                }, 3000);
            });
    });
}

// ==========================================
// 7. DYNAMIC PROJECTS
// ==========================================
const defaultProjects = [
    {
        id: 1,
        title: 'Event Management Website',
        description: 'A comprehensive web platform designed to streamline event planning, registration, and management. Features an intuitive UI for organizers and attendees.',
        tech: ['HTML', 'CSS', 'JavaScript', 'PHP']
    },
    {
        id: 2,
        title: 'Student Attendance Tracker',
        description: 'A data-driven application that automates attendance tracking for classes, generating insightful reports and flagging irregularities.',
        tech: ['Python', 'MySQL', 'Tkinter']
    },
    {
        id: 3,
        title: 'Data Analysis Dashboard',
        description: 'An interactive BI dashboard visualizing sales and demographic data. Helps stakeholders identify trends and optimize decision making rapidly.',
        tech: ['Power BI', 'SQL', 'Excel']
    },
    {
        id: 4,
        title: 'Mini Data Pipeline Project',
        description: 'An automated ETL data pipeline script extracting raw JSON data, transforming fields, and loading them into a normalized database schema.',
        tech: ['Python', 'Pandas', 'SQL']
    }
];

let projects;
try {
    projects = JSON.parse(localStorage.getItem('portfolio_projects'));
    if (!projects || projects.length === 0) projects = defaultProjects;
} catch (e) {
    projects = defaultProjects;
}

const projectsGrid = document.getElementById('projects-grid');
const addProjectModal = document.getElementById('add-project-modal');
const openModalBtn = document.getElementById('open-project-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const newProjectForm = document.getElementById('new-project-form');

function renderProjects() {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';

    projects.forEach((proj, index) => {
        const delayClass = index % 3 === 0 ? '' : (index % 3 === 1 ? 'delay-1' : 'delay-2');
        const tagsHtml = proj.tech.map(t => `<span class="tech-tag">${t.trim()}</span>`).join('');

        const card = document.createElement('div');
        card.className = `project-card glass-card float-hover ${delayClass}`;
        card.innerHTML = `
      <button class="delete-project-btn" onclick="deleteProject(${proj.id})"><i class="fa-solid fa-trash"></i></button>
      <div class="project-content">
        <h3>${proj.title}</h3>
        <p>${proj.description}</p>
        <div class="tech-stack">
          ${tagsHtml}
        </div>
      </div>
    `;
        projectsGrid.appendChild(card);
    });
}

function saveProjects() {
    localStorage.setItem('portfolio_projects', JSON.stringify(projects));
    renderProjects();
}

window.deleteProject = function (id) {
    if (confirm('Are you sure you want to remove this project?')) {
        projects = projects.filter(p => parseInt(p.id) !== parseInt(id));
        saveProjects();
    }
};

if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
        addProjectModal.classList.add('active');
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addProjectModal.classList.remove('active');
    });
}

if (newProjectForm) {
    newProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('proj-title').value;
        const desc = document.getElementById('proj-desc').value;
        const techStr = document.getElementById('proj-tech').value;
        const techArray = techStr.split(',').map(t => t.trim()).filter(t => t);

        const newProj = {
            id: Date.now(), // unique ID
            title: title,
            description: desc,
            tech: techArray.length > 0 ? techArray : ['Miscellaneous']
        };

        projects.push(newProj);
        saveProjects();

        newProjectForm.reset();
        addProjectModal.classList.remove('active');
    });
}

// Initial render
renderProjects();
