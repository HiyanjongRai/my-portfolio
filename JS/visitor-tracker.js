/**
 * Visitor Tracking Module
 * Tracks page views and requests geolocation permission
 * Sends data to backend for analytics
 */
(function() {
  'use strict';

  const API_BASE = (window.API_BASE || '').replace(/\/+$/, '');
  const DEBUG = true;
  
  function log(...args) {
    if (DEBUG) console.log('[Visitor]', ...args);
  }
  
  function warn(...args) {
    console.warn('[Visitor]', ...args);
  }

  function getOrCreateVisitorId() {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
  }

  function hasAskedLocationToday() {
    const lastAsked = localStorage.getItem('locationAskedDate');
    const today = new Date().toDateString();
    return lastAsked === today;
  }

  function markLocationAsked() {
    localStorage.setItem('locationAskedDate', new Date().toDateString());
  }

  function isSecureContext() {
    return window.isSecureContext || 
           location.protocol === 'https:' || 
           location.hostname === 'localhost' || 
           location.hostname === '127.0.0.1';
  }

  async function getLocationFromIP() {
    try {
      log('Trying IP-based geolocation fallback...');
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/?fields=status,country,regionName,city,lat,lon'
      ];
      
      for (const url of services) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (data.latitude && data.longitude) {
              log('IP geolocation success:', data);
              return {
                latitude: data.latitude,
                longitude: data.longitude,
                city: data.city || '',
                region: data.region || '',
                country: data.country_name || data.country || ''
              };
            }
            if (data.status === 'success' && data.lat && data.lon) {
              log('IP geolocation success:', data);
              return {
                latitude: data.lat,
                longitude: data.lon,
                city: data.city || '',
                region: data.regionName || '',
                country: data.country || ''
              };
            }
          }
        } catch (e) {
          warn('IP service failed:', url);
        }
      }
    } catch (e) {
      warn('All IP geolocation services failed');
    }
    return null;
  }

  async function reverseGeocode(lat, lon) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (response.ok) {
        const data = await response.json();
        return {
          city: data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || '',
          region: data.address?.state || data.address?.region || '',
          country: data.address?.country || ''
        };
      }
    } catch (e) {
      warn('Reverse geocode failed');
    }
    return { city: '', region: '', country: '' };
  }

  async function getBrowserGeolocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          log('Browser geolocation success');
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          let message = 'Unknown error';
          switch (error.code) {
            case error.PERMISSION_DENIED: message = 'Permission denied'; break;
            case error.POSITION_UNAVAILABLE: message = 'Position unavailable'; break;
            case error.TIMEOUT: message = 'Timeout'; break;
          }
          warn('Browser geolocation failed:', message);
          reject(new Error(message));
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
      );
    });
  }

  // Show location dialog - STICKY with navbar
  function showLocationDialog() {
    return new Promise((resolve) => {
      // Try to find the sticky placeholder in header (from index.html)
      let container = document.getElementById('location-dialog-sticky');
      let isHeaderSticky = !!container;
      
      if (!isHeaderSticky) {
        // Fallback for pages without the placeholder
        container = document.createElement('div');
        container.id = 'location-dialog-container';
        container.setAttribute('style', `
          position: fixed !important;
          top: 70px !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 999999 !important;
          display: flex !important;
          justify-content: center !important;
          pointer-events: none;
        `.replace(/\n/g, ''));
        document.body.appendChild(container);
      } else {
        // Prepare header sticky container
        container.hidden = false;
        container.setAttribute('style', `
          display: flex !important;
          justify-content: center !important;
          width: 100% !important;
          padding: 8px 0 12px !important;
          pointer-events: none;
          background: rgba(0, 0, 0, 0.9) !important;
          backdrop-filter: blur(15px) !important;
          -webkit-backdrop-filter: blur(15px) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
        `.replace(/\n/g, ''));
      }
      
      // Create the dialog box inside
      container.innerHTML = `
        <div id="location-dialog" style="pointer-events: auto; position: relative; z-index: 1000000;">
          <div class="location-dialog-box" style="border: none !important; background: transparent !important; box-shadow: none !important;">
            <div class="location-dialog-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="10" r="3"/>
                <path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 12 8 12s8-6.6 8-12a8 8 0 0 0-8-8z"/>
              </svg>
            </div>
            <div class="location-dialog-content">
              <h4>Enable Location</h4>
              <p>Share your location for a better experience</p>
            </div>
            <div class="location-dialog-actions">
              <button class="location-dialog-btn deny">Skip</button>
              <button class="location-dialog-btn allow">Allow</button>
            </div>
          </div>
        </div>
      `;

      // Add BLACK & WHITE styles
      const style = document.createElement('style');
      style.id = 'location-dialog-style';
      style.textContent = `
        #location-dialog {
          animation: slideDownIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes slideDownIn {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeSlideOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(-30px); }
        }
        
        #location-dialog.hiding {
          animation: fadeSlideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .location-dialog-box {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 18px;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
          margin: 0 10px;
        }
        
        .location-dialog-icon {
          width: 38px;
          height: 38px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .location-dialog-icon svg {
          width: 18px;
          height: 18px;
          color: #fff;
        }
        
        .location-dialog-content {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        
        .location-dialog-content h4 {
          margin: 0;
          font-size: 13.5px;
          font-weight: 700;
          color: #fff;
        }
        
        .location-dialog-content p {
          margin: 0;
          font-size: 11.5px;
          color: rgba(255, 255, 255, 0.5);
        }
        
        .location-dialog-actions {
          display: flex;
          gap: 8px;
          margin-left: 12px;
        }
        
        .location-dialog-btn {
          padding: 7px 14px;
          border: none;
          border-radius: 6px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .location-dialog-btn.deny {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.6);
        }
        
        .location-dialog-btn.deny:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #fff;
        }
        
        .location-dialog-btn.allow {
          background: #fff;
          color: #000;
        }
        
        .location-dialog-btn.allow:hover {
          background: #f0f0f0;
        }
        
        @media (max-width: 600px) {
          .location-dialog-box {
            padding: 10px 14px;
            gap: 12px;
          }
          .location-dialog-content h4 { font-size: 12.5px; }
          .location-dialog-content p { font-size: 10.5px; }
        }
      `;
      
      document.head.appendChild(style);
      
      const dialog = container.querySelector('#location-dialog');

      // Function to close dialog
      function closeDialog(allowed) {
        if (dialog) dialog.classList.add('hiding');
        setTimeout(() => {
          if (isHeaderSticky) {
            container.hidden = true;
            container.innerHTML = '';
          } else {
            container.remove();
          }
          style.remove();
          resolve(allowed);
        }, 300);
      }

      // Event handlers
      dialog.querySelector('.location-dialog-btn.allow').addEventListener('click', () => {
        closeDialog(true);
      });

      dialog.querySelector('.location-dialog-btn.deny').addEventListener('click', () => {
        closeDialog(false);
      });
    });
  }

  // Main tracking function
  async function trackVisitor() {
    log('Starting visitor tracking...');
    
    const visitorData = {
      visitorId: getOrCreateVisitorId(),
      referrer: document.referrer || null,
      pageUrl: window.location.href,
      locationGranted: false,
      latitude: null,
      longitude: null,
      city: null,
      country: null,
      region: null
    };

    const shouldAskLocation = !hasAskedLocationToday() && 'geolocation' in navigator;
    
    if (shouldAskLocation) {
      // Wait 2 seconds before showing the dialog
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const userAllowed = await showLocationDialog();
      markLocationAsked();
      log('User clicked Allow:', userAllowed);

      if (userAllowed) {
        let locationObtained = false;
        
        if (isSecureContext()) {
          try {
            const geoData = await getBrowserGeolocation();
            visitorData.latitude = geoData.latitude;
            visitorData.longitude = geoData.longitude;
            visitorData.locationGranted = true;
            locationObtained = true;
            
            const location = await reverseGeocode(geoData.latitude, geoData.longitude);
            visitorData.city = location.city;
            visitorData.country = location.country;
            visitorData.region = location.region;
            log('Location obtained via GPS');
          } catch (e) {
            warn('Browser geolocation failed, trying IP fallback...');
          }
        }

        if (!locationObtained) {
          const ipLocation = await getLocationFromIP();
          if (ipLocation) {
            visitorData.latitude = ipLocation.latitude;
            visitorData.longitude = ipLocation.longitude;
            visitorData.city = ipLocation.city;
            visitorData.country = ipLocation.country;
            visitorData.region = ipLocation.region;
            visitorData.locationGranted = true;
            log('Location obtained via IP');
          }
        }
      }
    }

    // Send tracking data
    try {
      if (!API_BASE) {
        warn('No API_BASE configured');
        return;
      }

      log('Sending tracking data:', visitorData);
      
      const response = await fetch(`${API_BASE}/api/visitors/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitorData),
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        log('Visit tracked:', result);
      }
    } catch (e) {
      warn('Failed to send tracking data:', e);
    }
  }

  // Run tracking when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', trackVisitor);
  } else {
    trackVisitor();
  }

})();
