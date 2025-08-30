
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, Users, BookOpen, ExternalLink, MapPin, Clock, DollarSign, Sparkles, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SearchResult {
  id: string;
  title: string;
  type: 'job' | 'company' | 'internship' | 'skill';
  description?: string;
  company?: string;
  location?: string;
  salary?: string;
  tags?: string[];
  url?: string;
  jobType?: string;
}

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  isLoading?: boolean;
  onClose: () => void;
}

const SearchResults = ({ query, results, isLoading, onClose }: SearchResultsProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'job': return Briefcase;
      case 'company': return Building2;
      case 'internship': return BookOpen;
      case 'skill': return Users;
      default: return Briefcase;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job': return 'from-blue-500 to-cyan-500';
      case 'company': return 'from-purple-500 to-pink-500';
      case 'internship': return 'from-green-500 to-emerald-500';
      case 'skill': return 'from-orange-500 to-yellow-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'job': return '💼';
      case 'company': return '🏢';
      case 'internship': return '🎓';
      case 'skill': return '🚀';
      default: return '💼';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-600">
        <div className="relative mx-auto mb-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <div className="absolute inset-0 rounded-full border-2 border-blue-300 opacity-25 animate-ping"></div>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
          <span className="font-medium">Searching amazing opportunities...</span>
          <Sparkles className="h-4 w-4 text-purple-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    );
  }

  if (!query || results.length === 0) {
    return query ? (
      <div className="p-6 text-center">
        <div className="text-4xl mb-3">🔍</div>
        <div className="text-gray-600 mb-4">
          No results found for "<span className="font-semibold text-gray-800">{query}</span>"
        </div>
        <div className="text-sm text-gray-500 mb-4">
          Try searching for jobs, companies, skills, or internships
        </div>
        <Button 
          onClick={onClose} 
          variant="outline" 
          className="w-full hover:bg-gray-50 transition-colors"
        >
          Close
        </Button>
      </div>
    ) : null;
  }

  return (
    <div className="p-4">
      {/* Enhanced Header */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Search Results
              </h3>
              <p className="text-sm text-gray-500">
                "{query}" • {results.length} {results.length === 1 ? 'result' : 'results'}
              </p>
            </div>
          </div>
        </div>
        <Button onClick={onClose} variant="ghost" size="sm" className="hover:bg-gray-100 transition-colors">
          ✕
        </Button>
      </div>
      
      {/* Results with enhanced styling */}
      <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
        {results.map((result, index) => {
          const IconComponent = getIcon(result.type);
          return (
            <Card 
              key={result.id} 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-gray-200 hover:border-blue-300 group animate-fade-in transform hover:-translate-y-1" 
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getTypeColor(result.type)} rounded-xl flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="h-6 w-6 text-white relative z-10" />
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-base group-hover:text-blue-600 transition-colors duration-300">
                          {result.title}
                        </CardTitle>
                        <span className="text-lg">{getTypeEmoji(result.type)}</span>
                      </div>
                      {result.company && (
                        <CardDescription className="text-sm text-gray-600 font-medium">
                          {result.company}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="capitalize bg-gray-50 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors duration-300">
                      {result.type}
                    </Badge>
                    {result.type === 'job' && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-gray-500">Featured</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {result.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                    {result.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {result.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                      <MapPin className="h-3 w-3" />
                      {result.location}
                    </div>
                  )}
                  {result.jobType && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                      <Clock className="h-3 w-3" />
                      {result.jobType}
                    </div>
                  )}
                  {result.salary && (
                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                      <DollarSign className="h-3 w-3" />
                      {result.salary}
                    </div>
                  )}
                </div>

                {result.tags && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {result.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer">
                        {tag}
                      </Badge>
                    ))}
                    {result.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                        +{result.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Link to={`/job-application/${result.id}`} className="flex-1">
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md">
                      <Sparkles className="h-3 w-3 mr-2" />
                      {result.type === 'company' ? 'View Company' : 'Apply Now'}
                    </Button>
                  </Link>
                  {result.url && (
                    <Button size="sm" variant="outline" className="hover:bg-gray-50 transition-colors">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Sparkles className="h-3 w-3 text-blue-500" />
          <span>Powered by AI • Real-time results</span>
          <Sparkles className="h-3 w-3 text-purple-500" />
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
