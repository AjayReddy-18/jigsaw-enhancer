const config = {
  baseUrl: 'https://jigsaw.thoughtworks.net',
  api: {
    employees: '/webapi/employees/',
  },
  selectors: {
    timelineConsultantName: '.timeline-consultant-name',
    gradeName: ['.gradeName__27b12', '.gradeName__1c88c'],
    filterContainer: '.filterContainer__6d09b',
    viewButton: '.viewButton__7205e',
    timelineRow: '.timeline-row',
    hiddenByGenderFilter: 'hidden-by-gender-filter',
    genderFilterContainer: 'gender-filter-container',
    genderFilterSelect: 'gender-filter-select',
    genderFilterLabel: 'gender-filter-label',
    genderFilter: 'gender-filter',
  },
  css: `
    .timeline-consultant-name {
      white-space: nowrap;
      overflow: visible;
      display: inline-block;
      max-width: none;
    }
    .gradeName__27b12, .gradeName__1c88c {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .gradeName__27b12 a, .gradeName__1c88c a {
      text-decoration: none;
      transition: opacity 0.2s ease;
    }
    .gradeName__27b12 a:hover, .gradeName__1c88c a:hover {
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
  `,
};

class APIManager {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getEmployeeData(employeeId) {
    try {
      const response = await fetch(`${this.baseUrl}${config.api.employees}${employeeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Jigsaw Enhancer: Failed to fetch employee data for ID ${employeeId}:`, error);
      return null;
    }
  }
}

class StateManager {
  constructor() {
    this.employeeCache = new Map();
    this.currentGenderFilter = 'all';
    this.employeeDataMap = new Map();
    this.processedEmployeeProfiles = new Set();
  }

  getEmployeeFromCache(employeeId) {
    return this.employeeCache.get(employeeId);
  }

  setEmployeeInCache(employeeId, data) {
    this.employeeCache.set(employeeId, data);
  }

  clearProcessedEmployeeProfiles() {
    this.processedEmployeeProfiles.clear();
  }

  addProcessedEmployeeProfile(employeeId) {
    this.processedEmployeeProfiles.add(employeeId);
  }

  hasProcessedEmployeeProfile(employeeId) {
    return this.processedEmployeeProfiles.has(employeeId);
  }
}

class DOMManager {
  constructor(config) {
    this.config = config;
  }

