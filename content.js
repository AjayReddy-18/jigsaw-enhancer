class JigsawEnhancer {
  constructor() {
    this.baseUrl = 'https://jigsaw.thoughtworks.net';
    this.employeeCache = new Map();
    this.currentGenderFilter = 'all';
    this.employeeDataMap = new Map();
    this.processedEmployeeProfiles = new Set();
    this.init();
  }

  init() {
    this.injectStyles();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.processPage();
        this.processEmployeeProfilePage();
      });
    } else {
      this.processPage();
      this.processEmployeeProfilePage();
    }

    this.observePageChanges();
    this.observeUrlChanges();
  }

  injectStyles() {
    if (document.getElementById('jigsaw-enhancer-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'jigsaw-enhancer-styles';
    style.textContent = `
      .timeline-consultant-name {
        white-space: nowrap;
        overflow: visible;
        display: inline-block;
        max-width: none;
      }
      
      .gradeName__27b12,
      .gradeName__1c88c {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .gradeName__27b12 a,
      .gradeName__1c88c a {
        text-decoration: none;
        transition: opacity 0.2s ease;
      }
      
      .gradeName__27b12 a:hover,
      .gradeName__1c88c a:hover {
        opacity: 0.8;
      }
      
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
      
      .timeline-row.hidden-by-gender-filter {
        display: none;
      }
    `;
    
    document.head.appendChild(style);
    console.log('Jigsaw Enhancer: Styles injected');
  }

  processPage() {
    console.log('Jigsaw Enhancer: Processing page...');
    
    this.processedEmployeeProfiles.clear();
    
    this.addGenderFilter();
    
    const employeeElements = document.querySelectorAll('.timeline-consultant-name');
    
    if (employeeElements.length === 0) {
      console.log('Jigsaw Enhancer: No employee elements found');
      return;
    }

    console.log(`Jigsaw Enhancer: Found ${employeeElements.length} employee elements`);
    
    employeeElements.forEach(element => {
      this.processEmployeeElement(element);
    });
  }

  processEmployeeProfilePage() {
    const pathMatch = window.location.pathname.match(/\/consultants\/(\d+)/);
    if (!pathMatch) {
      console.log('Jigsaw Enhancer: Not on an employee profile page');
      return;
    }

    const employeeId = pathMatch[1];
    console.log(`Jigsaw Enhancer: Processing employee profile page for ID: ${employeeId}`);

    if (this.processedEmployeeProfiles.has(employeeId)) {
      console.log(`Jigsaw Enhancer: Profile for employee ${employeeId} already processed, skipping.`);
      return;
    }

    const gradeElement = this.findGradeElement();
    if (!gradeElement) {
      console.log('Jigsaw Enhancer: Grade element not found, waiting for DOM to load...');
      setTimeout(() => this.processEmployeeProfilePage(), 500);
      return;
    }

    if (gradeElement.dataset.linkedinEnhanced === 'true') {
      console.log('Jigsaw Enhancer: Grade element already enhanced');
      this.processedEmployeeProfiles.add(employeeId);
      return;
    }

    this.processedEmployeeProfiles.add(employeeId);
    console.log(`Jigsaw Enhancer: Marked employee ${employeeId} as processed`);

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

  findGradeElement() {
    const possibleClassNames = [
      '.gradeName__27b12',
      '.gradeName__1c88c'
    ];

    for (const selector of possibleClassNames) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`Jigsaw Enhancer: Found grade element with selector: ${selector}`);
        return element;
      }
    }

    console.log('Jigsaw Enhancer: No grade element found with known class name patterns');
    return null;
  }

  enhanceGradeElementWithLinkedIn(gradeElement, employeeName) {
    if (gradeElement.querySelector('a[href*="linkedin.com"]')) {
      console.log('Jigsaw Enhancer: LinkedIn link already exists, skipping enhancement');
      return;
    }

    const linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(employeeName + ' Thoughtworks')}`;
    
    const linkedinLink = document.createElement('a');
    linkedinLink.href = linkedinSearchUrl;
    linkedinLink.target = '_blank';
    linkedinLink.rel = 'noopener noreferrer';
    linkedinLink.title = `Search for ${employeeName} on LinkedIn`;
    
    const linkedinIcon = document.createElement('img');
    linkedinIcon.src = 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png';
    linkedinIcon.alt = 'LinkedIn';
    linkedinIcon.style.cssText = 'width:16px; height:16px; vertical-align:middle;';
    
    linkedinLink.appendChild(linkedinIcon);
    
    gradeElement.appendChild(linkedinLink);
    
    console.log(`Jigsaw Enhancer: Successfully added LinkedIn link for ${employeeName}`);
  }

  debugLinkedInEnhancement() {
    console.log('Jigsaw Enhancer: Debug Information');
    console.log('Current URL:', window.location.pathname);
    console.log('Processed profiles:', Array.from(this.processedEmployeeProfiles));
    
    const gradeElements27b12 = document.querySelectorAll('.gradeName__27b12');
    const gradeElements1c88c = document.querySelectorAll('.gradeName__1c88c');
    
    console.log('Grade elements found:');
    console.log('  - .gradeName__27b12:', gradeElements27b12.length);
    console.log('  - .gradeName__1c88c:', gradeElements1c88c.length);
    
    const enhancedElements27b12 = document.querySelectorAll('.gradeName__27b12[data-linkedin-enhanced="true"]');
    const enhancedElements1c88c = document.querySelectorAll('.gradeName__1c88c[data-linkedin-enhanced="true"]');
    
    console.log('Enhanced grade elements:');
    console.log('  - .gradeName__27b12:', enhancedElements27b12.length);
    console.log('  - .gradeName__1c88c:', enhancedElements1c88c.length);
    
    console.log('LinkedIn links found:', document.querySelectorAll('a[href*="linkedin.com"]').length);
    
    const allGradeElements = document.querySelectorAll('[class*="gradeName"]');
    if (allGradeElements.length > 0) {
      console.log('Actual grade element class names found:');
      allGradeElements.forEach((el, index) => {
        console.log(`  ${index + 1}:`, el.className);
      });
    }
  }

  addGenderFilter() {
    if (document.getElementById('gender-filter')) {
      return;
    }

    const filterContainer = document.querySelector('.filterContainer__6d09b');
    if (!filterContainer) {
      console.log('Jigsaw Enhancer: Filter container not found');
      return;
    }

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

    const viewButton = filterContainer.querySelector('.viewButton__7205e');
    if (viewButton) {
      viewButton.parentNode.insertBefore(genderFilterDiv, viewButton);
    } else {
      filterContainer.appendChild(genderFilterDiv);
    }

    const genderSelect = document.getElementById('gender-filter');
    genderSelect.addEventListener('change', (e) => {
      this.currentGenderFilter = e.target.value;
      this.applyGenderFilter();
    });

    console.log('Jigsaw Enhancer: Gender filter added');
  }

  applyGenderFilter() {
    console.log(`Jigsaw Enhancer: Applying gender filter: ${this.currentGenderFilter}`);
    
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
      if (employeeData.pronouns && 
          employeeData.pronouns.english && 
          employeeData.pronouns.english.they === true) {
        return this.currentGenderFilter === 'non-binary';
      }

      const preferredGender = employeeData.preferredGender?.toLowerCase();
      if (preferredGender) {
        if (new Set(['man', 'male']).has(preferredGender)) {
          return this.currentGenderFilter === 'male';
        } else if (new Set(['woman', 'female']).has(preferredGender)) {
          return this.currentGenderFilter === 'female';
        }
      }

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
    if (element.dataset.enhanced === 'true') {
      return;
    }

    const employeeId = this.getEmployeeIdFromElement(element);
    if (!employeeId) return;

    console.log(`Jigsaw Enhancer: Processing employee ID: ${employeeId}`);

    element.dataset.enhanced = 'true';

    this.getEmployeeData(employeeId).then(employeeData => {
      if (employeeData) {
        this.employeeDataMap.set(employeeId, employeeData);
        
        this.addGenderSymbol(element, employeeData);
        
        if (this.currentGenderFilter !== 'all') {
          this.applyGenderFilter();
        }
      }
    }).catch(error => {
      console.error(`Jigsaw Enhancer: Error processing employee ${employeeId}:`, error);
    });
  }

  async getEmployeeData(employeeId) {
    if (this.employeeCache.has(employeeId)) {
      return this.employeeCache.get(employeeId);
    }

    try {
      const response = await fetch(`${this.baseUrl}/webapi/employees/${employeeId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
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
      if (employeeData.pronouns && 
          employeeData.pronouns.english && 
          employeeData.pronouns.english.they === true) {
        symbol = '🏳️‍🌈';
        symbolClass = 'gender-symbol rainbow';
      } else {
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

      if (symbol) {
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
    const observer = new MutationObserver((mutations) => {
      let shouldReprocess = false;
      let shouldReprocessProfile = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList && node.classList.contains('timeline-consultant-name')) {
                shouldReprocess = true;
              } else if (node.querySelector && node.querySelector('.timeline-consultant-name')) {
                shouldReprocess = true;
              }
              
              if (window.location.pathname.match(/\/consultants\/(\d+)/)) {
                if (node.classList && (node.classList.contains('gradeName__27b12') || 
                                     node.classList.contains('gradeName__1c88c'))) {
                  shouldReprocessProfile = true;
                } else if (node.querySelector && (node.querySelector('.gradeName__27b12') || 
                                                node.querySelector('.gradeName__1c88c'))) {
                  shouldReprocessProfile = true;
                }
              }
            }
          });
        }
      });
      
      if (shouldReprocess) {
        setTimeout(() => this.processPage(), 100);
      }
      
      if (shouldReprocessProfile) {
        setTimeout(() => this.processEmployeeProfilePage(), 100);
      }
    });

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
          this.processedEmployeeProfiles.clear();
          setTimeout(() => this.processEmployeeProfilePage(), 100);
        }
      } else {
        currentEmployeeId = null;
        this.processedEmployeeProfiles.clear();
      }
    };

    updateEmployeeId();

    window.addEventListener('popstate', updateEmployeeId);
    window.addEventListener('hashchange', updateEmployeeId);
  }
}

const jigsawEnhancer = new JigsawEnhancer();

window.debugJigsawLinkedIn = () => jigsawEnhancer.debugLinkedInEnhancement();
