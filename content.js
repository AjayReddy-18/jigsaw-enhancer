// Jigsaw Employee Enhancer
// This script enhances employee pages with gender pronouns and symbols

class JigsawEnhancer {
  constructor() {
    this.baseUrl = 'https://jigsaw.thoughtworks.net';
    this.employeeCache = new Map(); // Cache employee data to avoid repeated API calls
    this.init();
  }

  init() {
    // Inject CSS styles for better symbol appearance
    this.injectStyles();
    
    // Wait for the page to fully load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.processPage());
    } else {
      this.processPage();
    }

    // Also listen for dynamic content changes (in case the page loads content dynamically)
    this.observePageChanges();
  }

  injectStyles() {
    // Check if styles are already injected
    if (document.getElementById('jigsaw-enhancer-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'jigsaw-enhancer-styles';
    style.textContent = `
      /* Ensure the employee name container can accommodate the symbol */
      .timeline-consultant-name {
        white-space: nowrap;
        overflow: visible;
        display: inline-block;
        max-width: none;
      }
    `;
    
    document.head.appendChild(style);
    console.log('Jigsaw Enhancer: Styles injected');
  }

  processPage() {
    console.log('Jigsaw Enhancer: Processing page...');
    
    // Find all employee name elements
    const employeeElements = document.querySelectorAll('.timeline-consultant-name');
    
    if (employeeElements.length === 0) {
      console.log('Jigsaw Enhancer: No employee elements found');
      return;
    }

    console.log(`Jigsaw Enhancer: Found ${employeeElements.length} employee elements`);
    
    // Process each employee element
    employeeElements.forEach(element => {
      this.processEmployeeElement(element);
    });
  }

  processEmployeeElement(element) {
    // Check if we've already processed this element
    if (element.dataset.enhanced === 'true') {
      return;
    }

    // Extract employee ID from href
    const href = element.getAttribute('href');
    if (!href) return;

    const employeeIdMatch = href.match(/\/consultants\/(\d+)/);
    if (!employeeIdMatch) return;

    const employeeId = employeeIdMatch[1];
    console.log(`Jigsaw Enhancer: Processing employee ID: ${employeeId}`);

    // Mark as processed to avoid duplicate processing
    element.dataset.enhanced = 'true';

    // Get employee data and add symbol
    this.getEmployeeData(employeeId).then(employeeData => {
      if (employeeData) {
        this.addGenderSymbol(element, employeeData);
      }
    }).catch(error => {
      console.error(`Jigsaw Enhancer: Error processing employee ${employeeId}:`, error);
    });
  }

  async getEmployeeData(employeeId) {
    // Check cache first
    if (this.employeeCache.has(employeeId)) {
      return this.employeeCache.get(employeeId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/webapi/employees/${employeeId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the result
      this.employeeCache.set(employeeId, data);
      
      return data;
    } catch (error) {
      console.error(`Jigsaw Enhancer: Failed to fetch employee data for ID ${employeeId}:`, error);
      return null;
    }
  }

  addGenderSymbol(element, employeeData) {
    let symbol = '';
    let symbolClass = '';
    
    try {
      // Check if "they" is true in pronouns > english
      if (employeeData.pronouns && 
          employeeData.pronouns.english && 
          employeeData.pronouns.english.they === true) {
        symbol = '🏳️‍🌈';
        symbolClass = 'gender-symbol rainbow';
      } else {
        // Use preferredGender if available
        const preferredGender = employeeData.preferredGender?.toLowerCase();
        if (preferredGender) {
          console.log(`Jigsaw Enhancer: Preferred gender: ${preferredGender}.`);
          if (new Set(['man', 'male']).has(preferredGender)) {
            symbol = '🔵';
            symbolClass = 'gender-symbol male';
          } else if (new Set(['woman', 'female']).has(preferredGender)) {
            symbol = '🔴';
            symbolClass = 'gender-symbol female';
          }
        }
      }

      // Add the symbol to the element
      if (symbol) {
        // Simply append the symbol directly to the employee name text
        element.textContent = element.textContent + ' ' + symbol;
        
        console.log(`Jigsaw Enhancer: Added symbol ${symbol} for employee`);
      }
    } catch (error) {
      console.error('Jigsaw Enhancer: Error adding gender symbol:', error);
    }
  }

  getSymbolTitle(employeeData) {
    if (employeeData.pronouns && 
        employeeData.pronouns.english && 
        employeeData.pronouns.english.they === true) {
      return 'Uses they/them pronouns';
    } else if (employeeData.preferredGender) {
      const gender = employeeData.preferredGender.toLowerCase();
      if (new Set(['man', 'male']).has(gender)) {
        return 'Male';
      } else if (new Set(['woman', 'female']).has(gender)) {
        return 'Female';
      }
    }
    return '';
  }

  observePageChanges() {
    // Use MutationObserver to watch for dynamic content changes
    const observer = new MutationObserver((mutations) => {
      let shouldReprocess = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check if new employee elements were added
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList && node.classList.contains('timeline-consultant-name')) {
                shouldReprocess = true;
              } else if (node.querySelector && node.querySelector('.timeline-consultant-name')) {
                shouldReprocess = true;
              }
            }
          });
        }
      });
      
      if (shouldReprocess) {
        // Small delay to ensure DOM is stable
        setTimeout(() => this.processPage(), 100);
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

// Initialize the enhancer when the script loads
new JigsawEnhancer();
