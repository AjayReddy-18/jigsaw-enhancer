# Jigsaw Employee Enhancer

A Chrome browser extension that enhances the Jigsaw internal company website by automatically displaying gender pronouns and symbols next to employee names, with the ability to filter employees by gender.

## Features

- **Automatic Detection**: Works on account detail pages (URL pattern: `/accounts/{id}/details`)
- **Gender Symbols**: Displays appropriate symbols next to employee names:
  - 🏳️‍🌈 for non-binary/they pronouns
  - 🔵 for male
  - 🔴 for female
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

1. **Page Detection**: The extension automatically activates when you visit a Jigsaw account page
2. **Employee Extraction**: Finds all employee name elements with class `timeline-consultant-name`
3. **Data Integration**: Retrieves employee information for each employee
4. **Symbol Display**: Analyzes employee data and displays appropriate gender symbols:
   - If `pronouns.english.they` is `true` → 🏳️‍🌈
   - If `preferredGender` is `male` → 🔵
   - If `preferredGender` is `female` → 🔴
5. **Gender Filtering**: Adds a filter dropdown to the existing filter container that allows hiding/showing employees based on gender selection

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
2. **Navigate to a Jigsaw account page** (e.g., `https://jigsaw.thoughtworks.net/accounts/38402/details`)
3. **Wait for the page to load** - the extension will automatically process employee names
4. **View the results** - gender symbols will appear next to employee names
5. **Use the gender filter** - locate the "Gender Filter" dropdown in the filter section and select your desired gender filter:
   - **All**: Shows all employees (default)
   - **Male**: Shows only employees identified as male (🔵)
   - **Female**: Shows only employees identified as female (🔴)
   - **Non-binary**: Shows only employees using they/them pronouns (🏳️‍🌈)
   - **Unspecified**: Shows only employees without gender information

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
- **Content Script**: Automatically runs on matching pages
- **API Integration**: Fetches employee data from Jigsaw's internal API
- **Caching**: In-memory cache to optimize performance
- **DOM Manipulation**: Adds gender filter dropdown to existing filter container
- **Filtering Logic**: Hides/shows timeline rows based on gender selection using CSS classes

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
