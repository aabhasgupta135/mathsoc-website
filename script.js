document.addEventListener('DOMContentLoaded', () => {
  // Theme Toggle Logic
  const themeToggle = document.getElementById('theme-toggle');
  
  // Check local storage or system preference on load
  const currentTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  themeToggle.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });

  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when a link is clicked
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // Navbar Scroll Effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Active link switching on scroll
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= (sectionTop - 200)) {
        current = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href').includes(current)) {
        item.classList.add('active');
      }
    });
  });

  // Reveal Animations on Scroll
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const revealPoint = 150;
    
    revealElements.forEach(el => {
      const revealTop = el.getBoundingClientRect().top;
      if (revealTop < windowHeight - revealPoint) {
        el.classList.add('active');
      }
    });
  };
  
  // Initial check
  revealOnScroll();
  
  // Check on scroll
  window.addEventListener('scroll', revealOnScroll);

  // Network Graph (Graph Theory Background)
  const initNetworkGraph = () => {
    const canvas = document.getElementById('networkCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let nodes = [];
    const connectionDistance = 150;
    const nodeCount = 50;
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    // Initialize nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        radius: Math.random() * 2 + 1
      });
    }
    
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update positions
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        
        // Bounce off walls
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      });
      
      // Draw lines between close nodes
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 86, 179, ${1 - dist / connectionDistance})`;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      
      // Draw nodes
      ctx.fillStyle = 'rgba(0, 86, 179, 0.5)';
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      
      requestAnimationFrame(draw);
    };
    
    draw();
  };

  initNetworkGraph();

  // Interactive Logo Widget Logic
  const widget = document.getElementById('logoWidget');
  const video = document.getElementById('logoVideo');
  
  if (widget && video) {
    // Safari WebM Alpha Fallback Detection
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      widget.classList.add('safari-fallback');
    }

    let scrubInterval;
    
    // We rely on native autoplay for initial load, so no need for loadedmetadata or canplaythrough.

    const playForward = () => {
        clearInterval(scrubInterval);
        video.playbackRate = 1.33; // Match the 0.04s per 30ms rate
        let playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Autoplay might be prevented, but hover will still work
            });
        }
    };

    const playBackward = (onComplete) => {
        clearInterval(scrubInterval);
        video.pause(); // Pause native forward playback
        scrubInterval = setInterval(() => {
            let newTime = video.currentTime - 0.04;
            if (newTime <= 0) {
                video.currentTime = 0;
                clearInterval(scrubInterval);
                if (onComplete && typeof onComplete === 'function') onComplete();
            } else {
                video.currentTime = newTime;
            }
        }, 30);
    };

    const manualPlayForward = () => {
        clearInterval(scrubInterval);
        let lastTime = -1;
        scrubInterval = setInterval(() => {
            let newTime = video.currentTime + 0.04;
            video.currentTime = newTime;
            // Android Chrome WebM fallback: stop if duration is reached OR if currentTime stops updating (end of video)
            if (video.currentTime === lastTime || (video.duration && video.currentTime >= video.duration - 0.05)) {
                clearInterval(scrubInterval);
            }
            lastTime = video.currentTime;
        }, 30);
    };

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isTouchDevice) {
        // Mobile behavior: Tap to play backward then immediately bounce forward safely
        widget.addEventListener('click', (e) => {
            e.preventDefault();
            if (scrubInterval) clearInterval(scrubInterval);
            playBackward(() => {
                manualPlayForward();
            });
        });
    } else {
        // Desktop behavior: Hover to play backward, leave to play forward
        widget.addEventListener('mouseenter', () => playBackward());
        widget.addEventListener('mouseleave', playForward);
    }
  }
});
