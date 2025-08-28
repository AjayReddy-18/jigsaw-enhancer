// Jigsaw Employee Enhancer
// This script enhances employee pages with gender pronouns and symbols
// 
// Features:
// - Gender symbols and filtering on account pages
// - LinkedIn integration on consultant profile pages (with duplicate prevention)
// - Smart caching and DOM change detection

class JigsawEnhancer {
  constructor() {
    this.baseUrl = 'https://jigsaw.thoughtworks.net';
    this.employeeCache = new Map(); // Cache employee data to avoid repeated API calls
    this.currentGenderFilter = 'all'; // Track current gender filter
    this.employeeDataMap = new Map(); // Map of employee elements to their data
    this.processedEmployeeProfiles = new Set(); // Track which employee profiles have been processed
    this.init();
  }

  init() {
    // Inject CSS styles for better symbol appearance
    this.injectStyles();
    
    // Wait for the page to fully load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.processPage();
        this.processEmployeeProfilePage();
      });
    } else {
      this.processPage();
      this.processEmployeeProfilePage();
    }

    // Also listen for dynamic content changes (in case the page loads content dynamically)
    this.observePageChanges();
    
    // Listen for URL changes (for single-page app navigation)
    this.observeUrlChanges();
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
      
      /* LinkedIn enhancement styles */
      .gradeName__27b12 {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .gradeName__27b12 a {
        text-decoration: none;
        transition: opacity 0.2s ease;
      }
      
      .gradeName__27b12 a:hover {
        opacity: 0.8;
      }
      
      /* Gender filter dropdown styles */
      .gender-filter-container {
        display: inline-flex;
        align-items: center;
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
        height: 36px;
        box-sizing: border-box;
      }
      
      .gender-filter-select:focus {
        outline: none;
        border-color: #972e8e;
        box-shadow: 0 0 0 2px rgba(151, 46, 142, 0.2);
      }
      
      .gender-filter-label {
        display: inline-block;
        font-size: 12px;
        color: #666;
        margin-right: 8px;
        font-weight: 500;
        white-space: nowrap;
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
    
    // Clear processed profiles when processing a new page
    this.processedEmployeeProfiles.clear();
    
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

  processEmployeeProfilePage() {
    // Check if we're on an employee profile page
    const pathMatch = window.location.pathname.match(/\/consultants\/(\d+)/);
    if (!pathMatch) {
      console.log('Jigsaw Enhancer: Not on an employee profile page');
      return;
    }

    const employeeId = pathMatch[1];
    console.log(`Jigsaw Enhancer: Processing employee profile page for ID: ${employeeId}`);

    // Check if we've already processed this profile
    if (this.processedEmployeeProfiles.has(employeeId)) {
      console.log(`Jigsaw Enhancer: Profile for employee ${employeeId} already processed, skipping.`);
      return;
    }

    // Find the grade element
    const gradeElement = document.querySelector('.gradeName__27b12');
    if (!gradeElement) {
      console.log('Jigsaw Enhancer: Grade element not found, waiting for DOM to load...');
      // Try again after a short delay in case the element loads dynamically
      setTimeout(() => this.processEmployeeProfilePage(), 500);
      return;
    }

    // Check if we've already enhanced this element
    if (gradeElement.dataset.linkedinEnhanced === 'true') {
      console.log('Jigsaw Enhancer: Grade element already enhanced');
      // Mark as processed even if already enhanced
      this.processedEmployeeProfiles.add(employeeId);
      return;
    }

    // Mark as processed to prevent duplicate processing
    this.processedEmployeeProfiles.add(employeeId);
    console.log(`Jigsaw Enhancer: Marked employee ${employeeId} as processed`);

    // Get employee data to extract the name
    this.getEmployeeData(employeeId).then(employeeData => {
      if (employeeData && employeeData.name) {
        this.enhanceGradeElementWithLinkedIn(gradeElement, employeeData.name);
        gradeElement.dataset.linkedinEnhanced = 'true';
        console.log(`Jigsaw Enhancer: Enhanced grade element with LinkedIn link for ${employeeData.name}`);
      } else {
        console.log('Jigsaw Enhancer: Employee data or name not found');
      }
    }).catch(error => {
      console.error(`Jigsaw Enhancer: Error enhancing grade element for employee ${employeeId}:`, error);
    });
  }

  enhanceGradeElementWithLinkedIn(gradeElement, employeeName) {
    // Check if LinkedIn link already exists
    if (gradeElement.querySelector('a[href*="linkedin.com"]')) {
      console.log('Jigsaw Enhancer: LinkedIn link already exists, skipping enhancement');
      return;
    }

    // Create LinkedIn search URL with employee name
    const linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(employeeName + ' Thoughtworks')}`;
    
    // Create the LinkedIn link with icon
    const linkedinLink = document.createElement('a');
    linkedinLink.href = linkedinSearchUrl;
    linkedinLink.target = '_blank';
    linkedinLink.rel = 'noopener noreferrer';
    linkedinLink.title = `Search for ${employeeName} on LinkedIn`;
    
    // Create the LinkedIn icon
    const linkedinIcon = document.createElement('img');
    linkedinIcon.src = 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png';
    linkedinIcon.alt = 'LinkedIn';
    linkedinIcon.style.cssText = 'width:16px; height:16px; vertical-align:middle;';
    
    // Append icon to link
    linkedinLink.appendChild(linkedinIcon);
    
    // Append link to grade element
    gradeElement.appendChild(linkedinLink);
    
    console.log(`Jigsaw Enhancer: Successfully added LinkedIn link for ${employeeName}`);
  }

  // Debug method to help troubleshoot issues
  debugLinkedInEnhancement() {
    console.log('Jigsaw Enhancer: Debug Information');
    console.log('Current URL:', window.location.pathname);
    console.log('Processed profiles:', Array.from(this.processedEmployeeProfiles));
    console.log('Grade elements found:', document.querySelectorAll('.gradeName__27b12').length);
    console.log('Enhanced grade elements:', document.querySelectorAll('.gradeName__27b12[data-linkedin-enhanced="true"]').length);
    console.log('LinkedIn links found:', document.querySelectorAll('a[href*="linkedin.com"]').length);
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
      <span class="gender-filter-label">Gender Filter:</span>
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
      let shouldReprocessProfile = false;
      
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
              
              // Check if grade element was added (for profile pages)
              // Only process if we're actually on a consultant profile page
              if (window.location.pathname.match(/\/consultants\/(\d+)/)) {
                if (node.classList && node.classList.contains('gradeName__27b12')) {
                  shouldReprocessProfile = true;
                } else if (node.querySelector && node.querySelector('.gradeName__27b12')) {
                  shouldReprocessProfile = true;
                }
              }
            }
          });
        }
      });
      
      if (shouldReprocess) {
        // Small delay to ensure DOM is stable
        setTimeout(() => this.processPage(), 100);
      }
      
      if (shouldReprocessProfile) {
        // Small delay to ensure DOM is stable
        setTimeout(() => this.processEmployeeProfilePage(), 100);
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  observeUrlChanges() {
    let currentEmployeeId = null;

    const updateEmployeeId = () => {
      const pathMatch = window.location.pathname.match(/\/consultants\/(\d+)/);
      if (pathMatch) {
        const newEmployeeId = pathMatch[1];
        if (newEmployeeId !== currentEmployeeId) {
          currentEmployeeId = newEmployeeId;
          // Clear processed profiles when navigating to a new employee
          this.processedEmployeeProfiles.clear();
          // Small delay to ensure DOM is updated
          setTimeout(() => this.processEmployeeProfilePage(), 100);
        }
      } else {
        // Not on a consultant profile page, clear tracking
        currentEmployeeId = null;
        this.processedEmployeeProfiles.clear();
      }
    };

    updateEmployeeId(); // Initial call

    // Listen for popstate events (for back/forward navigation)
    window.addEventListener('popstate', updateEmployeeId);

    // Listen for hash changes (for single-page app navigation)
    window.addEventListener('hashchange', updateEmployeeId);
  }
}

// Initialize the enhancer when the script loads
const jigsawEnhancer = new JigsawEnhancer();

// Make debug method available globally for troubleshooting
window.debugJigsawLinkedIn = () => jigsawEnhancer.debugLinkedInEnhancement();
