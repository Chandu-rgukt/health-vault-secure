import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useReports } from '@/hooks/useReports';
import { useVitals } from '@/hooks/useVitals';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Activity, 
  Share2, 
  Plus, 
  TrendingUp,
  Heart,
  Droplet,
  Thermometer
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { VITAL_TYPES } from '@/store/slices/vitalsSlice';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { profile } = useAppSelector((state) => state.auth);
  const { reports, fetchReports } = useReports();
  const { vitals, fetchVitals } = useVitals();

  useEffect(() => {
    fetchReports();
    fetchVitals();
  }, [fetchReports, fetchVitals]);

  const recentVitals = vitals.slice(0, 5);
  const recentReports = reports.slice(0, 3);

  // Get latest values for each vital type
  const latestVitals = VITAL_TYPES.map(type => {
    const latest = vitals.find(v => v.vital_type === type.value);
    return {
      ...type,
      latestValue: latest?.value,
      latestDate: latest?.recorded_at,
    };
  }).filter(v => v.latestValue);

  // Prepare chart data for heart rate
  const heartRateData = vitals
    .filter(v => v.vital_type === 'heart_rate')
    .slice(0, 7)
    .reverse()
    .map(v => ({
      date: format(new Date(v.recorded_at), 'MMM d'),
      value: v.value,
    }));

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's an overview of your health records
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/upload">
              <Button className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Upload Report
              </Button>
            </Link>
            <Link to="/vitals">
              <Button variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Add Vital
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reports
              </CardTitle>
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">{reports.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Medical documents stored</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Vitals Recorded
              </CardTitle>
              <div className="p-2 rounded-lg bg-success/10">
                <Activity className="w-5 h-5 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">{vitals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Health measurements tracked</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Shares
              </CardTitle>
              <div className="p-2 rounded-lg bg-info/10">
                <Share2 className="w-5 h-5 text-info" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">Reports shared with others</p>
            </CardContent>
          </Card>
        </div>

        {/* Vitals Overview & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latest Vitals */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Latest Vitals
              </CardTitle>
              <CardDescription>Your most recent health measurements</CardDescription>
            </CardHeader>
            <CardContent>
              {latestVitals.length > 0 ? (
                <div className="space-y-4">
                  {latestVitals.slice(0, 4).map((vital) => (
                    <div key={vital.value} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        {vital.value === 'heart_rate' && <Heart className="w-5 h-5 text-vital-heart" />}
                        {vital.value.includes('blood_pressure') && <Activity className="w-5 h-5 text-vital-bp" />}
                        {vital.value === 'blood_sugar' && <Droplet className="w-5 h-5 text-vital-sugar" />}
                        {vital.value === 'temperature' && <Thermometer className="w-5 h-5 text-vital-temp" />}
                        {!['heart_rate', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'blood_sugar', 'temperature'].includes(vital.value) && (
                          <Activity className="w-5 h-5 text-primary" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{vital.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {vital.latestDate && format(new Date(vital.latestDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-lg">
                          {vital.latestValue}
                        </p>
                        <p className="text-xs text-muted-foreground">{vital.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No vitals recorded yet</p>
                  <Link to="/vitals">
                    <Button variant="link" className="mt-2">Record your first vital</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Heart Rate Trend */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Heart className="w-5 h-5 text-vital-heart" />
                Heart Rate Trend
              </CardTitle>
              <CardDescription>Your heart rate over time</CardDescription>
            </CardHeader>
            <CardContent>
              {heartRateData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={heartRateData}>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: 'none', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--vital-heart))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--vital-heart))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <Heart className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">No heart rate data yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Reports */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Recent Reports
              </CardTitle>
              <CardDescription>Your latest uploaded medical documents</CardDescription>
            </div>
            <Link to="/reports">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentReports.length > 0 ? (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <p className="text-sm text-muted-foreground">{report.report_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(report.report_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">{report.file_name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground">No reports uploaded yet</p>
                <Link to="/upload">
                  <Button variant="link" className="mt-2">Upload your first report</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
