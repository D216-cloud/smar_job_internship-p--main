import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Zap, Globe, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface JobCardProps {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    postedDate: string;
    description: string;
    logo?: string;
    isRemote?: boolean | string;
    isUrgent?: boolean | string;
    skills?: string[];
  };
}

export const JobCard = ({ job }: JobCardProps) => {
  const skills = Array.isArray(job.skills)
    ? job.skills
    : (typeof job.skills === 'string' && job.skills)
      ? (job.skills as string).split(',').map(s => s.trim())
      : [];

  return (
    <Card className="group hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white via-blue-50 to-purple-50 border-0 relative overflow-hidden">
      <CardHeader>
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            {job.logo ? (
              <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-xl object-cover border shadow" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg shadow">
                {job.company?.[0] || "?"}
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-semibold text-foreground group-hover:text-blue-700 transition-colors">
                {job.title}
              </CardTitle>
              <p className="text-muted-foreground font-medium">{job.company}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="secondary">{job.type}</Badge>
            <div className="flex gap-1 mt-1">
              {job.isRemote && (
                <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1"><Globe className="h-3 w-3" />Remote</Badge>
              )}
              {job.isUrgent && (
                <Badge className="bg-red-100 text-red-700 flex items-center gap-1"><Zap className="h-3 w-3" />Urgent</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {job.location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-2" />
            {job.salary}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            Posted {job.postedDate}
          </div>
          {skills && skills.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs mt-2">
              {skills.slice(0, 4).map((skill, i) => (
                <Badge key={i} className="bg-purple-100 text-purple-700">{skill}</Badge>
              ))}
              {skills.length > 4 && <span className="text-gray-400">+{skills.length - 4} more</span>}
            </div>
          )}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>
          <div className="flex space-x-2 pt-4">
            <Link to={`/apply/${job.id}`} className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                Apply Now
              </Button>
            </Link>
            <Button variant="outline">Save</Button>
          </div>
        </div>
        <Star className="absolute top-2 right-2 h-5 w-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </CardContent>
    </Card>
  );
};