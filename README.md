# Jigsaw Employee Enhancer

A Chrome browser extension that enhances the Jigsaw internal company website by automatically displaying gender pronouns and symbols next to employee names, with the ability to filter employees by gender.

## Features

- **Automatic Detection**: Works on account detail pages (URL pattern: `/accounts/{id}/details`) and consultant profile pages (URL pattern: `/consultants/{id}`)
- **Gender Symbols**: Displays appropriate symbols next to employee names:
  - 🏳️‍🌈 for non-binary/they pronouns
  - 🔵 for male
  - 🔴 for female
- **LinkedIn Integration**: Adds LinkedIn search links next to employee grades on consultant profile pages
- **Gender Filtering**: Filter employees by gender using a dropdown with options:
  - All (default)
  - Male
  - Female
  - Non-binary
  - Unspecified
- **Smart Caching**: Caches employee data to avoid repeated API calls
- **Dynamic Content Support**: Automatically detects new employee elements added to the page
- **Beautiful UI**: Large, prominent symbols with hover effects and color coding

## How It Works

1. **Page Detection**: The extension automatically activates when you visit a Jigsaw account page or consultant profile page
2. **Employee Extraction**: 
   - On account pages: Finds all employee name elements with class `timeline-consultant-name`
   - On consultant profile pages: Finds the grade element with class `gradeName__27b12`
3. **Data Integration**: Retrieves employee information for each employee from the Jigsaw API
4. **Symbol Display**: Analyzes employee data and displays appropriate gender symbols:
   - If `pronouns.english.they` is `true` → 🏳️‍🌈
   - If `preferredGender` is `male` → 🔵
   - If `preferredGender` is `female` → 🔴
5. **LinkedIn Enhancement**: On consultant profile pages, adds a LinkedIn search link next to the employee's grade that searches for the employee on LinkedIn
6. **Gender Filtering**: Adds a filter dropdown to the existing filter container that allows hiding/showing employees based on gender selection

## Installation

### Method 1: Load Unpacked Extension (Recommended for Development)

1. Download or clone this repository to your local machine
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now appear in your extensions list

### Method 2: Packaged Extension

1. Download the `.crx` file (if provided)
2. Drag and drop the `.crx` file onto the `chrome://extensions/` page
3. Click "Add extension" when prompted

## Usage

1. **Install the extension** using one of the methods above
2. **Navigate to a Jigsaw page**:
   - **Account page** (e.g., `https://jigsaw.thoughtworks.net/accounts/38402/details`) - for gender symbols and filtering
   - **Consultant profile page** (e.g., `https://jigsaw.thoughtworks.net/consultants/45482`) - for LinkedIn integration
3. **Wait for the page to load** - the extension will automatically process the page
4. **View the results**:
   - **On account pages**: Gender symbols will appear next to employee names
   - **On consultant profile pages**: LinkedIn search links will appear next to employee grades
5. **Use the gender filter** (on account pages): Locate the "Gender Filter" dropdown in the filter section and select your desired gender filter:
   - **All**: Shows all employees (default)
   - **Male**: Shows only employees identified as male (🔵)
   - **Female**: Shows only employees identified as female (🔴)
   - **Non-binary**: Shows only employees using they/them pronouns (🏳️‍🌈)
   - **Unspecified**: Shows only employees without gender information
6. **LinkedIn Integration**: Click the LinkedIn icon next to an employee's grade to search for them on LinkedIn

## File Structure

```
jigsaw-enhancer/
├── manifest.json      # Extension configuration
├── content.js         # Main logic script
├── README.md          # This file
└── icons/            # Extension icons (optional)
```

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**: 
  - `activeTab`: Access to the current tab
  - `host_permissions`: Access to jigsaw.thoughtworks.net
- **Content Script**: Automatically runs on matching pages:
  - Account pages: `/accounts/*/details*`
  - Consultant profile pages: `/consultants/*`
- **API Integration**: Fetches employee data from Jigsaw's internal API (`/webapi/employees/{id}`)
- **Caching**: In-memory cache to optimize performance
- **DOM Manipulation**: 
  - Adds gender filter dropdown to existing filter container on account pages
  - Enhances grade elements with LinkedIn search links on consultant profile pages
- **Filtering Logic**: Hides/shows timeline rows based on gender selection using CSS classes
- **URL Change Detection**: Monitors for navigation between different consultant profile pages

## Browser Compatibility

- **Chrome**: Full support (tested)
- **Edge**: Should work (Chromium-based)
- **Firefox**: May require manifest v2 conversion

## Troubleshooting

### Extension Not Working

1. **Check the console**: Open Developer Tools (F12) and look for "Jigsaw Enhancer" messages
2. **Verify URL pattern**: Ensure you're on a page matching `/accounts/{id}/details`
3. **Check permissions**: Verify the extension has access to jigsaw.thoughtworks.net
4. **Reload the page**: Sometimes a page refresh is needed after installation

### Gender Filter Not Appearing

1. **Check if filter container exists**: The gender filter is added to the existing filter section
2. **Verify page structure**: Ensure the page has the expected filter container with class `filterContainer__6d09b`
3. **Check console for errors**: Look for "Gender filter added" message in the console

### API Errors

- **Network issues**: Check if you can access the Jigsaw API directly
- **Authentication**: Ensure you're logged into Jigsaw
- **Rate limiting**: The extension includes caching to minimize API calls

### LinkedIn Integration Not Working

1. **Check if you're on a consultant profile page**: Ensure the URL matches `/consultants/{id}` pattern
2. **Verify the grade element exists**: Look for an element with class `gradeName__27b12`
3. **Check console for errors**: Look for "Enhanced grade element with LinkedIn link" message
4. **Employee data not found**: The extension needs to successfully fetch employee data from the API
5. **Page navigation**: If using browser back/forward, the extension should automatically detect the change

## Development

To modify the extension:

1. **Edit the files** in your local copy
2. **Reload the extension** in `chrome://extensions/`
3. **Refresh the Jigsaw page** to see changes

## Security Notes

- This extension only runs on jigsaw.thoughtworks.net
- Employee data is cached locally and not transmitted elsewhere
- No personal data is stored permanently

## Support

For issues or questions, check the browser console for error messages or contact your development team.
