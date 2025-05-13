
/**
 * Health concern data type with description and examples
 */
export interface HealthConcern {
  label: string;
  description: string;
  examples: string[];
}

/**
 * Example query data type
 */
export interface ExampleQuery {
  text: string;
  buttonText?: string;
}
