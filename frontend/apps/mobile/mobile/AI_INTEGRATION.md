# AI Model Integration for Mobile App

## Overview
The mobile app now includes comprehensive AI model support using the same backend APIs as the web application. This includes image detection, text analysis, and severity estimation using YOLO models.

## Features Implemented

### 1. Image Detection
- **Automatic Analysis**: When a user selects an image, AI analysis is triggered automatically
- **YOLO Model Integration**: Uses the backend's YOLO model to detect civic issues in images
- **Confidence Scores**: Shows detection confidence percentages
- **Category Mapping**: Automatically maps detected objects to appropriate issue categories

### 2. Text Analysis
- **Keyword Extraction**: Analyzes description text to extract relevant keywords
- **Category Suggestion**: Suggests appropriate categories based on text content
- **Manual Trigger**: Users can manually trigger text analysis

### 3. Severity Estimation
- **Multi-modal Analysis**: Combines image and text data for severity assessment
- **Score-based Rating**: Provides numerical severity scores
- **Urgency Mapping**: Maps severity scores to urgency levels (High/Medium/Low)

### 4. AI Description Generation
- **Smart Descriptions**: Generates contextual descriptions based on detected issues
- **Combined Analysis**: Uses both image detection and text analysis
- **User-friendly Output**: Creates readable, actionable descriptions

## Technical Implementation

### Files Added/Modified

#### New Files:
- `lib/data/models/ai_detection.dart` - Data models for AI responses
- `lib/core/services/ai_service.dart` - AI service implementation
- `lib/core/utils/image_utils.dart` - Shared utility for image conversion

#### Modified Files:
- `lib/features/issues/presentation/report_issue_screen.dart` - Enhanced UI with AI features
- `lib/features/issues/data/issue_repository.dart` - Updated to use direct data URL upload

### API Integration
The mobile app now uses the following backend endpoints:
- `POST /ai/detect` - Image detection using YOLO
- `POST /ai/analyze-text` - Text analysis and keyword extraction
- `POST /ai/severity` - Severity estimation
- `POST /issues` - Create issues with direct data URL upload (no presigned URLs)

### Image Upload Process
The mobile app now uses the same direct upload approach as the web site:
1. **Convert to Data URL**: Images are converted to base64 data URLs
2. **Direct Upload**: Data URLs are sent directly in the `media_urls` field
3. **No Presigned URLs**: Eliminates the need for presigned URL generation and separate upload steps
4. **Simplified Flow**: Single API call to create issue with embedded image data

### UI Enhancements
- **AI Analysis Section**: Dedicated section showing AI suggestions and results
- **Real-time Feedback**: Loading states and progress indicators
- **Visual Indicators**: Color-coded suggestions and severity levels
- **Multiple Actions**: Separate buttons for different AI functions

## Usage

### For Users:
1. **Take/Select Photo**: Choose an image of the civic issue
2. **Automatic Analysis**: AI automatically analyzes the image
3. **Review Suggestions**: Check AI-suggested category and urgency
4. **Manual Analysis**: Use additional buttons for text analysis or description generation
5. **Submit Report**: Submit with AI-enhanced data

### For Developers:
```dart
// Initialize AI service
final aiService = AIService();

// Detect issues from image
final detection = await aiService.detectFromImage(imageBytes);

// Analyze text
final analysis = await aiService.analyzeText(description);

// Estimate severity
final severity = await aiService.estimateSeverity(
  imageBytes: imageBytes,
  text: description,
);
```

## Error Handling
- Comprehensive error handling for all AI API calls
- User-friendly error messages
- Graceful fallbacks when AI services are unavailable
- Network timeout handling

## Categories Supported
- Pothole
- Streetlight
- Garbage
- Water Leakage
- Traffic Signal
- Drainage
- Road Damage
- Street Sign
- Sidewalk
- Other

## Future Enhancements
- Offline AI capabilities
- Batch processing for multiple images
- Advanced filtering and confidence thresholds
- Integration with additional AI models
- Real-time AI suggestions as user types
