document.addEventListener('DOMContentLoaded', function() {
      const pages = document.querySelectorAll('.page');
      const navLinks = document.querySelectorAll('[data-nav]');
      const menuToggle = document.getElementById('menuToggle');
      const mainNav = document.getElementById('mainNav');
      const cardSelectors = '.card, .form-card, .feature-image-card, .article-card, .testimonial-card-box, .map-card-container, .iso-svg-card, .summary-card, .intra-quick-card, .intra-box, .intra-profile-widget, .intra-banner-mueve, .soy-login-box';

      // CONTROL DEL BOTÓN DE SONIDO DEL VIDEO HERO
      const heroVideo = document.querySelector('.hero-video-bg');
      const soundBtn = document.getElementById('soundToggleBtn');
      const soundIcon = document.getElementById('soundIcon');
      const soundText = document.getElementById('soundText');

      if (heroVideo && soundBtn) {
        soundBtn.addEventListener('click', function(e) {
          e.preventDefault();
          heroVideo.muted = !heroVideo.muted;
          if (heroVideo.muted) {
            soundIcon.textContent = '🔇';
            soundText.textContent = 'Activar sonido';
          } else {
            soundIcon.textContent = '🔊';
            soundText.textContent = 'Silenciar';
          }
        });
      }

      // INTERSECTION OBSERVER
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1
      };

      const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      }, observerOptions);

      function initPageCards(scope) {
        if (!scope) return;
        const cards = scope.querySelectorAll(cardSelectors);
        cards.forEach((card) => {
          card.classList.add('scroll-reveal');
          card.classList.remove('visible');
          revealObserver.unobserve(card);
          revealObserver.observe(card);
        });
      }

      pages.forEach(p => initPageCards(p));

      function triggerActivePageReveal() {
        const activePage = document.querySelector('.page.active');
        if (!activePage) return;
        initPageCards(activePage);
      }

      setTimeout(triggerActivePageReveal, 100);

      // LÓGICA SPA Y GESTIÓN DE PIES DE PÁGINA
      function navigateTo(pageId) {
        pages.forEach(page => {
          page.classList.remove('active');
          if (page.id === pageId) {
            page.classList.add('active');
          }
        });

        navLinks.forEach(link => {
          if (link.dataset.nav === pageId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        if (pageId === 'inicio') {
          document.body.classList.add('home-active');
          document.body.classList.remove('internal-page');
        } else {
          document.body.classList.remove('home-active');
          document.body.classList.add('internal-page');
        }

        window.scrollTo({ top: 0, behavior: 'instant' });
        if (mainNav) mainNav.classList.remove('mobile-active');

        const activePage = document.getElementById(pageId);
        if (activePage) {
          setTimeout(() => {
            initPageCards(activePage);
          }, 60);
        }
        
        if (pageId === 'nosotros') {
          setTimeout(() => {
            initLeafletMap();
          }, 150);
        }

        if (pageId === 'nosotros' && typeof map !== 'undefined' && map) {
          setTimeout(() => { map.invalidateSize(); }, 200);
        }
      }

      navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          const targetPage = this.dataset.nav;
          if (targetPage) {
            navigateTo(targetPage);
          }
        });
      });

      // MODALES GENÉRICOS
      function setupModalTriggers(btnSelectors, modalId, closeBtnId) {
        const modal = document.getElementById(modalId);
        const closeBtn = document.getElementById(closeBtnId);
        const btns = document.querySelectorAll(btnSelectors);

        btns.forEach(btn => {
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            if (modal) modal.classList.add('active');
          });
        });

        if (closeBtn && modal) {
          closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
          });
        }

        if (modal) {
          modal.addEventListener('click', function(e) {
            if (e.target === modal) {
              modal.classList.remove('active');
            }
          });
        }
      }

      setupModalTriggers('#btnOpenPrivacyModal, #btnOpenPrivacyModalSmall, #btnOpenPrivacyModalFromForm, #btnOpenPrivacyModalFromContact', 'privacyModal', 'btnClosePrivacyModal');
      setupModalTriggers('#btnOpenCvModal, #btnOpenCvModalSmall', 'cvModal', 'btnCloseCvModal');

      // MODALES DE ARTÍCULOS
      const articleCards = document.querySelectorAll('.article-card');
      articleCards.forEach(card => {
        const articleNum = card.getAttribute('data-article');
        const modalId = 'articleModal' + articleNum;
        const closeBtnId = 'btnCloseArticleModal' + articleNum;

        card.addEventListener('click', function(e) {
          e.preventDefault();
          const targetModal = document.getElementById(modalId);
          if (targetModal) targetModal.classList.add('active');
        });

        const closeBtn = document.getElementById(closeBtnId);
        if (closeBtn) {
          closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const targetModal = document.getElementById(modalId);
            if (targetModal) targetModal.classList.remove('active');
          });
        }
      });

      // ==========================================
      // MANEJO DE FORMULARIOS MEDIANTE MAILTO
      // ==========================================

      // 1. Formulario de Cotización Principal (Inicio) -> coordinacion.contratacion@sismedica.co
      const heroQuoteForm = document.getElementById('heroQuoteForm');
      if (heroQuoteForm) {
        heroQuoteForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const correoDestino = "coordinacion.contratos@sismedica.co";
          
          const campos = heroQuoteForm.querySelectorAll('input, select, textarea');
          let detalleInfo = "";
          campos.forEach(campo => {
            if (campo.type !== 'submit' && campo.type !== 'checkbox' && campo.value) {
              const labelNode = campo.closest('.form-group')?.querySelector('label');
              const label = labelNode ? labelNode.innerText : (campo.placeholder || 'Campo');
              detalleInfo += `- ${label}: ${campo.value}\n`;
            }
          });

          const asunto = encodeURIComponent("Nueva Cotización de Servicio Médico - Sismedica");
          const cuerpo = encodeURIComponent(
            `Hola,\n\nQuisiera solicitar una cotización con la siguiente información:\n\n${detalleInfo}\nQuedo atento(a) a su respuesta.`
          );

          window.location.href = `mailto:${correoDestino}?subject=${asunto}&body=${cuerpo}`;
        });
      }

      // 2. Formulario de Contacto Directo -> coordinacion.contratacion@sismedica.co
      const pageContactForm = document.getElementById('pageContactForm');
      if (pageContactForm) {
        pageContactForm.addEventListener('submit', function(e) {
          e.preventDefault();
          const correoDestino = "coordinacion.contratos@sismedica.co";
          
          const campos = pageContactForm.querySelectorAll('input, select, textarea');
          let detalleInfo = "";
          campos.forEach(campo => {
            if (campo.type !== 'submit' && campo.type !== 'checkbox' && campo.value) {
              const labelNode = campo.closest('.form-group')?.querySelector('label');
              const label = labelNode ? labelNode.innerText : (campo.placeholder || 'Campo');
              detalleInfo += `- ${label}: ${campo.value}\n`;
            }
          });

          const asunto = encodeURIComponent("Formulario de Contacto Directo - Sismedica");
          const cuerpo = encodeURIComponent(
            `Hola,\n\nMe pongo en contacto con ustedes con los siguientes datos:\n\n${detalleInfo}\nQuedo atento(a).`
          );

          window.location.href = `mailto:${correoDestino}?subject=${asunto}&body=${cuerpo}`;
        });
      }

      // 3. Formulario de Hoja de Vida (Modal) -> Envío múltiple a 3 correos de selección
      const cvModalForm = document.getElementById('cvModalForm');
      if (cvModalForm) {
        cvModalForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const correosSeleccion = "seleccion@sismedica.co";
          const asunto = encodeURIComponent("Postulación Hoja de Vida - Sismedica");
          const cuerpo = encodeURIComponent(
            `Hola equipo de selección,\n\n` +
            `Les escribo para postular mi hoja de vida a las oportunidades laborales de Sismedica.\n\n` +
            `Quedo atento(a) a sus comentarios.\n\n` +
            `*(Nota: Recuerda adjuntar tu archivo de hoja de vida en este correo antes de enviarlo).*`
          );

          window.location.href = `mailto:${correosSeleccion}?subject=${asunto}&body=${cuerpo}`;
          
          setTimeout(() => { 
            cvModalForm.reset(); 
            const modalCv = document.getElementById('cvModal');
            if (modalCv) modalCv.classList.remove('active'); 
          }, 1000);
        });
      }
      
      // 4. Formulario de Datos de Facturación o Servicio -> analista.marketing@sismedica.co[cite: 1, 4]
      // 4. Formulario de Datos de Facturación o Servicio -> analista.marketing@sismedica.co
      const btnEnviarInfo = document.getElementById('btnEnviarInfo');
      if (btnEnviarInfo) {
        btnEnviarInfo.addEventListener('click', function(e) {
          e.preventDefault();
          const correoDestino = "analista.marketing@sismedica.co";
          
          // Buscamos el formulario contenedor para extraer los campos de forma dinámica igual que los otros formularios
          const formContainer = btnEnviarInfo.closest('form');
          const campos = formContainer ? formContainer.querySelectorAll('input, select, textarea') : [];
          
          let detalleInfo = "";
          campos.forEach(campo => {
            if (campo.type !== 'submit' && campo.type !== 'button' && campo.type !== 'checkbox' && campo.value) {
              const labelNode = campo.closest('.form-group')?.querySelector('label');
              const label = labelNode ? labelNode.innerText : (campo.placeholder || 'Campo');
              detalleInfo += `- ${label}: ${campo.value}\n`;
            }
          });

          if (!detalleInfo.trim()) {
            alert('Por favor, completa los campos requeridos antes de enviar la información.');
            return;
          }

          const asunto = encodeURIComponent("Información de Facturación o Servicio - Sismedica");
          const cuerpo = encodeURIComponent(
            `Hola,\n\nComparto la información de facturación o servicio registrada:\n\n${detalleInfo}\nQuedo atento(a).`
          );

          window.location.href = `mailto:${correoDestino}?subject=${asunto}&body=${cuerpo}`;
        });
      }
      // FAQS BUSCADOR Y ACORDEON
      const faqQuestions = document.querySelectorAll('.faq-question');
      faqQuestions.forEach(q => {
        q.addEventListener('click', function() {
          const item = this.parentElement;
          const isActive = item.classList.contains('active');
          const parentList = item.parentElement;
          if (parentList) {
            parentList.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
          }
          if (!isActive) {
            item.classList.add('active');
          }
        });
      });

      const faqSearchInput = document.getElementById('faqSearchInput');
      if (faqSearchInput) {
        faqSearchInput.addEventListener('input', function() {
          const query = this.value.toLowerCase().trim();
          document.querySelectorAll('#faqAccordionList .faq-item').forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(query)) {
              item.style.display = 'block';
            } else {
              item.style.display = 'none';
            }
          });
        });
      }

      // PASARELA DE PAGO
      const paymentCards = document.querySelectorAll('.payment-method-card');
      const methodFieldsPSE = document.getElementById('methodFieldsPSE');
      const methodFieldsNequi = document.getElementById('methodFieldsNequi');
      const methodFieldsCard = document.getElementById('methodFieldsCard');
      const methodFieldsEfectivo = document.getElementById('methodFieldsEfectivo');
      
      paymentCards.forEach(card => {
        card.addEventListener('click', function() {
          paymentCards.forEach(c => c.classList.remove('active'));
          this.classList.add('active');

          const method = this.getAttribute('data-method');
          
          if(methodFieldsPSE) methodFieldsPSE.style.display = 'none';
          if(methodFieldsNequi) methodFieldsNequi.style.display = 'none';
          if(methodFieldsCard) methodFieldsCard.style.display = 'none';
          if(methodFieldsEfectivo) methodFieldsEfectivo.style.display = 'none';

          if (method === 'pse') methodFieldsPSE.style.display = 'block';
          else if (method === 'nequi') methodFieldsNequi.style.display = 'block';
          else if (method === 'card') methodFieldsCard.style.display = 'block';
          else if (method === 'efectivo') methodFieldsEfectivo.style.display = 'block';
        });
      });

      const valorPagarInput = document.getElementById('valorPagarInput');
      const summarySubtotal = document.getElementById('summarySubtotal');
      const summaryTotal = document.getElementById('summaryTotal');

      if (valorPagarInput) {
        valorPagarInput.addEventListener('input', function() {
          let val = this.value;
          if (!val.includes('COP')) {
            summarySubtotal.textContent = val + ' COP';
            summaryTotal.textContent = val + ' COP';
          } else {
            summarySubtotal.textContent = val;
            summaryTotal.textContent = val;
          }
        });
      }

      const btnGoCobertura = document.getElementById('btnGoCobertura');
      if (btnGoCobertura) {
        btnGoCobertura.addEventListener('click', function(e) {
          e.preventDefault();
          navigateTo('nosotros');
          setTimeout(() => {
            const el = document.getElementById('seccion-cobertura');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 200);
        });
      }

      if (menuToggle) {
        menuToggle.addEventListener('click', function() {
          mainNav.classList.toggle('mobile-active');
        });
      }

      // CARRUSEL
      let currentTestimonialSlide = 0;
      const testimonialTrack = document.getElementById('testimonialTrack');
      const testimonialSlides = document.querySelectorAll('.testimonial-slide');
      const testimonialDots = document.querySelectorAll('.carousel-dot');
      const totalTestimonials = testimonialSlides.length;
      let testimonialAutoPlayTimer = null;

      function updateTestimonialCarousel(index) {
        if (!testimonialTrack) return;
        currentTestimonialSlide = (index + totalTestimonials) % totalTestimonials;
        testimonialTrack.style.transform = `translateX(-${currentTestimonialSlide * 100}%)`;
        
        testimonialDots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentTestimonialSlide);
        });
      }

      function startTestimonialAutoPlay() {
        stopTestimonialAutoPlay();
        testimonialAutoPlayTimer = setInterval(() => {
          updateTestimonialCarousel(currentTestimonialSlide + 1);
        }, 7000);
      }

      function stopTestimonialAutoPlay() {
        if (testimonialAutoPlayTimer) {
          clearInterval(testimonialAutoPlayTimer);
        }
      }

      const prevBtn = document.getElementById('prevTestimonial');
      const nextBtn = document.getElementById('nextTestimonial');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          updateTestimonialCarousel(currentTestimonialSlide - 1);
          startTestimonialAutoPlay();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          updateTestimonialCarousel(currentTestimonialSlide + 1);
          startTestimonialAutoPlay();
        });
      }

      testimonialDots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          updateTestimonialCarousel(i);
          startTestimonialAutoPlay();
        });
      });

      const carouselContainer = document.querySelector('.testimonial-carousel-container');
      if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopTestimonialAutoPlay);
        carouselContainer.addEventListener('mouseleave', startTestimonialAutoPlay);
      }
      startTestimonialAutoPlay();

      // ACORDEÓN NOSOTROS
      const accordionHeaders = document.querySelectorAll('.accordion-header');
      accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
          const item = this.parentElement;
          const isActive = item.classList.contains('active');

          document.querySelectorAll('.accordion-item').forEach(i => {
            i.classList.remove('active');
            const iconBox = i.querySelector('.accordion-icon-box');
            if (iconBox) iconBox.innerHTML = '&plus;';
          });

          if (!isActive) {
            item.classList.add('active');
            const iconBox = item.querySelector('.accordion-icon-box');
            if (iconBox) iconBox.innerHTML = '&minus;';
          }
        });
      });

      const deptBadges = document.querySelectorAll('.dept-badge');
      deptBadges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
          const deptName = this.getAttribute('data-dept');
          if (markersObj[deptName]) {
            markersObj[deptName].setStyle({ fillColor: '#274698', radius: 13 });
            markersObj[deptName].openPopup();
          }
        });
        badge.addEventListener('mouseleave', function() {
          const deptName = this.getAttribute('data-dept');
          if (markersObj[deptName]) {
            markersObj[deptName].setStyle({ fillColor: '#e02029', radius: 9 });
            markersObj[deptName].closePopup();
          }
        });
        badge.addEventListener('click', function() {
          const deptName = this.getAttribute('data-dept');
          const lat = parseFloat(this.getAttribute('data-lat'));
          const lng = parseFloat(this.getAttribute('data-lng'));
          if (map && lat && lng) {
            map.flyTo([lat, lng], 7, { duration: 1.2 });
            if (markersObj[deptName]) markersObj[deptName].openPopup();
          }
        });
      });

    });

    function scrollToForm() {
      const el = document.getElementById('cotizador-home');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // ==========================================
    // MAPA LEAFLET (una sola inicialización, sin API key)
    // ==========================================
    let map = null;
    let markersObj = {};

    function initLeafletMap() {
      const container = document.getElementById('leaf-map-colombia');
      if (!container || typeof L === 'undefined') return;

      // Si ya existe un mapa, solo recalculamos tamaño (el contenedor estaba oculto)
      if (map) {
        map.invalidateSize();
        return;
      }

      map = L.map('leaf-map-colombia', {
        center: [4.5709, -74.2973],
        zoom: 5.4,
        zoomControl: true,
        scrollWheelZoom: false
      });

      // Tiles de OpenStreetMap: no requieren API key
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // Un marcador por cada departamento, tomado de los badges del HTML
      markersObj = {};
      document.querySelectorAll('.dept-badge').forEach(badge => {
        const dept = badge.getAttribute('data-dept');
        const lat = parseFloat(badge.getAttribute('data-lat'));
        const lng = parseFloat(badge.getAttribute('data-lng'));
        if (!dept || isNaN(lat) || isNaN(lng)) return;

        const marker = L.circleMarker([lat, lng], {
          radius: 9,
          fillColor: '#e02029',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map);

        marker.bindPopup(`<strong>Sismedica IPS</strong><br>Cobertura Activa: ${dept}`);
        markersObj[dept] = marker;
      });

      setTimeout(() => { map.invalidateSize(); }, 100);
    }