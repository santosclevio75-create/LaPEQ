import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, CheckCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663138388912/Sg53Qp3VHExKb8spk84Ana/WhatsAppImage2026-04-16at08.01.14_20623c9f.jpeg";

export default function BookLoansPage() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institution: "",
    bookTitle: "",
    author: "",
    withdrawalDate: "",
    returnDate: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // Fetch data
  const { data: logoSizeConfig } = trpc.settings.getLogoSize.useQuery();
  const logoSize = logoSizeConfig?.size || "h-10";
  const createBookLoan = trpc.bookLoans.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.institution || !formData.bookTitle || !formData.withdrawalDate || !formData.returnDate) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor, insira um email válido");
      return;
    }

    // Validação de datas
    const withdrawalDate = new Date(formData.withdrawalDate);
    const returnDate = new Date(formData.returnDate);

    if (returnDate <= withdrawalDate) {
      toast.error("A data de devolução deve ser posterior à data de retirada");
      return;
    }

    try {
      await createBookLoan.mutateAsync({
        name: formData.name,
        email: formData.email,
        institution: formData.institution,
        bookTitle: formData.bookTitle,
        author: formData.author || undefined,
        withdrawalDate: new Date(formData.withdrawalDate),
        returnDate: new Date(formData.returnDate),
      });

      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        institution: "",
        bookTitle: "",
        author: "",
        withdrawalDate: "",
        returnDate: "",
      });

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      toast.error("Erro ao solicitar empréstimo de livro. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      {/* Header */}
      <header className="border-b-4 border-green-600 bg-white shadow-md">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
               <img src={LOGO_URL} alt="LAPEQ-UFOB" className={`${logoSize} w-auto`} style={{width: '500px'}} />
            <h1 className="text-xl font-bold text-green-700" style={{display: 'none'}}>Livros</h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-green-700 hover:bg-green-100" style={{width: '66px', height: '50px'}}
          >
            ← Voltar
          </Button>
        </div>
      </header>

      {/* Title Section */}
      <section className="container py-8">
        <h1 className="text-3xl font-bold text-green-800 mb-2" style={{width: '636px', marginLeft: '590px', marginTop: '-374px'}}>Solicitar Empréstimo de Livro</h1>
        <p className="text-gray-600" style={{width: '633px', marginLeft: '590px'}}>
          Preencha o formulário abaixo para solicitar um livro ou material de referência
        </p>
      </section>

      {/* Separador */}
      <div className="border-t-4 border-green-600 my-8"></div>

      {/* Form Section */}
      <section className="container py-12">
        <div className="mx-auto max-w-2xl">
          {submitted ? (
            <Card className="border-2 border-green-300 bg-green-50 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    Solicitação Enviada com Sucesso!
                  </h2>
                  <p className="text-gray-700 mb-6">
                    Sua solicitação de empréstimo de livro foi recebida. Entraremos em contato em breve para confirmar os detalhes.
                  </p>
                  <Button
                    onClick={() => navigate("/")}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    Voltar à Página Inicial
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-green-300 bg-white shadow-lg" style={{width: '639px', height: '154px', marginLeft: '511px', marginTop: '96px'}}>
              <CardHeader style={{backgroundColor: '#adf5a8'}}>
                <div className="mb-4 rounded-lg bg-green-600 p-3 w-fit" style={{backgroundColor: '#62df7b', paddingLeft: '71px'}}>
                  <Share2 className="h-6 w-6 text-white" style={{paddingLeft: '76px'}} />
                </div>
                <CardTitle className="text-green-800">Formulário de Empréstimo de Livro</CardTitle>
                <CardDescription className="text-gray-600">
                  Todos os campos marcados com * são obrigatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      Nome Completo *
                    </label>
                    <Input
                      type="text"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="border-2 border-green-200 focus:border-green-600 bg-white"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="border-2 border-green-200 focus:border-green-600 bg-white"
                      required
                    />
                  </div>

                  {/* Instituição */}
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      Instituição *
                    </label>
                    <Input
                      type="text"
                      placeholder="Nome da sua escola/universidade"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="border-2 border-green-200 focus:border-green-600 bg-white"
                      required
                    />
                  </div>

                  {/* Título do Livro */}
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      Título do Livro *
                    </label>
                    <Input
                      type="text"
                      placeholder="Título do livro ou material"
                      value={formData.bookTitle}
                      onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                      className="border-2 border-green-200 focus:border-green-600 bg-white"
                      required
                    />
                  </div>

                  {/* Autor */}
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      Autor (opcional)
                    </label>
                    <Input
                      type="text"
                      placeholder="Nome do autor"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="border-2 border-green-200 focus:border-green-600 bg-white"
                    />
                  </div>

                  {/* Data de Retirada */}
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      Data de Retirada *
                    </label>
                    <Input
                      type="date"
                      value={formData.withdrawalDate}
                      onChange={(e) => setFormData({ ...formData, withdrawalDate: e.target.value })}
                      className="border-2 border-green-200 focus:border-green-600 bg-white"
                      required
                    />
                  </div>

                  {/* Data de Devolução */}
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      Data de Devolução *
                    </label>
                    <Input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      className="border-2 border-green-200 focus:border-green-600 bg-white"
                      min={formData.withdrawalDate}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={createBookLoan.isPending}
                    className="w-full bg-green-600 text-white hover:bg-green-700"
                  >
                    {createBookLoan.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Solicitar Empréstimo de Livro"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Separador */}
      <div className="border-t-4 border-green-600 my-8"></div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container text-center">
          <p className="mb-2" style={{marginTop: '123px'}}>LAPEQ-UFOB - Laboratório de Pesquisas em Ensino de Química</p>
          <p className="text-gray-400" style={{display: 'none'}}>Universidade Federal do Oeste da Bahia</p>
        </div>
      </footer>
    </div>
  );
}
