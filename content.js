// Jigsaw Employee Enhancer
// This script enhances employee pages with gender pronouns and symbols

class JigsawEnhancer {
  constructor() {
    this.baseUrl = 'https://jigsaw.thoughtworks.net';
    this.employeeCache = new Map(); // Cache employee data to avoid repeated API calls
    this.currentGenderFilter = 'all'; // Track current gender filter
    this.employeeDataMap = new Map(); // Map of employee elements to their data
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
      
      /* Gender filter dropdown styles */
      .gender-filter-container {
        display: inline-block;
        margin-right: 15px;
        vertical-align: middle;
      }
      
      .gender-filter-select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background-color: white;
        font-size: 14px;
        color: #333;
        cursor: pointer;
        min-width: 120px;
      }
      
      .gender-filter-select:focus {
        outline: none;
        border-color: #972e8e;
        box-shadow: 0 0 0 2px rgba(151, 46, 142, 0.2);
      }
      
      .gender-filter-label {
        display: block;
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
        font-weight: 500;
      }
      
      /* Hidden employee rows */
      .timeline-row.hidden-by-gender-filter {
        display: none;
      }
    `;
    
    document.head.appendChild(style);
    console.log('Jigsaw Enhancer: Styles injected');
  }

  processPage() {
    console.log('Jigsaw Enhancer: Processing page...');
    
    // Add gender filter dropdown
    this.addGenderFilter();
    
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

  addGenderFilter() {
    // Check if gender filter already exists
    if (document.getElementById('gender-filter')) {
      return;
    }

    // Find the filter container
    const filterContainer = document.querySelector('.filterContainer__6d09b');
    if (!filterContainer) {
      console.log('Jigsaw Enhancer: Filter container not found');
      return;
    }

    // Create gender filter dropdown
    const genderFilterDiv = document.createElement('div');
    genderFilterDiv.className = 'gender-filter-container';
    genderFilterDiv.innerHTML = `
      <label class="gender-filter-label">Gender Filter</label>
      <select class="gender-filter-select" id="gender-filter">
        <option value="all">All</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="non-binary">Non-binary</option>
        <option value="unspecified">Unspecified</option>
      </select>
    `;

    // Insert the gender filter before the View button
    const viewButton = filterContainer.querySelector('.viewButton__7205e');
    if (viewButton) {
      viewButton.parentNode.insertBefore(genderFilterDiv, viewButton);
    } else {
      // Fallback: add to the end of the filter container
      filterContainer.appendChild(genderFilterDiv);
    }

    // Add event listener for filter changes
    const genderSelect = document.getElementById('gender-filter');
    genderSelect.addEventListener('change', (e) => {
      this.currentGenderFilter = e.target.value;
      this.applyGenderFilter();
    });

    console.log('Jigsaw Enhancer: Gender filter added');
  }

  applyGenderFilter() {
    console.log(`Jigsaw Enhancer: Applying gender filter: ${this.currentGenderFilter}`);
    
    // Get all timeline rows
    const timelineRows = document.querySelectorAll('.timeline-row');
    
    timelineRows.forEach(row => {
      const employeeElement = row.querySelector('.timeline-consultant-name');
      if (!employeeElement) return;

      const employeeId = this.getEmployeeIdFromElement(employeeElement);
      if (!employeeId) return;

      const employeeData = this.employeeDataMap.get(employeeId);
      if (!employeeData) return;

      const shouldShow = this.shouldShowEmployee(employeeData);
      
      if (shouldShow) {
        row.classList.remove('hidden-by-gender-filter');
      } else {
        row.classList.add('hidden-by-gender-filter');
      }
    });

    console.log(`Jigsaw Enhancer: Gender filter applied - ${this.currentGenderFilter}`);
  }

  shouldShowEmployee(employeeData) {
    if (this.currentGenderFilter === 'all') {
      return true;
    }

    try {
      // Check if "they" is true in pronouns > english (non-binary)
      if (employeeData.pronouns && 
          employeeData.pronouns.english && 
          employeeData.pronouns.english.they === true) {
        return this.currentGenderFilter === 'non-binary';
      }

      // Use preferredGender if available
      const preferredGender = employeeData.preferredGender?.toLowerCase();
      if (preferredGender) {
        if (new Set(['man', 'male']).has(preferredGender)) {
          return this.currentGenderFilter === 'male';
        } else if (new Set(['woman', 'female']).has(preferredGender)) {
          return this.currentGenderFilter === 'female';
        }
      }

      // If no gender information, show for unspecified
      return this.currentGenderFilter === 'unspecified';
    } catch (error) {
      console.error('Jigsaw Enhancer: Error checking employee gender filter:', error);
      return this.currentGenderFilter === 'unspecified';
    }
  }

  getEmployeeIdFromElement(element) {
    const href = element.getAttribute('href');
    if (!href) return null;

    const employeeIdMatch = href.match(/\/consultants\/(\d+)/);
    return employeeIdMatch ? employeeIdMatch[1] : null;
  }

  processEmployeeElement(element) {
    // Check if we've already processed this element
    if (element.dataset.enhanced === 'true') {
      return;
    }

    // Extract employee ID from href
    const employeeId = this.getEmployeeIdFromElement(element);
    if (!employeeId) return;

    console.log(`Jigsaw Enhancer: Processing employee ID: ${employeeId}`);

    // Mark as processed to avoid duplicate processing
    element.dataset.enhanced = 'true';

    // Get employee data and add symbol
    this.getEmployeeData(employeeId).then(employeeData => {
      if (employeeData) {
        // Store employee data for filtering
        this.employeeDataMap.set(employeeId, employeeData);
        
        this.addGenderSymbol(element, employeeData);
        
        // Apply current filter after adding symbol
        if (this.currentGenderFilter !== 'all') {
          this.applyGenderFilter();
        }
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