  injectStyles() {
    if (document.getElementById('jigsaw-enhancer-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'jigsaw-enhancer-styles';
    style.textContent = this.config.css;
    document.head.appendChild(style);
    console.log('Jigsaw Enhancer: Styles injected');
  }

  addGenderFilter(onChange) {
    if (document.getElementById(this.config.selectors.genderFilter)) {
      return;
    }

    const filterContainer = document.querySelector(this.config.selectors.filterContainer);
    if (!filterContainer) {
      console.log('Jigsaw Enhancer: Filter container not found');
      return;
    }

    const genderFilterDiv = document.createElement('div');
    genderFilterDiv.className = this.config.selectors.genderFilterContainer;
    genderFilterDiv.innerHTML = `
      <span class="${this.config.selectors.genderFilterLabel}">Gender Filter:</span>
      <select class="${this.config.selectors.genderFilterSelect}" id="${this.config.selectors.genderFilter}">
        <option value="all">All</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="non-binary">Non-binary</option>
        <option value="unspecified">Unspecified</option>
      </select>
    `;

    const viewButton = filterContainer.querySelector(this.config.selectors.viewButton);
    if (viewButton) {
      viewButton.parentNode.insertBefore(genderFilterDiv, viewButton);
    } else {
      filterContainer.appendChild(genderFilterDiv);
    }

    const genderSelect = document.getElementById(this.config.selectors.genderFilter);
    genderSelect.addEventListener('change', onChange);

    console.log('Jigsaw Enhancer: Gender filter added');
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
}

class JigsawEnhancer {
  constructor(config) {
    this.config = config;
    this.apiManager = new APIManager(config.baseUrl);
    this.stateManager = new StateManager();
    this.domManager = new DOMManager(config);
    this.init();
  }

  init() {
    this.domManager.injectStyles();
    
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

  processPage() {
    console.log('Jigsaw Enhancer: Processing page...');
    
    this.stateManager.clearProcessedEmployeeProfiles();
    
    this.domManager.addGenderFilter((e) => {
      this.stateManager.currentGenderFilter = e.target.value;
      this.applyGenderFilter();
    });
    
    const employeeElements = document.querySelectorAll(this.config.selectors.timelineConsultantName);
    
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

    if (this.stateManager.hasProcessedEmployeeProfile(employeeId)) {
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
      this.stateManager.addProcessedEmployeeProfile(employeeId);
      return;
    }

    this.stateManager.addProcessedEmployeeProfile(employeeId);
    console.log(`Jigsaw Enhancer: Marked employee ${employeeId} as processed`);

    this.getEmployeeData(employeeId).then(employeeData => {
      if (employeeData && employeeData.name) {
        this.domManager.enhanceGradeElementWithLinkedIn(gradeElement, employeeData.name);
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
    for (const selector of this.config.selectors.gradeName) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`Jigsaw Enhancer: Found grade element with selector: ${selector}`);
        return element;
      }
    }

    console.log('Jigsaw Enhancer: No grade element found with known class name patterns');
    return null;
  }

  applyGenderFilter() {
    console.log(`Jigsaw Enhancer: Applying gender filter: ${this.stateManager.currentGenderFilter}`);
    
    const timelineRows = document.querySelectorAll(this.config.selectors.timelineRow);
    
    timelineRows.forEach(row => {
      const employeeElement = row.querySelector(this.config.selectors.timelineConsultantName);
      if (!employeeElement) return;

      const employeeId = this.getEmployeeIdFromElement(employeeElement);
      if (!employeeId) return;

      const employeeData = this.stateManager.employeeDataMap.get(employeeId);
      if (!employeeData) return;

      const shouldShow = this.shouldShowEmployee(employeeData);
      
      if (shouldShow) {
        row.classList.remove(this.config.selectors.hiddenByGenderFilter);
      } else {
        row.classList.add(this.config.selectors.hiddenByGenderFilter);
      }
    });

    console.log(`Jigsaw Enhancer: Gender filter applied - ${this.stateManager.currentGenderFilter}`);
  }

  shouldShowEmployee(employeeData) {
    if (this.stateManager.currentGenderFilter === 'all') {
      return true;
    }

    try {
      if (employeeData.pronouns && 
          employeeData.pronouns.english && 
          employeeData.pronouns.english.they === true) {
        return this.stateManager.currentGenderFilter === 'non-binary';
      }

      const preferredGender = employeeData.preferredGender?.toLowerCase();
      if (preferredGender) {
        if (new Set(['man', 'male']).has(preferredGender)) {
          return this.stateManager.currentGenderFilter === 'male';
        } else if (new Set(['woman', 'female']).has(preferredGender)) {
          return this.stateManager.currentGenderFilter === 'female';
        }
      }

      return this.stateManager.currentGenderFilter === 'unspecified';
    } catch (error) {
      console.error('Jigsaw Enhancer: Error checking employee gender filter:', error);
      return this.stateManager.currentGenderFilter === 'unspecified';
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
        this.stateManager.employeeDataMap.set(employeeId, employeeData);
        
        this.domManager.addGenderSymbol(element, employeeData);
        
        if (this.stateManager.currentGenderFilter !== 'all') {
          this.applyGenderFilter();
        }
      }
    }).catch(error => {
      console.error(`Jigsaw Enhancer: Error processing employee ${employeeId}:`, error);
    });
  }

  async getEmployeeData(employeeId) {
    let employeeData = this.stateManager.getEmployeeFromCache(employeeId);
    if (employeeData) {
      return employeeData;
    }

    employeeData = await this.apiManager.getEmployeeData(employeeId);
    if (employeeData) {
      this.stateManager.setEmployeeInCache(employeeId, employeeData);
    }

    return employeeData;
  }

  observePageChanges() {
    const observer = new MutationObserver((mutations) => {
      let shouldReprocess = false;
      let shouldReprocessProfile = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.classList && node.classList.contains(this.config.selectors.timelineConsultantName)) {
                shouldReprocess = true;
              } else if (node.querySelector && node.querySelector(this.config.selectors.timelineConsultantName)) {
                shouldReprocess = true;
              }
              
              if (window.location.pathname.match(/\/consultants\/(\d+)/)) {
                if (node.classList && (this.config.selectors.gradeName.some(selector => node.classList.contains(selector.substring(1))))) {
                  shouldReprocessProfile = true;
                } else if (node.querySelector && (this.config.selectors.gradeName.some(selector => node.querySelector(selector)))) {
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
          this.stateManager.clearProcessedEmployeeProfiles();
          setTimeout(() => this.processEmployeeProfilePage(), 100);
        }
      } else {
        currentEmployeeId = null;
        this.stateManager.clearProcessedEmployeeProfiles();
      }
    };

    updateEmployeeId();

    window.addEventListener('popstate', updateEmployeeId);
    window.addEventListener('hashchange', updateEmployeeId);
  }
}

const jigsawEnhancer = new JigsawEnhancer(config);

window.debugJigsawLinkedIn = () => jigsawEnhancer.debugLinkedInEnhancement();
