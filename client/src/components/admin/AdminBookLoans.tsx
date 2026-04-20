import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Edit2, Trash2, Filter, CheckCircle, Clock, XCircle, BookOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AdminBookLoans() {
  const [selectedBookLoanId, setSelectedBookLoanId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    status: "pending" as const,
    notes: "",
  });

  const { data: bookLoans = [], isLoading: bookLoansLoading, refetch: refetchBookLoans } = trpc.bookLoans.list.useQuery();
  const updateBookLoan = trpc.bookLoans.updateStatus.useMutation();
  const deleteBookLoan = trpc.bookLoans.delete.useMutation();
  const createNotification = trpc.notifications.create.useMutation();

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBookLoanId) return;

    try {
      const bookLoan = bookLoans.find((bl) => bl.id === selectedBookLoanId);
      const previousStatus = bookLoan?.status;

      await updateBookLoan.mutateAsync({
        id: selectedBookLoanId,
        status: editData.status,
        notes: editData.notes,
      });

      // Create notification for status change
      if (bookLoan && previousStatus !== editData.status) {
        const notificationTitles: Record<string, string> = {
          approved: "Empréstimo de Livro Aprovado",
          rejected: "Empréstimo de Livro Rejeitado",
          returned: "Empréstimo de Livro Devolvido",
        };

        const notificationMessages: Record<string, string> = {
          approved: `Sua solicitação de empréstimo de livro "${bookLoan.bookTitle}" foi aprovada!`,
          rejected: `Sua solicitação de empréstimo de livro "${bookLoan.bookTitle}" foi rejeitada.`,
          returned: `O empréstimo de livro "${bookLoan.bookTitle}" foi marcado como devolvido.`,
        };

        if (notificationTitles[editData.status]) {
          await createNotification.mutateAsync({
            userId: bookLoan.userId,
            type: `book_loan_${editData.status}` as any,
            title: notificationTitles[editData.status],
            message: notificationMessages[editData.status],
            bookLoanId: selectedBookLoanId,
          });
        }
      }

      toast.success("Empréstimo de livro atualizado com sucesso");
      setEditOpen(false);
      setSelectedBookLoanId(null);
      refetchBookLoans();
    } catch (error) {
      toast.error("Erro ao atualizar empréstimo de livro");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja deletar este empréstimo de livro?")) {
      try {
        await deleteBookLoan.mutateAsync(id);
        toast.success("Empréstimo de livro deletado com sucesso");
        refetchBookLoans();
      } catch (error) {
        toast.error("Erro ao deletar empréstimo de livro");
      }
    }
  };

  const handleEdit = (bookLoan: any) => {
    setSelectedBookLoanId(bookLoan.id);
    setEditData({
      status: bookLoan.status,
      notes: bookLoan.notes || "",
    });
    setEditOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900";
      case "approved":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900";
      case "rejected":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900";
      case "returned":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900";
      default:
        return "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-900";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "approved":
        return "Aprovado";
      case "rejected":
        return "Rejeitado";
      case "returned":
        return "Devolvido";
      default:
        return status;
    }
  };

  const filteredBookLoans = filterStatus
    ? bookLoans.filter((bl) => bl.status === filterStatus)
    : bookLoans;

  const statusStats = {
    pending: bookLoans.filter((bl) => bl.status === "pending").length,
    approved: bookLoans.filter((bl) => bl.status === "approved").length,
    rejected: bookLoans.filter((bl) => bl.status === "rejected").length,
    returned: bookLoans.filter((bl) => bl.status === "returned").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Gerenciar Empréstimos de Livros</h2>
        <p className="mt-1 text-muted-foreground">
          {bookLoans.length} solicitação{bookLoans.length !== 1 ? "s" : ""} de empréstimo de livro
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{statusStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{statusStats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Rejeitados</p>
                <p className="text-2xl font-bold text-red-600">{statusStats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Devolvidos</p>
                <p className="text-2xl font-bold text-blue-600">{statusStats.returned}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterStatus === null ? "default" : "outline"}
          onClick={() => setFilterStatus(null)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Todos ({bookLoans.length})
        </Button>
        <Button
          variant={filterStatus === "pending" ? "default" : "outline"}
          onClick={() => setFilterStatus("pending")}
        >
          Pendentes ({statusStats.pending})
        </Button>
        <Button
          variant={filterStatus === "approved" ? "default" : "outline"}
          onClick={() => setFilterStatus("approved")}
        >
          Aprovados ({statusStats.approved})
        </Button>
        <Button
          variant={filterStatus === "rejected" ? "default" : "outline"}
          onClick={() => setFilterStatus("rejected")}
        >
          Rejeitados ({statusStats.rejected})
        </Button>
        <Button
          variant={filterStatus === "returned" ? "default" : "outline"}
          onClick={() => setFilterStatus("returned")}
        >
          Devolvidos ({statusStats.returned})
        </Button>
      </div>

      {/* Book Loans List */}
      {bookLoansLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : filteredBookLoans.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Nenhuma solicitação de empréstimo de livro</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookLoans.map((bookLoan) => (
            <Card key={bookLoan.id} className={`border ${getStatusColor(bookLoan.status)}`}>
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-foreground">{bookLoan.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {bookLoan.institution}
                      </CardDescription>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium`}>
                      {getStatusLabel(bookLoan.status)}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Livro</p>
                      <p className="text-sm text-foreground">{bookLoan.bookTitle}</p>
                      {bookLoan.author && (
                        <p className="text-xs text-muted-foreground">Autor: {bookLoan.author}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Datas</p>
                      <p className="text-sm text-foreground">
                        {new Date(bookLoan.withdrawalDate).toLocaleDateString("pt-BR")} até{" "}
                        {new Date(bookLoan.returnDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {bookLoan.notes && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Notas</p>
                      <p className="text-sm text-foreground">{bookLoan.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Dialog open={editOpen && selectedBookLoanId === bookLoan.id} onOpenChange={setEditOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(bookLoan)}
                          className="border-border text-foreground hover:bg-muted"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Atualizar Status
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="border-border bg-card">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Atualizar Empréstimo de Livro</DialogTitle>
                          <DialogDescription className="text-muted-foreground">
                            {bookLoan.name} - {bookLoan.bookTitle}
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdateStatus} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Status
                            </label>
                            <Select value={editData.status} onValueChange={(value: any) => setEditData({ ...editData, status: value })}>
                              <SelectTrigger className="border-border bg-background text-foreground">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="border-border bg-card">
                                <SelectItem value="pending" className="text-foreground">
                                  Pendente
                                </SelectItem>
                                <SelectItem value="approved" className="text-foreground">
                                  Aprovado
                                </SelectItem>
                                <SelectItem value="rejected" className="text-foreground">
                                  Rejeitado
                                </SelectItem>
                                <SelectItem value="returned" className="text-foreground">
                                  Devolvido
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                              Notas
                            </label>
                            <Textarea
                              value={editData.notes}
                              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                              className="border-border bg-background text-foreground"
                              placeholder="Adicione notas sobre este empréstimo..."
                            />
                          </div>

                          <Button
                            type="submit"
                            disabled={updateBookLoan.isPending}
                            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                          >
                            {updateBookLoan.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Atualizando...
                              </>
                            ) : (
                              "Atualizar"
                            )}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(bookLoan.id)}
                      className="border-border text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
