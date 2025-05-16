## [Unreleased]

### Added

- Multi-Step Reasoning / Tool Chaining feature that automatically executes multiple tools in sequence
- New UI component to enable/disable Dynamic Tool Chaining
- Specialized example cards for tool chaining scenarios with distinct color coding
- Wrapper functionality for passing data between tools
- Additional non-web search tool chain examples for financial and health analysis
- Emotional text analysis capability in dynamic tool chains
- Auto-toggle for dynamic chaining when selecting chain examples
- Health interpretation tools for BMI calculation and analysis
- Comprehensive documentation of tool chain examples in README
- Development environment configuration for easier setup

### Changed

- Updated README to describe the new Tool Chaining functionality
- Improved error handling for complex queries
- Optimized tool chain workflow to properly handle intermediate results
- Removed unused example "What are the three laws of robotics?"
- Converted styled-jsx to standard CSS for better compatibility
- Fixed accessibility issues with emoji elements
- Enhanced the formatting of health metric interpretations
- Improved code documentation with JSDoc comments

### Fixed

- React warnings for JSX attributes
- Accessibility warnings for emoji usage
- Unused variable warnings
- Console errors related to styled-jsx
- Type error in BMI calculation tool chaining
- Input handling for object-based parameters in tool execution
- Fixed text comparison functionality to handle object inputs directly
- Fixed BMI calculation in tool chaining when input is provided as an object
- Fixed styling issues in ResponseDisplay component
- Added missing extractBMIParams function definition
- Fixed parameter mapping for calculateSavings in tool chaining
- Improved parameter extraction for various tools to handle AI planner outputs
- Added better error handling for edge cases in tool executions
- Fixed "step output" reference handling in multi-step tool chains
- Enhanced comparison tool to properly format calculation results for better readability
- Added fallback response generation for incomplete tool chain results
- Fixed undefined getPlanForQuery function in dynamicToolChaining module
- Resolved process is not defined error with environment variables

## [1.1.0] - 2024-07-17

### Added

- Initial public release
- Automatic task type recognition
- Tools for calculations, text comparison, and web search
- RapidAPI Google Search integration for web queries
- Specialized UI for different response types
- Explanations for tool selection to provide transparency

### Changed

- Switched web search from simulated answers to real Google Search API

### Fixed

- Fixed CORS issues with web search
- Error handling for failed API calls
