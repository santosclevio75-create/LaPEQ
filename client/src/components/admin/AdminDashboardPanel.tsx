import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, AlertCircle, CheckCircle, BookOpen, Beaker, Users, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "@/_core/hooks/useAuth";

export default function AdminDashboardPanel() {
  const auth = useAuth();
  const user = auth?.user;
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Fetch data
  const { data: loans = [], isLoading: loansLoading } = trpc.loans.getAll.useQuery();
  const { data: bookLoans = [], isLoading: bookLoansLoading } = trpc.bookLoans.getAll.useQuery();
  const { data: experiments = [], isLoading: experimentsLoading } = trpc.experiments.getAll.useQuery();
  const { data: users = [], isLoading: usersLoading } = trpc.users.getAll.useQuery();

  // Calculate summary metrics
  const activeLoans = useMemo(() => loans?.filter(l => l.status === "approved").length || 0, [loans]);
  const overdueLoans = useMemo(() => {
    const now = new Date();
    return loans?.filter(l => l.status === "approved" && new Date(l.returnDate) < now).length || 0;
  }, [loans]);
  const totalUsers = users?.length || 0;
  const totalExperiments = experiments?.length || 0;

  // Prepare calendar data
  const calendarDays = useMemo(() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [selectedMonth]);

  // Get loan status for calendar
  const getLoanStatusForDate = (day: number | null) => {
    if (!day || !loans) return null;
    const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
    const loansOnDate = loans.filter(l => {
      const withdrawalDate = new Date(l.withdrawalDate);
      const returnDate = new Date(l.returnDate);
      return withdrawalDate.toDateString() === date.toDateString() || returnDate.toDateString() === date.toDateString();
    });
    if (loansOnDate.length === 0) return null;
    const hasOverdue = loansOnDate.some(l => l.status === "approved" && new Date(l.returnDate) < new Date());
    const hasApproved = loansOnDate.some(l => l.status === "approved");
    if (hasOverdue) return "overdue";
    if (hasApproved) return "approved";
    return "pending";
  };

  // Prepare pending loans data
  const pendingLoans = useMemo(() => {
    return loans?.filter(l => l.status === "pending" || (l.status === "approved" && new Date(l.returnDate) < new Date())).slice(0, 5) || [];
  }, [loans]);

  // Prepare chart data for experiments
  const experimentsChartData = useMemo(() => {
    return experiments?.slice(0, 6).map(exp => ({
      name: exp.title.substring(0, 15),
      value: Math.floor(Math.random() * 40) + 10, // Placeholder data
    })) || [];
  }, [experiments]);

  // Prepare chart data for kit status
  const kitStatusData = [
    { name: "Disponíveis", value: 45, fill: "#3b82f6" },
    { name: "Emprestados", value: 30, fill: "#10b981" },
    { name: "Atrasados", value: 15, fill: "#f97316" },
    { name: "Manutenção", value: 10, fill: "#ef4444" },
  ];

  if (loansLoading || bookLoansLoading || experimentsLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-900 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Empréstimos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">{activeLoans}</div>
            <p className="text-xs text-orange-600 mt-1">Kits em circulação</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Kits Atrasados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{overdueLoans}</div>
            <p className="text-xs text-red-600 mt-1">Requerem atenção</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{totalUsers}</div>
            <p className="text-xs text-green-600 mt-1">Usuários ativos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <Beaker className="h-4 w-4" />
              Experimentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{totalExperiments}</div>
            <p className="text-xs text-blue-600 mt-1">No catálogo</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar and Pending Loans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 border-2 border-gray-200">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900">Calendário de Reservas</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                >
                  ←
                </Button>
                <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                  {selectedMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                >
                  →
                </Button>
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">Emprestados</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-xs text-gray-600">Atrasados</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-600">Manutenção</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map(day => (
                <div key={day} className="text-center font-semibold text-gray-700 text-sm py-2">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                const status = getLoanStatusForDate(day);
                const statusColors = {
                  approved: "bg-green-500",
                  overdue: "bg-orange-500",
                  pending: "bg-gray-300",
                };
                return (
                  <div
                    key={idx}
                    className={`aspect-square flex items-center justify-center rounded border text-sm font-medium ${
                      day ? "bg-white border-gray-200 text-gray-900" : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    {day && (
                      <div className="relative w-full h-full flex items-center justify-center" style={{marginLeft: '54px', marginTop: '-18px'}}>
                        {day}
                        {status && (
                          <div className={`absolute bottom-1 w-2 h-2 rounded-full ${statusColors[status]}`}></div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pending Loans */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-gray-900">Empréstimos Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingLoans.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum empréstimo pendente</p>
              ) : (
                pendingLoans.map(loan => (
                  <div key={loan.id} className="border-l-4 border-orange-500 bg-orange-50 p-3 rounded">
                    <p className="font-semibold text-sm text-gray-900">{loan.name}</p>
                    <p className="text-xs text-gray-600 mt-1">Item: {loan.experimentId}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {new Date(loan.returnDate) < new Date() ? "Atrasado" : "Pendente"}
                      </Badge>
                      <Button size="sm" variant="ghost" className="text-xs">
                        Ver
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Accessed Experiments */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Experimentos Mais Acessados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={experimentsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Kit Status */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Status dos Kits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={kitStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {kitStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {kitStatusData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: item.fill }}></div>
                    <span className="text-gray-700">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
