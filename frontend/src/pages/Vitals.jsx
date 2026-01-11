import { useEffect, useState } from "react";
import { useVitals } from "@/hooks/useVitals";
import { useAppDispatch } from "@/store/hooks";
import {
  setSelectedVitalType,
  setDateRange,
  VITAL_TYPES,
} from "@/store/slices/vitalsSlice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Activity,
  Plus,
  Trash2,
  TrendingUp,
  Heart,
  Droplet,
  Thermometer,
  Wind,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Vitals = () => {
  const dispatch = useAppDispatch();
  const {
    vitals,
    isLoading,
    selectedVitalType,
    dateRange,
    fetchVitals,
    recordVital,
    deleteVital,
  } = useVitals();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [formData, setFormData] = useState({
    vitalType: "",
    value: "",
    recordedAt: new Date().toISOString().slice(0, 16),
    notes: "",
  });

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  const selectedVitalInfo = VITAL_TYPES.find(
    (v) => v.value === formData.vitalType
  );

  const handleRecordVital = async () => {
    if (!formData.vitalType || !formData.value) return;

    setIsRecording(true);
    const vitalInfo = VITAL_TYPES.find(
      (v) => v.value === formData.vitalType
    );

    const { error } = await recordVital(
      formData.vitalType,
      parseFloat(formData.value),
      vitalInfo?.unit || "",
      formData.recordedAt,
      formData.notes
    );

    setIsRecording(false);

    if (!error) {
      setIsDialogOpen(false);
      setFormData({
        vitalType: "",
        value: "",
        recordedAt: new Date().toISOString().slice(0, 16),
        notes: "",
      });
    }
  };

  const getVitalIcon = (vitalType) => {
    switch (vitalType) {
      case "heart_rate":
        return <Heart className="w-4 h-4 text-vital-heart" />;
      case "blood_pressure_systolic":
      case "blood_pressure_diastolic":
        return <Activity className="w-4 h-4 text-vital-bp" />;
      case "blood_sugar":
        return <Droplet className="w-4 h-4 text-vital-sugar" />;
      case "oxygen_saturation":
        return <Wind className="w-4 h-4 text-vital-oxygen" />;
      case "temperature":
        return <Thermometer className="w-4 h-4 text-vital-temp" />;
      default:
        return <Activity className="w-4 h-4 text-primary" />;
    }
  };

  const getVitalColor = (vitalType) => {
    switch (vitalType) {
      case "heart_rate":
        return "hsl(var(--vital-heart))";
      case "blood_pressure_systolic":
      case "blood_pressure_diastolic":
        return "hsl(var(--vital-bp))";
      case "blood_sugar":
        return "hsl(var(--vital-sugar))";
      case "oxygen_saturation":
        return "hsl(var(--vital-oxygen))";
      case "temperature":
        return "hsl(var(--vital-temp))";
      case "weight":
        return "hsl(var(--vital-weight))";
      default:
        return "hsl(var(--primary))";
    }
  };

  const chartData = vitals
    .filter(
      (v) =>
        selectedVitalType === "all" ||
        v.vital_type === selectedVitalType
    )
    .slice(0, 30)
    .reverse()
    .map((v) => ({
      date: format(new Date(v.recorded_at), "MMM d"),
      value: v.value,
      type: v.vital_type,
    }));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Vitals Tracking
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor your health metrics over time
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Record Vital
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">
                  Record New Vital
                </DialogTitle>
                <DialogDescription>
                  Enter your health measurement details
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Vital Type</Label>
                  <Select
                    value={formData.vitalType}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        vitalType: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vital type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VITAL_TYPES.map((type) => (
                        <SelectItem
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">
                    Value{" "}
                    {selectedVitalInfo &&
                      `(${selectedVitalInfo.unit})`}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.1"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recordedAt">Date & Time</Label>
                  <Input
                    id="recordedAt"
                    type="datetime-local"
                    value={formData.recordedAt}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recordedAt: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRecordVital}
                  disabled={
                    isRecording ||
                    !formData.vitalType ||
                    !formData.value
                  }
                  className="gradient-primary"
                >
                  {isRecording ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recording...
                    </>
                  ) : (
                    "Record Vital"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2">
                <Label>Filter by Type</Label>
                <Select
                  value={selectedVitalType}
                  onValueChange={(value) =>
                    dispatch(setSelectedVitalType(value))
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Types
                    </SelectItem>
                    {VITAL_TYPES.map((type) => (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    dispatch(
                      setDateRange({
                        ...dateRange,
                        startDate: e.target.value,
                      })
                    )
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    dispatch(
                      setDateRange({
                        ...dateRange,
                        endDate: e.target.value,
                      })
                    )
                  }
                />
              </div>

              <div className="flex items-end">
                <Button onClick={fetchVitals} variant="outline">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="chart" className="space-y-6">
          <TabsList>
            <TabsTrigger value="chart" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Chart View
            </TabsTrigger>
            <TabsTrigger value="table" className="gap-2">
              <Activity className="w-4 h-4" />
              Table View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Vitals Trend
                </CardTitle>
                <CardDescription>
                  {selectedVitalType === "all"
                    ? "Showing all vital types"
                    : `Showing ${
                        VITAL_TYPES.find(
                          (v) =>
                            v.value === selectedVitalType
                        )?.label
                      }`}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={400}
                  >
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={
                          selectedVitalType !== "all"
                            ? getVitalColor(
                                selectedVitalType
                              )
                            : "hsl(var(--primary))"
                        }
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No vital data to display
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="table">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="font-display">
                  Vitals History ({vitals.length})
                </CardTitle>
                <CardDescription>
                  All your recorded health measurements
                </CardDescription>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vitals.map((vital) => {
                        const vitalInfo =
                          VITAL_TYPES.find(
                            (v) =>
                              v.value === vital.vital_type
                          );
                        return (
                          <TableRow key={vital.id}>
                            <TableCell>
                              {vitalInfo?.label}
                            </TableCell>
                            <TableCell>
                              {vital.value} {vital.unit}
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(
                                  vital.recorded_at
                                ),
                                "MMM d, yyyy h:mm a"
                              )}
                            </TableCell>
                            <TableCell>
                              {vital.notes || "-"}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  deleteVital(vital.id)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Vitals;
