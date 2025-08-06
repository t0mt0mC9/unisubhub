import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from "recharts";
import {
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  Tag,
  Edit3,
  Check,
  X,
  Loader2
} from "lucide-react";

interface CategorizedExpense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  subcategory: string;
  merchant: string;
  confidence: number;
  auto_categorized: boolean;
}

interface SpendingSummary {
  total_amount: number;
  categories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  transaction_count: number;
  period: {
    from: string | null;
    to: string | null;
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

const CATEGORIES = [
  'Alimentation',
  'Transport', 
  'Restaurants',
  'Santé',
  'Shopping',
  'Services financiers',
  'Divertissement',
  'Logement',
  'Autres'
];

export const ExpenseCategorizationDashboard = () => {
  const [expenses, setExpenses] = useState<CategorizedExpense[]>([]);
  const [spendingSummary, setSpendingSummary] = useState<SpendingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);
    
    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(monthAgo.toISOString().split('T')[0]);
    
    loadExpenseCategories();
  }, []);

  const loadExpenseCategories = async () => {
    setLoading(true);
    try {
      // Get user token from localStorage (if available from bank connection)
      const connectionInfo = localStorage.getItem('powens_connection');
      let userToken = null;
      
      if (connectionInfo) {
        const parsed = JSON.parse(connectionInfo);
        userToken = parsed.user_token;
      }

      const { data, error } = await supabase.functions.invoke('expense-categorization', {
        body: {
          action: 'categorize_expenses',
          user_token: userToken,
          date_from: dateFrom,
          date_to: dateTo
        },
      });

      if (error) {
        console.error('Erreur lors de la catégorisation:', error);
        throw new Error(error.message);
      }

      if (data?.success) {
        setExpenses(data.categorized_expenses || []);
        setSpendingSummary(data.spending_summary);
        
        toast({
          title: "Catégorisation terminée",
          description: `${data.categorized_expenses?.length || 0} dépenses catégorisées`,
        });
      } else {
        throw new Error(data?.error || 'Erreur lors de la catégorisation');
      }

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de catégoriser les dépenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryEdit = (expense: CategorizedExpense) => {
    setEditingId(expense.id);
    setEditCategory(expense.category);
  };

  const handleCategorySave = async (expenseId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('expense-categorization', {
        body: {
          action: 'update_category',
          transaction_id: expenseId,
          category: editCategory
        },
      });

      if (error) throw error;

      // Update local state
      setExpenses(prev => prev.map(exp => 
        exp.id === expenseId 
          ? { ...exp, category: editCategory, auto_categorized: false }
          : exp
      ));

      setEditingId(null);
      toast({
        title: "Catégorie mise à jour",
        description: "La catégorie a été modifiée avec succès",
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la catégorie",
        variant: "destructive",
      });
    }
  };

  const handleCategoryCancel = () => {
    setEditingId(null);
    setEditCategory('');
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Catégorisation des dépenses</h1>
        <p className="text-muted-foreground">
          Analysez et catégorisez automatiquement vos dépenses avec l'API Powens
        </p>
      </div>

      {/* Date Range & Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="date-from">Date de début</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-to">Date de fin</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={loadExpenseCategories} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Analyser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {spendingSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total des dépenses</p>
                  <p className="text-2xl font-bold">{formatCurrency(spendingSummary.total_amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Catégories</p>
                  <p className="text-2xl font-bold">{spendingSummary.categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{spendingSummary.transaction_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {spendingSummary && spendingSummary.categories.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={spendingSummary.categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {spendingSummary.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Montants par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={spendingSummary.categories.slice(0, 6)}>
                  <XAxis 
                    dataKey="category" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expense List */}
      <Card>
        <CardHeader>
          <CardTitle>Dépenses détaillées</CardTitle>
          <CardDescription>
            {expenses.length} dépenses catégorisées automatiquement
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 && !loading ? (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertDescription>
                Aucune dépense trouvée pour la période sélectionnée. Cliquez sur "Analyser" pour charger vos données.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium">{expense.merchant}</p>
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(expense.date)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                      <p className="text-sm text-muted-foreground">{expense.subcategory}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {editingId === expense.id ? (
                        <div className="flex items-center space-x-2">
                          <Select value={editCategory} onValueChange={setEditCategory}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={() => handleCategorySave(expense.id)}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCategoryCancel}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{expense.category}</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCategoryEdit(expense)}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center space-x-1">
                        <div 
                          className={`w-2 h-2 rounded-full ${getConfidenceColor(expense.confidence)}`}
                          title={`Confiance: ${expense.confidence}%`}
                        />
                        <span className="text-xs text-muted-foreground">{expense.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};