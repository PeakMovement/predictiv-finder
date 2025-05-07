
/**
 * Represents the different stages/screens of the application flow
 * Controls which components are displayed at any given time
 * 
 * @typedef {string} AppStage
 * 
 * @description The application follows a specific flow:
 * - 'home': Initial landing page with options to start
 * - 'category-selector': User selects health categories of interest
 * - 'category-questionnaire': Detailed questions about the selected categories
 * - 'practitioner-list': Shows matched healthcare practitioners
 * - 'ai-input': User describes health needs to AI assistant
 * - 'ai-plans': Shows AI-generated health plans
 * - 'plan-details': Shows detailed view of a selected plan
 */
export type AppStage = 
  | 'home'
  | 'category-selector' 
  | 'category-questionnaire' 
  | 'practitioner-list'
  | 'ai-input'
  | 'ai-plans'
  | 'plan-details';

/**
 * Data security considerations for handling user health information:
 * 1. All health data should be treated as sensitive personal information
 * 2. Data should not be stored persistently without explicit user consent
 * 3. Minimize collection of personally identifiable information (PII)
 * 4. Apply appropriate encryption for any data transmission
 * 5. Follow healthcare privacy regulations (e.g., HIPAA principles) where applicable
 * 
 * @example
 * // Example of secure data handling
 * function handleSensitiveData(data: UserHealthData) {
 *   // Only process data in memory, never log to console
 *   // Transmit only via secure channels
 *   secureApiClient.process(data);
 * }
 */
