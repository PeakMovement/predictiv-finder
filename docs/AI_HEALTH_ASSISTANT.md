# AI Health Assistant - Documentation

## Overview

The AI Health Assistant is a physician recommendation system that helps users find the most suitable physicians based on their health concerns, budget, and location preferences.

## Features

- **Smart Specialty Detection**: Analyzes health issues to automatically identify the appropriate medical specialty
- **Budget-Based Filtering**: Filters physicians based on user's monthly budget constraints  
- **Location Preferences**: Supports location-based filtering with fallback for non-existent locations
- **Experience-Based Ranking**: Ranks physicians by experience within each specialty
- **User Personalization**: Stores user preferences and search history for improved future recommendations

## System Architecture

### Data Source
- **Physician Data**: CSV file (`public/physicians.csv`) containing physician information
- **Columns**: Name, Title (Specialty), Location, Experience (years), Price (monthly fee)
- **Sample Size**: 50 physicians across 6 specialties and 4 locations

### Filtering Logic Sequence

The system applies filters in the following strict order:

1. **Specialty/Title Filtering**
   - Analyzes user's health issue description
   - Maps keywords to medical specialties using predefined mappings
   - Defaults to "General Physician" if no specialty detected
   - Supports multiple specialty detection

2. **Price Filtering**
   - If user budget < minimum price in specialty → returns 3 cheapest physicians
   - Otherwise → keeps only physicians within budget
   - Sorts remaining physicians by price (high to low)

3. **Experience Sorting**
   - Sorts physicians by years of experience (high to low)
   - Maintains price sorting within experience groups

4. **Location Filtering**
   - If requested location exists → filters for exact matches only
   - If location not found → skips filter (keeps current list)
   - Supports case-insensitive matching

5. **Final Selection**
   - Returns top 3 physicians after all filtering steps

### Specialty Mappings

| Specialty | Keywords |
|-----------|----------|
| Dermatologist | skin, acne, rash, eczema, psoriasis, mole, hair loss |
| Cardiologist | heart, chest pain, blood pressure, palpitations, cardiac |
| Neurologist | headache, migraine, seizure, memory, brain, nerve |
| Psychiatrist | depression, anxiety, stress, mental health, mood |
| Orthopedic Surgeon | bone, joint, back pain, knee pain, sports injury |
| General Physician | (default for unrecognized issues) |

## Database Schema

### user_physician_preferences
Stores user's preferred physicians for personalization:
- `user_id`: UUID reference to authenticated user
- `physician_name`: Name of selected physician
- `physician_title`: Medical specialty
- `physician_location`: Physician's location
- `selection_count`: Number of times user selected this physician
- `last_selected_at`: Timestamp of most recent selection

### search_history
Tracks user search queries:
- `user_id`: UUID reference to authenticated user
- `health_issue`: User's health concern description
- `budget`: User's budget constraint (optional)
- `location`: User's location preference (optional)
- `results_count`: Number of physicians returned

## API Interface

### Core Functions

#### `findRecommendedPhysicians(query: HealthQuery)`
Main recommendation function that implements the filtering logic.

**Parameters:**
```typescript
interface HealthQuery {
  issue: string;          // Health concern description
  budget?: number;        // Monthly budget in Rands
  location?: string;      // Preferred location
}
```

**Returns:**
```typescript
interface PhysicianRecommendation {
  Name: string;
  Title: string;
  Location: string;
  Experience: number;
  Price: number;
  affordability: 'Within budget' | 'Above budget';
  matchReason?: string;
}
```

#### Utility Functions
- `loadPhysicianData()`: Loads and parses CSV data
- `getAvailableSpecialties()`: Returns list of all specialties
- `getAvailableLocations()`: Returns list of all locations

### User Preference Functions
- `savePhysicianPreference(physician)`: Saves user's physician selection
- `getUserPhysicianPreferences()`: Retrieves user's preferences
- `saveSearchHistory(query)`: Saves search to history
- `getUserSearchHistory()`: Retrieves user's search history

## UI Components

### HealthAssistantInput
- Form for collecting user's health issue, budget, and location
- Input validation and example queries
- Responsive design with mobile optimization

### PhysicianCard
- Displays physician information in card format
- Shows affordability badges (Within/Above budget)
- Includes selection functionality

### PhysicianRecommendationsView
- Container for displaying search results
- Handles loading states and error conditions
- Shows search criteria summary

### HealthAssistantFlow
- Main orchestration component
- Manages state transitions between input and results
- Handles physician selection and preference saving

## Testing

### Automated Test Cases (18 total)
- Specialty matching validation
- Budget filtering accuracy
- Experience-based sorting
- Location filtering behavior
- Edge cases (no budget, no location, non-existent location)
- Data loading validation

### Manual UI Test Cases (5 total)
- Physician card display validation
- Affordability indicator testing
- Responsive design verification
- Error handling validation
- Form validation testing

## Setup and Deployment

### Prerequisites
- React application with TypeScript
- Supabase for user authentication and data persistence
- Papa Parse for CSV processing

### Installation Steps
1. Copy physician CSV data to `public/physicians.csv`
2. Install required dependencies:
   ```bash
   npm install papaparse @types/papaparse
   ```
3. Add physician recommendation service and components
4. Configure Supabase tables for user preferences
5. Integrate with existing authentication system

### Environment Configuration
- Ensure Supabase project is configured with proper RLS policies
- CSV file must be accessible from public directory
- Authentication required for preference saving features

## Usage Examples

### Basic Query
```typescript
const query: HealthQuery = {
  issue: "I have been experiencing chest pain and heart palpitations",
  budget: 1200,
  location: "Johannesburg"
};

const physicians = await findRecommendedPhysicians(query);
// Returns: Up to 3 cardiologists in Johannesburg within R1200 budget
```

### Complex Query
```typescript
const query: HealthQuery = {
  issue: "Chronic back pain from sports injury, need experienced orthopedic surgeon",
  budget: 1350,
  location: "Cape Town"
};

const physicians = await findRecommendedPhysicians(query);
// Returns: Orthopedic surgeons in Cape Town, sorted by experience, within budget
```

## Performance Considerations

- CSV data is loaded once and cached for subsequent requests
- Memoization used for repeated filtering operations
- Efficient array operations for large datasets
- Mobile-optimized UI with lazy loading where appropriate

## Security

- All user data stored with Row Level Security (RLS) policies
- Physician preferences isolated by user ID
- Input validation on all user-provided data
- SQL injection protection through parameterized queries

## Monitoring and Analytics

- Search query tracking for usage patterns
- Physician selection frequency monitoring
- Error tracking for failed recommendations
- Performance metrics for recommendation accuracy