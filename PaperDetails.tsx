
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, GitFork, ThumbsUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaperDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { paper } = location.state || {};

  if (!paper) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Paper not found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <article className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{paper.title}</h1>
            
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">{paper.authors.join(", ")}</span>
              <span>•</span>
              <span>{paper.journal}</span>
              <span>•</span>
              <span>{paper.year}</span>
            </div>

            {paper.similarity !== undefined && (
              <div className="inline-block text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded">
                {(paper.similarity * 100).toFixed(1)}% match
              </div>
            )}
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Abstract</h2>
            <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
          </div>

          <div className="flex items-center gap-8 text-sm text-gray-600 border-t border-gray-200 pt-6">
            <div className="flex items-center gap-2">
              <GitFork className="h-5 w-5" />
              <span>{paper.citations || 0} citations</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{paper.reference_count || 0} references</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-5 w-5" />
              <span>{paper.downloads || 0} downloads</span>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button>Cite</Button>
            <Button>Save</Button>
            <Button>Download PDF</Button>
            <Button>Get AI Summary</Button>
          </div>
        </article>
      </div>
    </div>
  );
}
