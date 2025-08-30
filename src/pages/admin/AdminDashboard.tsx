import { DashboardStats } from "@/components/admin/DashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Plus, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const recentApplications = [
    { id: 1, candidate: "John Doe", job: "Frontend Developer", status: "pending", date: "2024-01-10" },
    { id: 2, candidate: "Jane Smith", job: "Backend Engineer", status: "interviewed", date: "2024-01-09" },
    { id: 3, candidate: "Mike Johnson", job: "Full Stack Developer", status: "accepted", date: "2024-01-08" },
    { id: 4, candidate: "Sarah Wilson", job: "UI/UX Designer", status: "rejected", date: "2024-01-07" },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      interviewed: "secondary",
      accepted: "default",
      rejected: "destructive"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening.</p>
        </div>
        <Button onClick={() => navigate('/admin/post-job')}>
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.candidate}</TableCell>
                    <TableCell>{app.job}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" onClick={() => navigate('/admin/post-job')}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Job Posting
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Eye className="h-4 w-4 mr-2" />
              Review Applications
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Edit className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};