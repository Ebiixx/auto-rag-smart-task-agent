## [Unreleased]

### Added

- Multi-Step Reasoning / Tool Chaining feature that automatically executes multiple tools in sequence
- New UI component to enable/disable Dynamic Tool Chaining
- Specialized example cards for tool chaining scenarios with distinct color coding
- Wrapper functionality for passing data between tools

### Changed

- Updated README to describe the new Tool Chaining functionality
- Improved error handling for complex queries

## [1.0.0] - 2024-05-16

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
