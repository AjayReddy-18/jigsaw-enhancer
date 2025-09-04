# Jigsaw Employee Enhancer

A Chrome browser extension that enhances the Jigsaw internal company website by automatically displaying gender pronouns and symbols next to employee names, with the ability to filter employees by gender.

## Features

### Gender Symbols & Filtering
- **Automatic Gender Detection**: Automatically detects and displays gender symbols next to employee names
- **Gender Symbols**:
  - 🏳️‍🌈 for non-binary/they pronouns
  - 🔵 for male
  - 🔴 for female
- **Gender Filtering**: Filter employees by gender using a dropdown with options:
  - All (default)
  - Male
  - Female
  - Non-binary
  - Unspecified

### LinkedIn Integration
- **LinkedIn Search Links**: Adds LinkedIn search links next to employee grades on consultant profile pages
- **Smart Detection**: Automatically detects and enhances grade elements on profile pages
- **One-Click Search**: Click the LinkedIn icon to search for the employee on LinkedIn

### Smart Features
- **Automatic Activation**: Works automatically on Jigsaw account pages and consultant profile pages
- **Dynamic Content Support**: Automatically detects new employee elements added to the page
- **Performance Optimized**: Includes smart caching to avoid repeated API calls

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

### Getting Started

1. **Install the extension** using one of the methods above
2. **Navigate to a Jigsaw page**:
   - **Account page** (e.g., `https://jigsaw.thoughtworks.net/accounts/38402/details`) - for gender symbols and filtering
   - **Consultant profile page** (e.g., `https://jigsaw.thoughtworks.net/consultants/45482`) - for LinkedIn integration
3. **Wait for the page to load** - the extension will automatically process the page

### Using Gender Symbols

- **On account pages**: Gender symbols will automatically appear next to employee names
- **Symbol meanings**:
  - 🏳️‍🌈 = Uses they/them pronouns (non-binary)
  - 🔵 = Male
  - 🔴 = Female
  - No symbol = Gender information not specified

### Using Gender Filtering

1. **Locate the filter section** on the account page
2. **Find the "Gender Filter" dropdown** - it will be added to the existing filter area
3. **Select your desired filter**:
   - **All**: Shows all employees (default)
   - **Male**: Shows only employees identified as male (🔵)
   - **Female**: Shows only employees identified as female (🔴)
   - **Non-binary**: Shows only employees using they/them pronouns (🏳️‍🌈)
   - **Unspecified**: Shows only employees without gender information
4. **View filtered results** - the page will automatically hide/show employees based on your selection

### Using LinkedIn Integration

1. **Navigate to a consultant profile page** (URL pattern: `/consultants/{id}`)
2. **Look for the LinkedIn icon** next to the employee's grade/title
3. **Click the LinkedIn icon** to open a LinkedIn search for that employee
4. **The search will include** the employee's name and "Thoughtworks" to help find the correct profile

## Supported Pages

### Account Pages
- **URL Pattern**: `/accounts/{id}/details`
- **Features**: Gender symbols, gender filtering
- **Example**: `https://jigsaw.thoughtworks.net/accounts/38402/details`

### Consultant Profile Pages
- **URL Pattern**: `/consultants/{id}`
- **Features**: LinkedIn integration
- **Example**: `https://jigsaw.thoughtworks.net/consultants/45482`

## Browser Compatibility

- **Chrome**: Full support (tested)
- **Edge**: Should work (Chromium-based)
- **Firefox**: May require manifest v2 conversion

## Security Notes

- This extension only runs on jigsaw.thoughtworks.net
- Employee data is cached locally and not transmitted elsewhere
- No personal data is stored permanently

## Support

For issues or questions, check the browser console for error messages or contact your development team.