import { useEffect } from 'react';
import { useSharing } from '@/hooks/useSharing';
import { useReports } from '@/hooks/useReports';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Share2, Users, FileText, Trash2, Loader2, Download } from 'lucide-react';
import { format } from 'date-fns';

const Shared = () => {
  const { sharedByMe, isLoading, fetchSharedByMe, revokeAccess } = useSharing();
  const { sharedReports, fetchSharedReports, downloadReport } = useReports();

  useEffect(() => {
    fetchSharedByMe();
    fetchSharedReports();
  }, [fetchSharedByMe, fetchSharedReports]);

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Shared Reports</h1>
          <p className="text-muted-foreground mt-1">
            Manage reports you've shared and access reports shared with you
          </p>
        </div>

        <Tabs defaultValue="shared-by-me" className="space-y-6">
          <TabsList>
            <TabsTrigger value="shared-by-me" className="gap-2">
              <Share2 className="w-4 h-4" />
              Shared by Me
            </TabsTrigger>
            <TabsTrigger value="shared-with-me" className="gap-2">
              <Users className="w-4 h-4" />
              Shared with Me
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shared-by-me">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  Reports I've Shared ({sharedByMe.length})
                </CardTitle>
                <CardDescription>
                  Reports you've shared with others. You can revoke access anytime.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : sharedByMe.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Shared With</TableHead>
                          <TableHead>Access Type</TableHead>
                          <TableHead>Shared On</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sharedByMe.map((share) => (
                          <TableRow key={share.id}>
                            <TableCell className="font-medium">
                              {share.shared_with_email}
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 rounded-full bg-info/10 text-info text-xs font-medium capitalize">
                                {share.access_type}
                              </span>
                            </TableCell>
                            <TableCell>
                              {format(new Date(share.created_at), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {share.expires_at
                                ? format(new Date(share.expires_at), 'MMM d, yyyy')
                                : 'Never'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => revokeAccess(share.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Revoke
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Share2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">You haven't shared any reports yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Go to Reports and click the share button to share with others
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shared-with-me">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Reports Shared with Me ({sharedReports.length})
                </CardTitle>
                <CardDescription>
                  Reports that others have shared with you (read-only access)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sharedReports.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>File</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sharedReports.map((report) => (
                          <TableRow key={report.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                <span className="font-medium">{report.title}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                {report.report_type}
                              </span>
                            </TableCell>
                            <TableCell>
                              {format(new Date(report.report_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {report.file_name}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => downloadReport(report.file_path, report.file_name)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No reports have been shared with you</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      When someone shares a report with you, it will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Shared;
