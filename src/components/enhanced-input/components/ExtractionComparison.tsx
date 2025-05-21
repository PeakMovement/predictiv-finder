
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  extractHealthDataWithOpenAI,
  extractHealthDataWithLocalModel 
} from '@/utils/healthDataExtraction';

interface ExtractionComparisonProps {
  userInput: string;
  openAIKey?: string;
  onSelectExtraction: (extractionType: 'openai' | 'local-model' | 'hybrid') => void;
}

const ExtractionComparison: React.FC<ExtractionComparisonProps> = ({
  userInput,
  openAIKey,
  onSelectExtraction
}) => {
  const [openAIResult, setOpenAIResult] = useState<any>(null);
  const [localResult, setLocalResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('local');
  const [error, setError] = useState<string | null>(null);

  // Run the comparison when user input changes
  useEffect(() => {
    if (!userInput || userInput.length < 10) return;

    // Always run the local model extraction
    const localData = extractHealthDataWithLocalModel(userInput);
    setLocalResult(localData);

    // Only run OpenAI extraction if we have an API key
    if (openAIKey) {
      setIsLoading(true);
      setError(null);

      extractHealthDataWithOpenAI(userInput, openAIKey)
        .then(data => {
          if (data) {
            setOpenAIResult(data);
          } else {
            setError("OpenAI extraction failed");
          }
        })
        .catch(err => {
          setError(`OpenAI API error: ${err.message}`);
          console.error(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userInput, openAIKey]);

  const handleSelectExtraction = (type: 'openai' | 'local-model' | 'hybrid') => {
    onSelectExtraction(type);
  };

  function renderDataList(data: Record<string, any>) {
    return (
      <div className="space-y-4 text-sm">
        {Object.entries(data).map(([key, value]) => {
          // Skip rendering the source field
          if (key === 'source') return null;
          
          return (
            <div key={key} className="space-y-1">
              <div className="font-medium text-gray-500 dark:text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </div>
              <div className="text-gray-900 dark:text-gray-200">
                {Array.isArray(value) 
                  ? value.length > 0 
                    ? value.join(', ')
                    : 'None detected'
                  : value === null || value === undefined
                    ? 'None detected'
                    : typeof value === 'object'
                      ? JSON.stringify(value)
                      : value.toString()}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Extraction Method Comparison</CardTitle>
        <CardDescription>
          Compare health data extraction methods and select the best one for your needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="local">Local Model</TabsTrigger>
            <TabsTrigger value="openai" disabled={!openAIKey || isLoading}>
              {isLoading ? 'Loading...' : 'OpenAI'}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="local" className="py-4">
            {localResult ? (
              renderDataList(localResult)
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No data extracted yet
              </div>
            )}
          </TabsContent>
          <TabsContent value="openai" className="py-4">
            {error ? (
              <div className="py-4 text-center text-red-500">
                {error}
              </div>
            ) : openAIResult ? (
              renderDataList(openAIResult)
            ) : isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Getting results from OpenAI...
              </div>
            ) : !openAIKey ? (
              <div className="py-8 text-center text-muted-foreground">
                OpenAI API key required
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No data extracted yet
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => handleSelectExtraction('local-model')}
        >
          Use Local Model
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSelectExtraction('hybrid')}
        >
          Use Hybrid Approach
        </Button>
        <Button
          onClick={() => handleSelectExtraction('openai')}
          disabled={!openAIKey || !openAIResult}
        >
          Use OpenAI
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExtractionComparison;
