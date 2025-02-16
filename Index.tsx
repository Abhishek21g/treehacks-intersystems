
import { useState } from "react";
import { Hero } from "@/components/Hero";
import { PaperCard } from "@/components/PaperCard";
import { Sidebar } from "@/components/Sidebar";
import { PaperUpload } from "@/components/PaperUpload";
import { SummaryOptions } from "@/components/SummaryOptions";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const voices = [
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily" }
];

const Index = () => {
  const [paperText, setPaperText] = useState("");
  const [summary, setSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(voices[0].id);
  const { toast } = useToast();

  // Fetch papers from Supabase
  const { data: papers, isLoading: isPapersLoading } = useQuery({
    queryKey: ['papers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('papers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching papers:', error);
        throw error;
      }

      return data || [];
    }
  });

  const handleUpload = async (text: string) => {
    setPaperText(text);
    setSummary("");
    
    try {
      // Process and store the paper
      const response = await supabase.functions.invoke('process-paper', {
        body: { paperText: text, operation: 'store' }
      });

      if (response.error) throw response.error;

      // Find similar papers
      const { data: similarPapers, error } = await supabase.functions.invoke('process-paper', {
        body: { paperText: text, operation: 'similar' }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Paper processed and similar papers found.",
      });
    } catch (error) {
      console.error('Error processing paper:', error);
      toast({
        title: "Error",
        description: "Failed to process paper. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateSummary = async (format: "abstract" | "full" | "flowchart") => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { text: paperText, format }
      });
      
      if (error) throw error;
      setSummary(data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextToSpeech = async (text: string) => {
    if (!text) {
      toast({
        title: "Error",
        description: "Please enter some text to convert to speech.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text, voiceId: selectedVoice }
      });

      if (response.error) throw response.error;

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Text to speech error:', error);
      toast({
        title: "Error",
        description: "Failed to convert text to speech. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Hero />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Upload Research Paper
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Upload your research paper to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Find similar research papers using AI</li>
                  <li>Generate concise summaries</li>
                  <li>Get recommendations for related work</li>
                  <li>Convert text to speech</li>
                </ul>
                <PaperUpload onUpload={handleUpload} />
              </div>
            </div>

            <div className="space-y-6 p-8 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Text to Speech</h3>
                <p className="text-sm text-gray-600">
                  Drop your text or research paper here, or type directly to convert to speech
                </p>
              </div>
              <div className="space-y-5">
                <textarea
                  className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:outline-none 
                           focus:ring-2 focus:ring-blue-500 text-gray-700 resize-none
                           placeholder:text-gray-400"
                  placeholder="Drop your paper or enter text to convert to speech..."
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const text = await file.text();
                      e.currentTarget.value = text;
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                />
                <div className="flex items-center gap-4">
                  <label htmlFor="voice-select" className="text-sm font-medium text-gray-700 min-w-[80px]">
                    Select Voice:
                  </label>
                  <select
                    id="voice-select"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {voices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    const textarea = document.querySelector('textarea');
                    if (textarea) {
                      handleTextToSpeech(textarea.value);
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 text-sm font-medium
                           text-white bg-blue-600 rounded-lg hover:bg-blue-700
                           transition-colors w-full justify-center shadow-sm"
                >
                  <Play className="h-4 w-4" />
                  Listen with {voices.find(v => v.id === selectedVoice)?.name}
                </button>
              </div>
            </div>

            {paperText && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Generate Summary
                </h2>
                <SummaryOptions
                  onGenerate={handleGenerateSummary}
                  onTextToSpeech={handleTextToSpeech}
                  isGenerating={isGenerating}
                  summary={summary}
                />
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              {isPapersLoading ? "Loading Papers..." : "Recent Papers"}
            </h2>
            <div className="divide-y divide-gray-200">
              {isPapersLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded"></div>
                  ))}
                </div>
              ) : papers && papers.length > 0 ? (
                papers.map((paper, index) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))
              ) : (
                <p className="text-gray-600">No papers found. Upload a paper to get started!</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
